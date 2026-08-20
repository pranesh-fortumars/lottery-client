const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Darken amber text
    content = content.replace(/text-amber-600/g, 'text-amber-800');
    content = content.replace(/text-amber-700/g, 'text-amber-900');
    content = content.replace(/bg-amber-500 hover:bg-amber-600/g, 'bg-amber-600 hover:bg-amber-700');
    
    // Darken emerald/green text on light backgrounds if any
    content = content.replace(/text-emerald-400/g, 'text-emerald-600');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
