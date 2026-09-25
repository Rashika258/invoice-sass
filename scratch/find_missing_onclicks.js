const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(walk(p));
    } else if (p.endsWith('.tsx') || p.endsWith('.jsx')) {
      results.push(p);
    }
  });
  return results;
}

const files = walk('src');
const missing = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((l, i) => {
    if (l.includes('<button') || l.includes('<Button')) {
      const block = lines.slice(i, i + 6).join(' ');
      const hasOnClick = block.includes('onClick');
      const hasSubmit = block.includes('type="submit"');
      const hasAsChild = block.includes('asChild');
      const hasRender = block.includes('render=');

      if (!hasOnClick && !hasSubmit && !hasAsChild && !hasRender) {
        missing.push({ file: f, line: i + 1, code: l.trim() });
      }
    }
  });
});

console.log(`Found ${missing.length} potential buttons without onClick or submit action:\n`);
missing.forEach(m => {
  console.log(`${m.file}:${m.line} -> ${m.code}`);
});
