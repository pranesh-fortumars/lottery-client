import fs from 'fs';
import path from 'path';

const searchStr = '#ff004d';
const replaceStr = '#ff3366';
const dir = './src';

function replaceInDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchStr)) {
        const newContent = content.split(searchStr).join(replaceStr);
        fs.writeFileSync(fullPath, newContent);
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDir(dir);
console.log('Done.');
