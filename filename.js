// insert.js

const fs = require('fs');
const path = require('path');

// Mapping extension to comment style
function getComment(pathname) {
  if (pathname.endsWith('.js') || pathname.endsWith('.ts') || pathname.endsWith('.tsx')) {
    return '//';
  } else if (pathname.endsWith('.css') || pathname.endsWith('.scss')) {
    return '/*';
  } else if (pathname.endsWith('.html')) {
    return '<!--';
  } else {
    return null; // unsupported
  }
}

function getHeader(pathname) {
  const comment = getComment(pathname);
  if (!comment) return null;
  if (comment === '/*') {
    return `/* ${pathname} */\n\n`;
  }
  if (comment === '<!--') {
    return `<!-- ${pathname} -->\n\n`;
  }
  return `// ${pathname}\n\n`;
}

function hasHeader(content, header) {
  return content.startsWith(header);
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath);
    } else {
      const relativePath = filepath.replace(/\\/g, '/');
      const header = getHeader(relativePath);
      if (!header) return; // skip unsupported
      let content = fs.readFileSync(filepath, 'utf8');
      if (!hasHeader(content, header)) {
        content = header + content;
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('Updated:', relativePath);
      } else {
        console.log('Already has header:', relativePath);
      }
    }
  });
}

walk('.');
