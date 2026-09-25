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
const missingOnClick = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((l, i) => {
    if (l.includes('<button') && !l.includes('disabled')) {
      const block = lines.slice(i, i + 5).join(' ');
      if (!block.includes('onClick=') && !block.includes('type="submit"')) {
        missingOnClick.push({ file: f, line: i + 1, code: l.trim() });
      }
    }
  });
});

console.log(`Found ${missingOnClick.length} <button> tags missing onClick attribute:\n`);
missingOnClick.forEach(m => {
  console.log(`${m.file}:${m.line} -> ${m.code}`);
});
