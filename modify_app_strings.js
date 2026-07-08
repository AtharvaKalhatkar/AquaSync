const fs = require('fs');
const path = require('path');

const files = [
  'js/backup.js',
  'js/bills.js',
  'js/customers.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Bhairavnath Cool Aqua strings
  content = content.replace(/'Bhairavnath Cool Aqua'/g, "(localStorage.getItem('biz_name') || 'Aqua Sync Demo')");
  content = content.replace(/BHAIRAVNATH COOL AQUA/g, "${(localStorage.getItem('biz_name') || 'AQUA SYNC DEMO').toUpperCase()}");
  content = content.replace(/Bhairavnath Cool Aqua/g, "${localStorage.getItem('biz_name') || 'Aqua Sync Demo'}");
  
  // Replace UPI links
  content = content.replace(/upi:\/\/pay\?pa=[^&]+&pn=[^&]+&am=\$\{([^}]+)\}&cu=INR/g, "upi://pay?pa=${localStorage.getItem('biz_upi') || 'demo@ybl'}&pn=${encodeURIComponent(localStorage.getItem('biz_name') || 'Aqua Sync Demo')}&am=${$1}&cu=INR");
  
  // Replace Bank Details in bills.js
  if (file.includes('bills.js')) {
    content = content.replace(/A\/c Name: \$\{localStorage.getItem\('biz_name'\) \|\| 'Aqua Sync Demo'\}/g, "A/c Name: ${localStorage.getItem('biz_name') || 'Aqua Sync Demo'}");
    // Also remove the specific bank details if we want a demo
    content = content.replace(/<div>Bank: LONAVALA SAHAKARI BANK LTD.<\/div><div>Branch: Talawade<\/div><div>A\/c No: 004002100000888<\/div><div>IFSC: HDFC0CLSABL<\/div>/g, "<div>Bank: Demo Bank</div><div>A/c No: 1234567890</div>");
    
    // Replace Phone numbers
    content = content.replace(/Mob: 8888355656 \/ 7030355656/g, "Mob: ${localStorage.getItem('biz_phone') || '9876543210'}");
  }

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Strings updated.');
