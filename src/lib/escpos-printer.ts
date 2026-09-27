export interface ReceiptLineItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ReceiptData {
  companyName: string;
  companyAddress?: string;
  phone?: string;
  invoiceNumber: string;
  date: string;
  customerName?: string;
  items: ReceiptLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMode: string;
}

/**
 * Generate ESC/POS raw byte string for silent thermal receipt printing (80mm / 58mm)
 */
export function generateEscPosReceiptBytes(data: ReceiptData): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  // ESC @: Initialize printer
  buffer.push(0x1b, 0x40);

  // ESC a 1: Center align
  buffer.push(0x1b, 0x61, 0x01);

  // GS ! 0x11: Double height & double width header
  buffer.push(0x1d, 0x21, 0x11);
  buffer.push(...encoder.encode(`${data.companyName}\n`));

  // GS ! 0x00: Normal font size
  buffer.push(0x1d, 0x21, 0x00);
  if (data.companyAddress) buffer.push(...encoder.encode(`${data.companyAddress}\n`));
  if (data.phone) buffer.push(...encoder.encode(`Ph: ${data.phone}\n`));

  buffer.push(...encoder.encode("================================\n"));

  // ESC a 0: Left align
  buffer.push(0x1b, 0x61, 0x00);
  buffer.push(...encoder.encode(`Bill No: ${data.invoiceNumber}\n`));
  buffer.push(...encoder.encode(`Date   : ${data.date}\n`));
  if (data.customerName) buffer.push(...encoder.encode(`Customer: ${data.customerName}\n`));

  buffer.push(...encoder.encode("--------------------------------\n"));
  buffer.push(...encoder.encode("Item            Qty   Price  Amt\n"));
  buffer.push(...encoder.encode("--------------------------------\n"));

  for (const item of data.items) {
    const name = item.name.padEnd(14).slice(0, 14);
    const qty = String(item.qty).padStart(4);
    const price = String(item.price).padStart(6);
    const total = String(item.total).padStart(6);
    buffer.push(...encoder.encode(`${name}${qty}${price}${total}\n`));
  }

  buffer.push(...encoder.encode("--------------------------------\n"));

  // ESC a 2: Right align
  buffer.push(0x1b, 0x61, 0x02);
  buffer.push(...encoder.encode(`Subtotal: ${data.subtotal.toFixed(2)}\n`));
  buffer.push(...encoder.encode(`Tax: ${data.tax.toFixed(2)}\n`));

  // GS ! 0x10: Double height total
  buffer.push(0x1d, 0x21, 0x10);
  buffer.push(...encoder.encode(`TOTAL: RS. ${data.total.toFixed(2)}\n`));
  buffer.push(0x1d, 0x21, 0x00);

  buffer.push(...encoder.encode(`Payment: ${data.paymentMode}\n`));

  // ESC a 1: Center align footer
  buffer.push(0x1b, 0x61, 0x01);
  buffer.push(...encoder.encode("\nThank You! Visit Again\n\n\n"));

  // GS V 65 0: Full Paper Cut
  buffer.push(0x1d, 0x56, 0x41, 0x00);

  return new Uint8Array(buffer);
}
