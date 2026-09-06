const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.match(/\.(ts|tsx|js|cjs|mjs)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('aasthasupport.com')) {
        fs.writeFileSync(fullPath, content.replace(/aasthasupport\.com/g, 'aasthasupports.com'));
        console.log('Fixed', fullPath);
      }
    }
  });
}
replaceInDir('./src');
