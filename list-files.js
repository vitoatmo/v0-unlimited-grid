// list-files.js

// list-files.js
const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath);
    } else {
      console.log('// ' + filepath.replace(/\\/g, '/'));
    }
  });
}

walk('app');
