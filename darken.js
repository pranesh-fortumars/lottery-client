import fs from 'fs';
import path from 'path';

function replaceInDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/text-slate-800/g, 'text-black');
      content = content.replace(/text-slate-700/g, 'text-slate-900');
      content = content.replace(/border-slate-200/g, 'border-slate-400');
      content = content.replace(/border-slate-300/g, 'border-slate-500');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('./src');
console.log('Done darkening.');
