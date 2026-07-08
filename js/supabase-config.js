// ==========================================================
// 100% OFFLINE LOCALSTORAGE DATABASE FOR DEMO MODE
// Completely disconnected from Cloud.
// ==========================================================

const SUPABASE_URL = 'demo';
const SUPABASE_ANON_KEY = 'demo';

// Helper to get local table
function getLocalTable(table) {
  try {
    const data = localStorage.getItem('demo_db_' + table);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// Helper to save local table
function saveLocalTable(table, data) {
  localStorage.setItem('demo_db_' + table, JSON.stringify(data));
}

// Mock Supabase Client
window.supabase = {
  from: (table) => {
    return {
      select: (columns) => {
        return {
          order: (orderCol, opts) => {
            return {
              limit: (limitAmt) => {
                let data = getLocalTable(table);
                if (opts && !opts.ascending) data = data.reverse();
                if (limitAmt) data = data.slice(0, limitAmt);
                return Promise.resolve({ data, error: null });
              },
              then: (resolve) => resolve({ data: getLocalTable(table), error: null })
            };
          },
          eq: (col, val) => {
            let data = getLocalTable(table).filter(r => r[col] == val);
            return Promise.resolve({ data, error: null });
          },
          in: (col, vals) => {
            let data = getLocalTable(table).filter(r => vals.includes(r[col]));
            return Promise.resolve({ data, error: null });
          },
          then: (resolve) => resolve({ data: getLocalTable(table), error: null })
        };
      },
      insert: (record) => {
        return new Promise(resolve => {
          setTimeout(() => {
            let data = getLocalTable(table);
            
            // Auto-increment ID if not provided
            if (!record.id) {
              const maxId = data.reduce((max, r) => (r.id > max ? r.id : max), 0);
              record.id = maxId + 1;
            }
            
            data.push(record);
            saveLocalTable(table, data);
            
            // App relies on some caches
            if (typeof App !== 'undefined') App.toast('Saved locally', 'success');
            resolve({ data: [record], error: null });
          }, 100);
        });
      },
      update: (record) => {
        return {
          eq: (col, val) => {
             return new Promise(resolve => {
                let data = getLocalTable(table);
                let updated = false;
                data = data.map(r => {
                  if (r[col] == val) {
                    updated = true;
                    return { ...r, ...record };
                  }
                  return r;
                });
                saveLocalTable(table, data);
                resolve({ data: updated ? [record] : [], error: null });
             });
          },
          match: (condition) => {
             return new Promise(resolve => {
                let data = getLocalTable(table);
                data = data.map(r => {
                  let match = true;
                  for (let key in condition) if (r[key] != condition[key]) match = false;
                  if (match) return { ...r, ...record };
                  return r;
                });
                saveLocalTable(table, data);
                resolve({ data: [record], error: null });
             });
          }
        };
      },
      delete: () => {
        return {
          eq: (col, val) => {
             return new Promise(resolve => {
                let data = getLocalTable(table);
                data = data.filter(r => r[col] != val);
                saveLocalTable(table, data);
                resolve({ data: [], error: null });
             });
          },
          match: (condition) => {
             return new Promise(resolve => {
                let data = getLocalTable(table);
                data = data.filter(r => {
                  let match = true;
                  for (let key in condition) if (r[key] != condition[key]) match = false;
                  return !match; // Keep if NOT match
                });
                saveLocalTable(table, data);
                resolve({ data: [], error: null });
             });
          }
        };
      }
    };
  }
};

const supabase = window.supabase;

// Mock Offline Vault since we are fully offline anyway
const OfflineVault = {
  safeWrite: async (action, table, record, condition) => {
    if (action === 'INSERT') return await supabase.from(table).insert(record);
    if (action === 'UPDATE') return await supabase.from(table).update(record).match(condition);
    if (action === 'DELETE') return await supabase.from(table).delete().match(condition);
  },
  safeInsert: async (table, record) => {
    return await supabase.from(table).insert(record);
  },
  processQueue: async () => {}
};

async function checkConnection() {
  return true; // Always "connected" to local db
}

// Ignore online/offline events
window.addEventListener('online', () => {});
