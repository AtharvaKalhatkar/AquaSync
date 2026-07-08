const fs = require('fs');
const path = require('path');

const jsDir = 'd:/A/AquaSync/js';
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).map(f => path.join(jsDir, f));

const keysToPrefix = [
  'lang',
  'theme_preference',
  'aqua_vault',
  'cache_customers',
  'cache_dues'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  keysToPrefix.forEach(key => {
    // Replace 'key' or "key" in getItem, setItem, removeItem
    const regex = new RegExp(`(['"\`])${key}(['"\`])`, 'g');
    content = content.replace(regex, `$1demo_${key}$2`);
  });
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Storage keys prefixed with demo_');
