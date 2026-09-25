const fs = require('fs');
const path = require('path');

// Extract hrefs from sidebar
const sidebarPath = path.join('src', 'components', 'layout', 'app-sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

const hrefRegex = /href:\s*["']([^"']+)["']/g;
let match;
const hrefs = new Set();

while ((match = hrefRegex.exec(sidebarContent)) !== null) {
  const href = match[1];
  if (!href.startsWith('http')) {
    hrefs.add(href);
  }
}

// Add common app routes
[
  '/dashboard',
  '/invoices',
  '/invoices/new',
  '/customers',
  '/items',
  '/payments',
  '/expenses',
  '/purchases',
  '/purchases/new',
  '/estimates',
  '/estimates/new',
  '/proforma',
  '/proforma/new',
  '/payment-in',
  '/payment-out',
  '/sale-orders',
  '/sale-orders/new',
  '/challans',
  '/challans/new',
  '/credit-notes',
  '/credit-notes/new',
  '/debit-notes',
  '/debit-notes/new',
  '/purchase-orders',
  '/purchase-orders/new',
  '/pos',
  '/grow/online-store',
  '/grow/whatsapp-marketing',
  '/grow/marketing-tools',
  '/employees',
  '/attendance',
  '/attendance/kiosk',
  '/cash-bank/banks',
  '/cash-bank/cash',
  '/cash-bank/cheques',
  '/cash-bank/loans',
  '/accounting',
  '/accounting/vouchers',
  '/accounting/ledgers',
  '/accounting/daybook',
  '/accounting/trial-balance',
  '/accounting/profit-loss',
  '/accounting/balance-sheet',
  '/analytics',
  '/reports',
  '/ca-portal',
  '/compliance',
  '/sync-share',
  '/sync-share/auto-backup',
  '/sync-share/computer',
  '/sync-share/drive',
  '/sync-share/restore',
  '/utilities/import-items',
  '/utilities/setup-business',
  '/utilities/accountant-access',
  '/utilities/barcode-generator',
  '/utilities/bulk-update',
  '/utilities/import-parties',
  '/utilities/track-salesmen',
  '/utilities/export-items',
  '/utilities/verify-data',
  '/utilities/close-fy',
  '/tally',
  '/settings',
  '/plans',
  '/work-queue',
  '/audit-logs',
  '/system-health',
  '/settings-history'
].forEach(h => hrefs.add(h));

function routeToFilePath(route) {
  // Strip query strings or trailing slashes
  let cleanRoute = route.split('?')[0].replace(/\/$/, '');
  if (cleanRoute === '') cleanRoute = '/dashboard';

  // Search under src/app/(dashboard)/ or src/app/
  const relativePath = cleanRoute.substring(1);
  const possiblePaths = [
    path.join('src', 'app', '(dashboard)', relativePath, 'page.tsx'),
    path.join('src', 'app', relativePath, 'page.tsx'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const missingRoutes = [];
const existingRoutes = [];

hrefs.forEach(route => {
  const file = routeToFilePath(route);
  if (file) {
    existingRoutes.push({ route, file });
  } else {
    missingRoutes.push(route);
  }
});

console.log(`Found ${hrefs.size} total routes tested.`);
console.log(`Existing: ${existingRoutes.length}`);
console.log(`Missing (${missingRoutes.length}):\n`);
missingRoutes.forEach(r => console.log(`❌ ${r}`));
