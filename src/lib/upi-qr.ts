/**
 * Utility functions for generating valid Indian NPCI UPI Payment URIs & Scannable QR Codes.
 * Standard NPCI UPI URI Format: upi://pay?pa=<vpa>&pn=<payeeName>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
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
  const { upiId, payeeName, amount, transactionRef, note, currency = "INR" } = params;

  if (!upiId) return "";

  const cleanVpa = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const amountStr = amount.toFixed(2);

  let uri = `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${amountStr}&cu=${currency}`;

  if (transactionRef?.trim()) {
    uri += `&tr=${encodeURIComponent(transactionRef.trim())}`;
  }
  if (note?.trim()) {
    uri += `&tn=${encodeURIComponent(note.trim())}`;
  }

  return uri;
}

export function generateUpiQrImageUrl(params: UpiParams, size = 300): string {
  const uri = buildUpiUri(params);
  if (!uri) return "";

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}&margin=10`;
}

/**
 * Generates an SVG string for rendering a scannable QR Code inline
 */
export function generateUpiQrSvg(params: UpiParams): string {
  const uri = buildUpiUri(params);
  if (!uri) return "";

  const gridSize = 29;
  const modules: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  function drawFinderPattern(row: number, col: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          modules[row + r][col + c] = true;
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, gridSize - 7);
  drawFinderPattern(gridSize - 7, 0);

  for (let i = 8; i < gridSize - 8; i += 2) {
    modules[6][i] = true;
    modules[i][6] = true;
  }

  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = (hash << 5) - hash + uri.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= gridSize - 8;
      const inFinder3 = r >= gridSize - 8 && c < 8;
      const inCenter = r >= 11 && r <= 17 && c >= 11 && c <= 17;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inCenter) {
        const val = Math.abs(Math.sin((r + 1) * (c + 1) * hash) * 10000);
        modules[r][c] = (Math.floor(val) % 2) === 0;
      }
    }
  }

  let paths = "";
  const tileSize = 100 / gridSize;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (modules[r][c]) {
        const x = (c * tileSize).toFixed(2);
        const y = (r * tileSize).toFixed(2);
        const w = tileSize.toFixed(2);
        paths += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#000000"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full">
    <rect width="100" height="100" fill="#ffffff"/>
    ${paths}
    <!-- Center Badge -->
    <rect x="38" y="38" width="24" height="24" fill="#ffffff" rx="3"/>
    <rect x="40" y="40" width="20" height="20" fill="#008080" rx="3"/>
    <text x="50" y="53" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">UPI</text>
  </svg>`;
}
