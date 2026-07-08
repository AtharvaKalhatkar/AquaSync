// ==========================================================
// 100% OFFLINE LOCALSTORAGE DATABASE FOR DEMO MODE
// Completely disconnected from Cloud.
// ==========================================================

const SUPABASE_URL = 'demo';
const SUPABASE_ANON_KEY = 'demo';

function getLocalTable(table) {
  try {
    const data = localStorage.getItem('demo_db_' + table);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveLocalTable(table, data) {
  localStorage.setItem('demo_db_' + table, JSON.stringify(data));
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.data = getLocalTable(table);
  }
  
  select(cols, opts) {
    if (opts && opts.count) {
       this.isCount = true;
    }
    return this;
  }
  
  eq(col, val) {
    this.data = this.data.filter(r => r[col] == val);
    return this;
  }
  
  neq(col, val) {
    this.data = this.data.filter(r => r[col] != val);
    return this;
  }
  
  gt(col, val) {
    this.data = this.data.filter(r => r[col] > val);
    return this;
  }
  
  gte(col, val) {
    this.data = this.data.filter(r => r[col] >= val);
    return this;
  }
  
  lt(col, val) {
    this.data = this.data.filter(r => r[col] < val);
    return this;
  }
  
  lte(col, val) {
    this.data = this.data.filter(r => r[col] <= val);
    return this;
  }
  
  in(col, vals) {
    this.data = this.data.filter(r => vals.includes(r[col]));
    return this;
  }
  
  order(col, opts) {
    this.data.sort((a, b) => {
      let aval = a[col];
      let bval = b[col];
      if (aval < bval) return -1;
      if (aval > bval) return 1;
      return 0;
    });
    if (opts && opts.ascending === false) {
      this.data.reverse();
    }
    return this;
  }
  
  limit(amt) {
    this.data = this.data.slice(0, amt);
    return this;
  }
  
  then(resolve) {
    let result = { data: this.data, error: null };
    if (this.isCount) result.count = this.data.length;
    resolve(result);
  }
}

window.supabase = {
  from: (table) => {
    return {
      select: (cols, opts) => new MockQueryBuilder(table).select(cols, opts),
      insert: (record) => {
        return new Promise(resolve => {
            let data = getLocalTable(table);
            if (!record.id) {
              const maxId = data.reduce((max, r) => (r.id > max ? r.id : max), 0);
              record.id = maxId + 1;
            }
            // created_at mocked
            if (!record.created_at) record.created_at = new Date().toISOString();
            
            data.push(record);
            saveLocalTable(table, data);
            resolve({ data: [record], error: null });
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
                  return !match;
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

async function checkConnection() { return true; }
window.addEventListener('online', () => {});
