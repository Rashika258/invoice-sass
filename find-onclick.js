const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const hasUseClient = content.slice(0, 200).includes('"use client"') || content.slice(0, 200).includes("'use client'");
  if (!hasUseClient && content.includes('onClick')) {
    console.log('SERVER COMPONENT WITH ONCLICK:', f);
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('onClick')) {
        console.log('  Line ' + (idx + 1) + ': ' + l.trim());
      }
    });
  }
});
