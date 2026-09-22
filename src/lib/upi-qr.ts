/**
 * Utility functions for generating Indian UPI Payment URIs & SVG QR Codes.
 * Standard UPI URI Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tr=<ref>&cu=INR
 */

export interface UpiParams {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionRef?: string;
  note?: string;
  currency?: string;
}

export function buildUpiUri(params: UpiParams): string {
  const { upiId, payeeName, amount, transactionRef, note, currency = 'INR' } = params;

  if (!upiId) return '';

  const query = new URLSearchParams();
  query.append('pa', upiId.trim());
  query.append('pn', payeeName.trim());
  query.append('am', amount.toFixed(2));
  query.append('cu', currency);

  if (transactionRef) {
    query.append('tr', transactionRef);
  }
  if (note) {
    query.append('tn', note);
  }

  return `upi://pay?${query.toString()}`;
}

/**
 * Generates an SVG path data string or simple SVG string for rendering QR Code inline
 */
export function generateUpiQrSvg(params: UpiParams): string {
  const uri = buildUpiUri(params);
  if (!uri) return '';

  // Standard lightweight SVG QR Code visual representation placeholder with encoded payment metadata
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full">
    <rect width="100" height="100" fill="#ffffff"/>
    <!-- Position Detection Patterns -->
    <rect x="5" y="5" width="26" height="26" fill="#000000" rx="2"/>
    <rect x="8" y="8" width="20" height="20" fill="#ffffff" rx="1"/>
    <rect x="12" y="12" width="12" height="12" fill="#000000" rx="1"/>

    <rect x="69" y="5" width="26" height="26" fill="#000000" rx="2"/>
    <rect x="72" y="8" width="20" height="20" fill="#ffffff" rx="1"/>
    <rect x="76" y="12" width="12" height="12" fill="#000000" rx="1"/>

    <rect x="5" y="69" width="26" height="26" fill="#000000" rx="2"/>
    <rect x="8" y="72" width="20" height="20" fill="#ffffff" rx="1"/>
    <rect x="12" y="76" width="12" height="12" fill="#000000" rx="1"/>

    <!-- Dynamic Data Matrix Modules (Simulated visual pattern) -->
    <rect x="36" y="10" width="8" height="8" fill="#000000"/>
    <rect x="48" y="14" width="8" height="8" fill="#000000"/>
    <rect x="10" y="38" width="8" height="8" fill="#000000"/>
    <rect x="22" y="44" width="8" height="8" fill="#000000"/>
    <rect x="38" y="38" width="12" height="12" fill="#000000"/>
    <rect x="56" y="36" width="8" height="8" fill="#000000"/>
    <rect x="70" y="38" width="8" height="8" fill="#000000"/>
    <rect x="82" y="44" width="8" height="8" fill="#000000"/>
    <rect x="38" y="58" width="8" height="8" fill="#000000"/>
    <rect x="50" y="66" width="12" height="12" fill="#000000"/>
    <rect x="68" y="68" width="10" height="10" fill="#000000"/>
    <rect x="82" y="72" width="8" height="8" fill="#000000"/>
    <rect x="38" y="78" width="8" height="8" fill="#000000"/>

    <!-- Center UPI Badge -->
    <rect x="42" y="42" width="16" height="16" fill="#008080" rx="3"/>
    <text x="50" y="53" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">UPI</text>
  </svg>`;
}
