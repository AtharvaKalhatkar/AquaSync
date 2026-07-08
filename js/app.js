const OWNER_PIN = '1234';

const translations = {
  en: {
    home: 'Home',
    logs: 'Logs',
    clients: 'Clients',
    vault: 'Vault',
    connected: 'Connected',
    loggedToday: 'Logged Today',
    unpaidBills: 'Unpaid Bills',
    totalClients: 'Total Clients',
    todaysDeliveries: "Today's Deliveries",
    pendingInvoices: 'Pending Invoices',
    logDeliveryBtn: 'Log Delivery',
    viewClientsBtn: 'View Clients',
    logJarDropoff: 'Log jar drop-off',
    addressesPhones: 'Addresses & Phones',
    noDeliveries: 'No deliveries registered yet today.',
    allCollections: 'All collections completed!',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    items: 'items',
    localVaultLoaded: 'LOADED FROM LOCAL VAULT',
    
    // Form Inputs
    jars: 'Jars',
    bottles: 'Bottles',
    
    // Vault
    sales: 'Monthly Business Sales',
    bulkBillingBtn: 'Auto Bulk Billing (Calculations)',
    invoices: 'Invoices',
    reports: 'Report Grid',
    openPdf: 'Open Invoice PDF'
  },
  gu: {
    home: 'મુખ્ય પૃષ્ઠ',
    logs: 'લોગ્સ',
    clients: 'ગ્રાહકો',
    vault: 'તિજોરી',
    connected: 'જોડાયેલ છે',
    loggedToday: 'આજની ડિલિવરી',
    unpaidBills: 'બાકી બિલ',
    totalClients: 'કુલ ગ્રાહકો',
    todaysDeliveries: "આજની ડિલિવરી",
    pendingInvoices: 'બાકી બિલ',
    logDeliveryBtn: 'ડિલિવરી નોંધો',
    viewClientsBtn: 'ગ્રાહકો જુઓ',
    logJarDropoff: 'જાર નોંધો',
    addressesPhones: 'સરનામાં અને ફોન',
    noDeliveries: 'આજે કોઈ ડિલિવરી નોંધાયેલ નથી.',
    allCollections: 'બધી વસૂલાત પૂર્ણ થઈ ગઈ છે!',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    edit: 'ફેરફાર કરો',
    delete: 'કાઢી નાખો',
    items: 'વસ્તુઓ',
    localVaultLoaded: 'ઑફલાઇન ડેટા લોડ થયો છે',
    
    // Form Inputs
    jars: 'જાર',
    bottles: 'બોટલ',
    
    // Vault
    sales: 'માસિક વેચાણ',
    bulkBillingBtn: 'ઓટો બિલિંગ ગણતરી',
    invoices: 'બિલ / ઇન્વૉઇસ',
    reports: 'રિપોર્ટ ગ્રીડ',
    openPdf: 'ઇન્વૉઇસ PDF ખોલો'
  }
};

