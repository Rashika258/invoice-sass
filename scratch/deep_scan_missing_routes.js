const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      results = results.concat(walk(p));
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      results.push(p);
    }
  });
  return results;
}

const files = walk('src');
const routeSet = new Set();

const routePatterns = [
  /href=["'](\/[a-zA-Z0-9_\-\/]+)["']/g,
  /push\(["'](\/[a-zA-Z0-9_\-\/]+)["']\)/g,
  /replace\(["'](\/[a-zA-Z0-9_\-\/]+)["']\)/g,
  /action=["'](\/[a-zA-Z0-9_\-\/]+)["']/g,
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  routePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const r = match[1];
      if (!r.startsWith('/api') && !r.startsWith('/_next')) {
        routeSet.add(r);
      }
    }
  });
});

function routeExists(route) {
  let cleanRoute = route.split('?')[0].replace(/\/$/, '');
  if (cleanRoute === '') return true;

  // Handle dynamic param segments e.g. /invoices/123/edit -> /invoices/[id]/edit
  const segments = cleanRoute.substring(1).split('/');
  
  function checkDir(baseDir, segIdx) {
    if (segIdx >= segments.length) {
      return fs.existsSync(path.join(baseDir, 'page.tsx'));
    }

    const seg = segments[segIdx];
    // Exact match dir
    const exact = path.join(baseDir, seg);
    if (fs.existsSync(exact) && checkDir(exact, segIdx + 1)) return true;

    // Dynamic match dir e.g. [id] or [slug]
    if (fs.existsSync(baseDir)) {
      const children = fs.readdirSync(baseDir);
      for (const child of children) {
        if (child.startsWith('[') && child.endsWith(']')) {
          const dynPath = path.join(baseDir, child);
          if (fs.statSync(dynPath).isDirectory() && checkDir(dynPath, segIdx + 1)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  const bases = [
    path.join('src', 'app', '(dashboard)'),
    path.join('src', 'app', '(auth)'),
    path.join('src', 'app'),
  ];

  return bases.some(b => checkDir(b, 0));
}

const missing = [];
const existing = [];

Array.from(routeSet).sort().forEach(r => {
  if (routeExists(r)) {
    existing.push(r);
  } else {
    missing.push(r);
  }
});

console.log(`Total unique app routes found in codebase: ${routeSet.size}`);
console.log(`Existing routes: ${existing.length}`);
console.log(`Missing routes (${missing.length}):\n`);
missing.forEach(r => console.log(`❌ ${r}`));
