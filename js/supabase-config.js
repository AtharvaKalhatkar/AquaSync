/*=============================================
  Supabase Configuration
  
  HOW TO SET UP:
  1. Go to https://supabase.com/dashboard
  2. Open your project (uszuutvdfavikxbyrduy)
  3. Go to Settings → API
  4. Copy the "anon public" key
  5. Replace YOUR_ANON_KEY_HERE below
=============================================*/

const SUPABASE_URL = 'https://demo.supabase.co';
const SUPABASE_ANON_KEY = 'demo_key';  // ← DEMO MODE

var supabase;

// Fast-fail fetch wrapper for instant offline loading
const fastFetch = async (url, options) => {
  throw new Error('Failed to fetch (Demo Offline Mode)');
};

try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: fastFetch }
  });
} catch (e) {
  console.error('Supabase init failed:', e);
}

// Helper: check connection
async function checkConnection() {
  try {
    const { data, error } = await supabase.from('customers').select('id', { count: 'exact', head: true });
    return !error;
  } catch { return false; }
}

/*=========================================================
  🔒 OFFLINE VAULT ARCHITECTURE
  Ensures unconditional, safe storage when signal is lost!
=========================================================*/
const OfflineVault = {
  getQueue() {
    try { return JSON.parse(localStorage.getItem('aqua_vault') || '[]'); } 
    catch { return []; }
  },
  
  saveQueue(queue) {
    localStorage.setItem('aqua_vault', JSON.stringify(queue));
  },
  
  async safeWrite(action, table, record, condition = null) {
    // Attempt direct push first
    try {
      let res;
      if (action === 'INSERT') {
        res = await supabase.from(table).insert(record);
      } else if (action === 'UPDATE') {
        res = await supabase.from(table).update(record).match(condition);
      } else if (action === 'DELETE') {
        res = await supabase.from(table).delete().match(condition);
      }
      
      const { error } = res || {};
      if (!error) return { success: true, error: null };
      
      // Check if connection issue
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.code === 'PGRST116')) {
        throw new Error("Network Fail");
      }
      return { success: false, error };
    } catch (e) {
      console.warn(`[📶 Offline Mode] Securing ${action} on ${table} in storage...`);
    }

    // Lock data into the Vault securely
    const queue = this.getQueue();
    queue.push({ action, table, record, condition, stamp: new Date().toISOString() });
    this.saveQueue(queue);

    if (typeof App !== 'undefined' && App.toast) {
      App.toast(`Offline: Saved ${action.toLowerCase()} to phone storage.`, 'warning');
    }
    
    return { success: true, error: null, offline: true };
  },
  
  uid() {
    return Math.floor(1800000000 + Math.random() * 300000000);
  },

  localMaxIdCache: {},

  async safeInsert(table, record) {
    // Try online insert first, bypassing broken auto-increment sequence by generating ID manually
    try {
      let retries = 3;
      while (retries > 0) {
        let nextId;
        if (this.localMaxIdCache[table]) {
          nextId = this.localMaxIdCache[table] + 1;
        } else {
          const maxRes = await supabase.from(table).select('id').order('id', { ascending: false }).limit(1);
          nextId = (maxRes.data && maxRes.data.length > 0) ? parseInt(maxRes.data[0].id, 10) + 1 : 1;
        }
        
        const insertRecord = { ...record, id: nextId };
        const res = await supabase.from(table).insert(insertRecord);
        const { error } = res || {};
        
        if (!error) {
          this.localMaxIdCache[table] = nextId; // Update local cache instantly on success
          return { success: true, error: null };
        }
        
        // If we hit a duplicate primary key error, our ID is stale (race condition). Clear cache and retry!
        if (error.code === '23505' && error.message && error.message.includes('_pkey')) {
          delete this.localMaxIdCache[table];
          retries--;
          continue;
        }
        
        // If it's a real DB error (like unique constraint on month/year, not network), return it
        if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
          return { success: false, error };
        }
        
        throw new Error("Network Fail"); // Drop to offline queue
      }
    } catch (e) {
      // Offline fallback: assign a local id so it can be queued
      console.warn(`[📶 Offline Mode] Securing INSERT on ${table} in storage...`);
      if (!record.id) record.id = this.uid();
      const queue = this.getQueue();
      queue.push({ action: 'INSERT', table, record, condition: null, stamp: new Date().toISOString() });
      this.saveQueue(queue);
      if (typeof App !== 'undefined' && App.toast) {
        App.toast(`Offline: Saved insert to phone storage.`, 'warning');
      }
      return { success: true, error: null, offline: true };
    }
  },

  isSyncing: false,
  async processQueue() {
    if (this.isSyncing) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    console.log(`[Vault] Processing ${queue.length} stored offline actions...`);

    const failed = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        const action = item.action || 'INSERT'; // Backwards compatibility
        let res;
        
        if (action === 'INSERT') {
          res = await supabase.from(item.table).insert(item.record);
        } else if (action === 'UPDATE') {
          res = await supabase.from(item.table).update(item.record).match(item.condition);
        } else if (action === 'DELETE') {
          res = await supabase.from(item.table).delete().match(item.condition);
        }

        const { error } = res || {};
        if (error) {
          if (error.code === '23505') { // Already exists
            syncedCount++;
          } else {
            failed.push(item);
          }
        } else {
          syncedCount++;
        }
      } catch (e) {
        failed.push(item);
      }
    }

    this.saveQueue(failed);
    this.isSyncing = false;

    if (syncedCount > 0 && typeof App !== 'undefined') {
      App.toast(`Online. Synced ${syncedCount} records to cloud!`, 'success');
      // Reload the current active screen
      if (App.currentPage === 'Dashboard' && typeof Dashboard !== 'undefined') Dashboard.load();
      else if (App.currentPage === 'Deliveries' && typeof Deliveries !== 'undefined') Deliveries.load();
      else if (App.currentPage === 'Customers' && typeof Customers !== 'undefined') Customers.load();
      else if (App.currentPage === 'Vault') {
        const isRep = document.getElementById('segReports') && document.getElementById('segReports').classList.contains('active');
        const isHist = document.getElementById('segHistory') && document.getElementById('segHistory').classList.contains('active');
        if (isRep && typeof Reports !== 'undefined') Reports.load();
        else if (isHist && typeof Reports !== 'undefined') Reports.loadHistory();
        else if (typeof Bills !== 'undefined') Bills.load();
      }
    }
  }
};

// Listeners: Trigger vault clearing immediately when signal restores
window.addEventListener('online', () => {
  console.log("🌐 Internet Restored! Clearing Offline Vault...");
  setTimeout(() => OfflineVault.processQueue(), 1500);
});

// Background Heartbeat: Double check every 25 seconds
setInterval(() => {
  if (navigator.onLine) {
    OfflineVault.processQueue();
  }
}, 25000);