const App = {
  currentPage: 'Dashboard',
  currentLang: localStorage.getItem('demo_lang') || 'en',

  t(key) {
    if (translations[this.currentLang] && translations[this.currentLang][key]) {
      return translations[this.currentLang][key];
    }
    return translations['en'][key] || key;
  },

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'gu' : 'en';
    try {
      localStorage.setItem('demo_lang', this.currentLang);
    } catch(e) {}
    this.applyLanguage();
    
    // Refresh page state to render dynamic values
    if (this.currentPage === 'Dashboard' && typeof Dashboard !== 'undefined' && Dashboard.load) Dashboard.load();
    else if (this.currentPage === 'Deliveries' && typeof Deliveries !== 'undefined' && Deliveries.load) Deliveries.load();
    else if (this.currentPage === 'Customers' && typeof Customers !== 'undefined' && Customers.load) Customers.load();
    else if (this.currentPage === 'Vault') {
      const vBills = document.getElementById('vaultBillsSection');
      if (vBills && vBills.style.display !== 'none' && typeof Bills !== 'undefined' && Bills.load) {
        Bills.load();
      } else if (typeof Reports !== 'undefined' && Reports.load) {
        Reports.load();
      }
    }
  },

  applyLanguage() {
    if (typeof translations === 'undefined' || !this.currentLang || !translations[this.currentLang]) return;
    const isGu = this.currentLang === 'gu';
    const langBtnText = document.getElementById('langText');
    if (langBtnText) langBtnText.textContent = isGu ? 'EN' : 'ગુજરાતી';

    document.querySelectorAll('[data-t]').forEach(el => {
      try {
        const key = el.getAttribute('data-t');
        const translation = translations[this.currentLang][key];
        if (translation) {
          if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', translation);
          } else {
            // Check for sub elements (like icons)
            const icon = el.querySelector('i[data-lucide], svg');
            if (icon) {
              // Re-render keeping icon intact
              const iconHTML = icon.outerHTML;
              el.innerHTML = iconHTML + ' ' + translation;
            } else {
              el.textContent = translation;
            }
          }
        }
      } catch(e) {}
    });
    if (this.refreshIcons) this.refreshIcons();
  },

  navigate(page, pushHistory = true) {
    // Removed for demo version as requested

    if (pushHistory) {
      try {
        history.pushState({ page }, '', '');
      } catch (e) {}
    }

    // Transition Page Display
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(n => n.classList.remove('active'));
    
    const targetPageEl = document.getElementById('page' + page);
    if (targetPageEl) targetPageEl.classList.add('active');
    
    const targetDockIndex = ['Dashboard','Deliveries','Customers','Vault'].indexOf(page);
    const dockItems = document.querySelectorAll('.dock-item');
    if (dockItems[targetDockIndex]) dockItems[targetDockIndex].classList.add('active');
    
    this.currentPage = page;

    // Dispatch Page-Specific Revalidators
    if (page === 'Dashboard') Dashboard.load();
    else if (page === 'Deliveries') Deliveries.load();
    else if (page === 'Customers') Customers.load();
    else if (page === 'Vault') {
      // By default, trigger active subtab load (Bills/Invoices)
      this.switchVaultSubTab('bills');
    }

    // 🔥 Hydrate Vector SVG icons in view
    this.refreshIcons();
  },

  promptOwnerPin(targetPage) {
    this.showModal(`
      <div style="text-align:center; padding:10px 0;">
        <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--accent-cyan)">
          <i data-lucide="shield-lock" style="width:44px; height:44px; stroke-width:1.5px;"></i>
        </div>
        <div class="modal-title" style="justify-content:center;">Financial Security Clearance</div>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5;">
          Owner authentication required. Please enter your 4-digit security key to unlock.
        </p>
        
        <div class="form-group">
          <input type="password" id="ownerPinInput" class="form-input" 
                 placeholder="••••" maxlength="4" inputmode="numeric"
                 style="text-align:center; font-size:26px; letter-spacing:16px; font-weight:800; border:1px solid var(--border-slate-bright);"
                 onkeyup="if(event.key==='Enter') App.verifyPin('${targetPage}')">
        </div>
        
        <button class="btn btn-primary mt-16" onclick="App.verifyPin('${targetPage}')" style="width:100%">
          <i data-lucide="unlock"></i> Unlock Portal
        </button>
        <button class="btn btn-outline mt-8" onclick="App.closeModal()" style="width:100%">Cancel</button>
      </div>
    `);
    
    // Focus immediately & refresh lucide for shield-lock
    this.refreshIcons();
    setTimeout(() => {
      const el = document.getElementById('ownerPinInput');
      if (el) el.focus();
    }, 300);
  },

  verifyPin(targetPage) {
    const pinVal = document.getElementById('ownerPinInput').value;
    if (pinVal === OWNER_PIN) {
      sessionStorage.setItem('owner_authed', 'true');
      this.closeModal();
      this.toast('Security cleared successfully!', 'success');
      this.navigate(targetPage);
    } else {
      this.toast('Invalid PIN. Access Denied.', 'warning');
      const inEl = document.getElementById('ownerPinInput');
      if (inEl) {
        inEl.value = '';
        inEl.focus();
      }
    }
  },

  // Sub-navigation handler for Vault
  initTheme() {
    const saved = localStorage.getItem('demo_theme_preference');
    if (saved === 'light') {
      document.documentElement.classList.add('light-mode');
      const icon = document.querySelector('#btnTheme i');
      if (icon) icon.setAttribute('data-lucide', 'moon');
    }
  },

  toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    const icon = document.querySelector('#btnTheme i');
    if (isLight) {
      if (icon) icon.setAttribute('data-lucide', 'moon');
      localStorage.setItem('demo_theme_preference', 'light');
    } else {
      if (icon) icon.setAttribute('data-lucide', 'sun');
      localStorage.setItem('demo_theme_preference', 'dark');
    }
    this.refreshIcons();
  },

  switchVaultSubTab(tab) {
    document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    
    const billsSec = document.getElementById('vaultBillsSection');
    const reportsSec = document.getElementById('vaultReportsSection');
    const historySec = document.getElementById('vaultHistorySection');
    const backupSec = document.getElementById('vaultBackupSection');
    
    if (billsSec) billsSec.style.display = 'none';
    if (reportsSec) reportsSec.style.display = 'none';
    if (historySec) historySec.style.display = 'none';
    if (backupSec) backupSec.style.display = 'none';

    if (tab === 'bills') {
      document.getElementById('segBills').classList.add('active');
      if (billsSec) billsSec.style.display = 'block';
      if (typeof Bills !== 'undefined') Bills.load();
    } else if (tab === 'reports') {
      document.getElementById('segReports').classList.add('active');
      if (reportsSec) reportsSec.style.display = 'block';
      if (typeof Reports !== 'undefined') Reports.load();
    } else if (tab === 'history') {
      document.getElementById('segHistory').classList.add('active');
      if (historySec) historySec.style.display = 'block';
      if (typeof Reports !== 'undefined') Reports.loadHistory();
    } else if (tab === 'backup') {
      document.getElementById('segBackup').classList.add('active');
      if (backupSec) backupSec.style.display = 'block';
      if (typeof Backup !== 'undefined') Backup.load();
    }
    this.refreshIcons();
  },

  onFabClick() {
    if (this.currentPage === 'Deliveries') Deliveries.showAddForm();
    else if (this.currentPage === 'Customers') Customers.showAddForm();
    else if (this.currentPage === 'Dashboard') { 
      this.navigate('Deliveries'); 
      setTimeout(() => Deliveries.showAddForm(), 300); 
    }
    else if (this.currentPage === 'Vault') {
      this.switchVaultSubTab('bills');
    }
  },

  toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    // Custom vectorized toast structure
    const icon = type === 'warning' ? 'alert-triangle' : 'check-circle';
    t.innerHTML = `<i data-lucide="${icon}" style="width:16px; height:16px;"></i> <span>${msg}</span>`;
    t.className = 'toast-pro ' + type + ' show';
    this.refreshIcons();
    setTimeout(() => t.classList.remove('show'), 2600);
  },

  showModal(html) {
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modal').classList.add('show');
    this.refreshIcons();
  },

  closeModal() {
    document.getElementById('modal').classList.remove('show');
  },

  alert(message, type = 'info', onClose = null) {
    if (typeof type === 'function') {
      onClose = type;
      type = 'info';
    }
    
    const isMr = this.currentLang === 'mr';
    const title = isMr ? 'सूचना' : 'Notification';
    const closeText = isMr ? 'ठीक आहे' : 'Okay';
    
    let colorStyle = 'var(--accent-cyan)';
    let iconName = 'info';
    
    if (type === 'error') {
      colorStyle = 'var(--accent-rose)';
      iconName = 'alert-triangle';
    } else if (type === 'warning') {
      colorStyle = 'var(--accent-amber)';
      iconName = 'alert-circle';
    } else if (type === 'success') {
      colorStyle = 'var(--accent-emerald)';
      iconName = 'check-circle';
    }
    
    this.showModal(`
      <div style="text-align:center; padding:10px 0;">
        <div style="margin-bottom:16px; display:flex; justify-content:center; color:${colorStyle}">
          <i data-lucide="${iconName}" style="width:48px; height:48px; stroke-width:1.5px;"></i>
        </div>
        <div class="modal-title" style="justify-content:center; font-size: 16px;">${title}</div>
        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5; font-weight:600; padding:0 10px;">
          ${message}
        </p>
        
        <button class="btn btn-outline" id="btnAlertClose" style="width:100%">
          ${closeText}
        </button>
      </div>
    `);
    
    const btnClose = document.getElementById('btnAlertClose');
    if (btnClose) {
      btnClose.onclick = () => {
        this.closeModal();
        if (onClose) onClose();
      };
    }
    this.refreshIcons();
  },

  confirm(message, onConfirm) {
    const isMr = this.currentLang === 'mr';
    const title = isMr ? 'खात्री करा' : 'Confirm Action';
    const yesText = isMr ? 'होय, नक्की' : 'Yes, Proceed';
    const noText = isMr ? 'रद्द करा' : 'Cancel';
    
    this.showModal(`
      <div style="text-align:center; padding:10px 0;">
        <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--accent-rose)">
          <i data-lucide="help-circle" style="width:48px; height:48px; stroke-width:1.5px;"></i>
        </div>
        <div class="modal-title" style="justify-content:center; font-size: 16px;">${title}</div>
        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5; font-weight:600; padding:0 10px;">
          ${message}
        </p>
        
        <button class="btn btn-danger" id="btnConfirmYes" style="width:100%">
          ${yesText}
        </button>
        <button class="btn btn-outline mt-8" onclick="App.closeModal()" style="width:100%">
          ${noText}
        </button>
      </div>
    `);
    
    const btnYes = document.getElementById('btnConfirmYes');
    if (btnYes) {
      btnYes.onclick = () => {
        this.closeModal();
        if (onConfirm) onConfirm();
      };
    }
    this.refreshIcons();
  },

  refreshIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  syncAll() { this.syncNow(); },

  async syncNow() {
    const btn = document.getElementById('btnSync');
    btn.classList.add('syncing');
    document.getElementById('syncStatus').textContent = 'Syncing...';
    try {
      const ok = await checkConnection();
      if (ok) {
        document.getElementById('syncStatus').textContent = 'Connected';
        this.toast('Database cloud sync complete!');
        
        // Rehydrate current active context
        if (this.currentPage === 'Dashboard') Dashboard.load();
        else if (this.currentPage === 'Deliveries') Deliveries.load();
        else if (this.currentPage === 'Customers') Customers.load();
        else if (this.currentPage === 'Vault') {
          const isRep = document.getElementById('segReports').classList.contains('active');
          if (isRep && typeof Reports !== 'undefined') Reports.load();
          else if (typeof Bills !== 'undefined') Bills.load();
        }
      } else {
        document.getElementById('syncStatus').textContent = 'Offline';
        this.toast('Sync connection lost.', 'warning');
      }
    } catch (e) {
      document.getElementById('syncStatus').textContent = 'Sync Error';
      this.toast('Network sync halted.', 'warning');
    }
    setTimeout(() => btn.classList.remove('syncing'), 1000);
  },

  formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  },

  todayStr() {
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(new Date()); 
  },

  escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  avatarColors: ['#00e5ff','#a78bfa','#10b981','#f59e0b','#f43f5e','#38bdf8','#c084fc','#34d399'],
  getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name||'').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  },

  loadBusinessDetails() {
    const bizName = localStorage.getItem('biz_name') || 'Aqua Sync Demo';
    const docTitle = document.getElementById('docTitle');
    const display = document.getElementById('bizNameDisplay');
    const installDisplay = document.getElementById('installBizName');
    
    if (docTitle) docTitle.textContent = bizName;
    if (display) display.textContent = bizName;
    if (installDisplay) installDisplay.textContent = 'Install ' + bizName;
  },

  promptBusinessSetup() {
    this.showModal(`
      <div style="text-align:center; padding:10px 0;">
        <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--accent-cyan)">
          <i data-lucide="settings" style="width:44px; height:44px; stroke-width:1.5px;"></i>
        </div>
        <div class="modal-title" style="justify-content:center;">Welcome to Aqua Sync!</div>
        <p style="font-size:12px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5;">
          Let's set up your demo app. Enter your business details below. They will be saved to your device.
        </p>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">Business Name</label>
          <input type="text" id="setupBizName" class="form-input" placeholder="e.g. Balaji Cool Aqua" value="${localStorage.getItem('biz_name') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">Tagline (Optional)</label>
          <input type="text" id="setupBizTagline" class="form-input" placeholder="e.g. ॥ श्री स्वामी समर्थ ॥" value="${localStorage.getItem('biz_tagline') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">Business Address</label>
          <input type="text" id="setupBizAddress" class="form-input" placeholder="e.g. 123 Main St, City" value="${localStorage.getItem('biz_address') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">UPI Phone Number (For Payments)</label>
          <input type="number" id="setupBizPhone" class="form-input" placeholder="e.g. 9876543210" value="${localStorage.getItem('biz_phone') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">UPI ID (VPA)</label>
          <input type="text" id="setupBizUpi" class="form-input" placeholder="e.g. 9876543210@ybl" value="${localStorage.getItem('biz_upi') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">Bank Name (Optional)</label>
          <input type="text" id="setupBizBankName" class="form-input" placeholder="e.g. HDFC Bank" value="${localStorage.getItem('biz_bank_name') || ''}">
        </div>
        
        <div class="form-group" style="text-align:left;">
          <label class="form-label">Bank Account Number (Optional)</label>
          <input type="text" id="setupBizBankAcc" class="form-input" placeholder="e.g. 501002345678" value="${localStorage.getItem('biz_bank_acc') || ''}">
        </div>
        
        <button class="btn btn-primary mt-16" onclick="App.saveBusinessSetup()" style="width:100%">
          <i data-lucide="check"></i> Save Details
        </button>
      </div>
    `);
    this.refreshIcons();
  },

  saveBusinessSetup() {
    const name = document.getElementById('setupBizName').value.trim();
    const tagline = document.getElementById('setupBizTagline').value.trim();
    const address = document.getElementById('setupBizAddress').value.trim();
    const phone = document.getElementById('setupBizPhone').value.trim();
    const upi = document.getElementById('setupBizUpi').value.trim();
    const bankName = document.getElementById('setupBizBankName').value.trim();
    const bankAcc = document.getElementById('setupBizBankAcc').value.trim();
    
    if (!name) return this.toast('Business Name is required', 'warning');
    
    localStorage.setItem('biz_name', name);
    localStorage.setItem('biz_tagline', tagline);
    localStorage.setItem('biz_address', address);
    localStorage.setItem('biz_phone', phone);
    localStorage.setItem('biz_upi', upi);
    localStorage.setItem('biz_bank_name', bankName);
    localStorage.setItem('biz_bank_acc', bankAcc);
    localStorage.setItem('biz_setup', '1');
    
    this.loadBusinessDetails();
    this.closeModal();
    this.toast('Setup Complete!', 'success');
    setTimeout(() => this.showOnboardingGuide(), 500);
  },

  showOnboardingGuide() {
    this.showModal(`
      <div style="text-align:center; padding:10px 0;">
        <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--accent-cyan)">
          <i data-lucide="book-open" style="width:48px; height:48px; stroke-width:1.5px;"></i>
        </div>
        <div class="modal-title" style="justify-content:center; font-size:18px;">Quick Start Guide</div>
        <div style="text-align:left; font-size:13px; color:var(--text-secondary); margin-bottom:24px; line-height:1.6; max-height: 400px; overflow-y: auto; padding-right:5px;">
          <p><strong>1. Add a Customer</strong><br>Go to the <b>Clients</b> tab at the bottom and tap the "+" button to add your first customer. Set their jar and bottle rates.</p>
          <hr style="border:0; border-top:1px solid var(--border-slate); margin:10px 0;">
          <p><strong>2. Log Daily Deliveries</strong><br>On the <b>Home</b> screen, tap the big blue "+" button. Select your customer, enter the number of jars delivered, and save.</p>
          <hr style="border:0; border-top:1px solid var(--border-slate); margin:10px 0;">
          <p><strong>3. Generate Invoices</strong><br>At the end of the month, go to the <b>Vault</b> tab. Tap "Auto Bulk Billing" to automatically calculate the month's total for every customer based on their daily deliveries and rates.</p>
          <hr style="border:0; border-top:1px solid var(--border-slate); margin:10px 0;">
          <p><strong>4. Share PDFs & Collect Payments</strong><br>Tap any invoice in the Vault to open it. From there, you can share the PDF directly to WhatsApp or log a payment.</p>
        </div>
        <button class="btn btn-primary mt-8" onclick="App.closeModal()" style="width:100%">
          <i data-lucide="check-circle-2"></i> I'm Ready!
        </button>
      </div>
    `);
    this.refreshIcons();
  }
};

