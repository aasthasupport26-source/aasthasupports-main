const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.match(/\.(ts|tsx|js|cjs|mjs)$/)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const legacyDomain = ['aasthasupport', 'com'].join('.');
      if (content.includes(legacyDomain)) {
        fs.writeFileSync(fullPath, content.replace(new RegExp(`${legacyDomain.replace('.', '\\.')}\\b`, 'g'), 'aasthasupports.com'));
        console.log('Fixed', fullPath);
      }
    }
  });
}
replaceInDir('./src');