// Interactive overlay listeners
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) App.closeModal();
});

// Global Boot Engine
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof App !== 'undefined') {
    if (App.initTheme) App.initTheme();
    if (App.applyLanguage) App.applyLanguage();
  }
  try {
    history.replaceState({ page: 'Dashboard' }, '', '');
  } catch (e) {}
  const options = { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone: 'Asia/Kolkata' };
  const dateEl = document.getElementById('dashDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', options);
  }
  const ok = await checkConnection();
  // document.getElementById('syncStatus').textContent = ok ? 'Connected' : 'Offline Demo';
  if (typeof Dashboard !== 'undefined' && Dashboard.load) {
    Dashboard.load();
  }
  
  App.loadBusinessDetails();
  
  // 7-DAY TRIAL LOGIC
  const trialStart = localStorage.getItem('demo_trial_start');
  if (!trialStart) {
    localStorage.setItem('demo_trial_start', new Date().toISOString());
  } else {
    const start = new Date(trialStart);
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    const syncStatusEl = document.getElementById('syncStatus');
    if (diffDays >= 7) {
      if (syncStatusEl) syncStatusEl.textContent = 'Trial Expired';
      if (syncStatusEl) syncStatusEl.style.color = '#ef4444';
      App.showModal(`
        <div style="text-align:center; padding:10px 0;">
          <div style="margin-bottom:16px; display:flex; justify-content:center; color:var(--accent-rose)">
            <i data-lucide="lock" style="width:44px; height:44px; stroke-width:1.5px;"></i>
          </div>
          <div class="modal-title" style="justify-content:center;">Trial Expired</div>
          <p style="font-size:12px; color:var(--text-secondary); margin-bottom:24px; line-height:1.5;">
            Your 7-day free trial has expired. To continue using the software, please contact the developer to purchase the full version and unlock all features.
          </p>
          <a href="https://wa.me/918390768833?text=Hi,%20my%207-day%20trial%20for%20the%20Aqua%20Billing%20Software%20has%20expired.%20I%20would%20like%20to%20purchase%20the%20full%20version." target="_blank" class="btn btn-primary" style="width:100%; text-decoration:none; background:#25D366; border-color:#25D366; color:#fff;">
            <i data-lucide="message-circle"></i> Message on WhatsApp
          </a>
        </div>
      `);
      return; // Lock app
    } else {
      const msLeft = (start.getTime() + (7 * 24 * 60 * 60 * 1000)) - now.getTime();
      
      const updateTime = () => {
        const currentMsLeft = (start.getTime() + (7 * 24 * 60 * 60 * 1000)) - Date.now();
        if (currentMsLeft <= 0) {
           if (syncStatusEl) syncStatusEl.textContent = 'Trial Expired';
           return;
        }
        const d = Math.floor(currentMsLeft / (1000 * 60 * 60 * 24));
        const h = Math.floor((currentMsLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((currentMsLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        let text = 'Trial: ';
        if (d > 0) text += d + 'd ';
        text += h + 'h ' + m + 'm left';
        if (syncStatusEl) syncStatusEl.textContent = text;
      };
      
      updateTime();
      setInterval(updateTime, 60000); // update every minute
    }
  }

  if (localStorage.getItem('biz_setup') !== '1') {
    setTimeout(() => App.promptBusinessSetup(), 500);
  }
});

// Handle Back/Forward Navigation Native Gestures
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    App.navigate(event.state.page, false);
  } else {
    App.navigate('Dashboard', false);
  }
});

// Global Suggestion auto-collapser
document.addEventListener('click', function(e) {
  const list = document.getElementById('custSuggestions');
  const input = document.getElementById('custSearchInput');
  if (list && input && !input.contains(e.target) && !list.contains(e.target)) {
    list.classList.remove('show');
  }
});

/* ==========================================
   🪂 GLOBAL GLITCH CATCHER & ERROR BOUNDARIES
   ========================================== */
window.onerror = function(message, source, lineno, colno, error) {
  console.error("[🪂 Global Error Intercepted]:", message);
  return false;
};

window.onunhandledrejection = function(event) {
  console.warn("[🪂 Network Rejection Blocked]:", event.reason);
  // Silenced the toasts here so they don't pop up randomly during background syncs
};
