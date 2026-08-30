"use client";

import React, { useEffect, useRef, useState } from "react";
import { getInvoice } from "../lib/storage";
import type { Invoice } from "../lib/invoices";
import { calculateSubtotal, calculateTaxAmount, calculateTotal, amountToWords } from "../lib/invoices";
import { defaultCompany } from "../lib/company";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Props = { id: string };

export default function InvoiceView({ id }: Props) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const found = getInvoice(id);
    setInvoice(found);
  }, [id]);

  if (!invoice) return <div className="p-6">Invoice not found</div>;

  const subtotal = calculateSubtotal(invoice.items);
  const tax = calculateTaxAmount(subtotal, invoice.taxPercent);
  const total = calculateTotal(invoice.items, invoice.taxPercent);

  // Assume intrastate: split tax into CGST/SGST equally
  const cgstPercent = invoice.taxPercent ? invoice.taxPercent / 2 : 0;
  const sgstPercent = invoice.taxPercent ? invoice.taxPercent / 2 : 0;
  const cgstAmount = (subtotal * (cgstPercent || 0)) / 100;
  const sgstAmount = (subtotal * (sgstPercent || 0)) / 100;

  async function exportPdf() {
    if (!ref.current) return;
    // Increase scale for higher DPI
    const canvas = await html2canvas(ref.current, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    // image dimensions
    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgRenderWidth = imgWidth * ratio;
    const imgRenderHeight = imgHeight * ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, imgRenderWidth, imgRenderHeight);
    pdf.save(`${invoice.number || invoice.id}.pdf`);
  }

  return (
    <div className="min-h-full py-10 px-6">
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportPdf} className="px-3 py-2 bg-indigo-600 text-white rounded">Export PDF</button>
      </div>

      <div ref={ref} className="invoice-a4 p-6 bg-white text-black" style={{ width: '842px', minHeight: '1191px', margin: '0 auto', boxSizing: 'border-box', border: '1px solid #333' }}>
        <style>{`
          .invoice-header { display:flex; justify-content:space-between; align-items:flex-start; }
          .invoice-logo { width:120px; height:120px; }
          .company-name { font-size:28px; font-weight:700; color:#7b1111; }
          .company-sub { font-size:12px; margin-top:4px; }
          .tax-invoice { text-align:center; font-weight:700; font-size:20px; }
          .meta-box { border:1px solid #333; padding:8px; font-size:12px; }
          .items-table { width:100%; border-collapse:collapse; margin-top:12px; }
          .items-table th, .items-table td { border:1px solid #333; padding:6px; font-size:12px; }
          .large-empty { height:320px; }
          .totals-box { border:1px solid #333; width:260px; padding:8px; font-size:13px; }
          .watermark { position:absolute; opacity:0.06; font-size:120px; transform:rotate(-10deg); left:50%; top:45%; transform-origin:center; }
        `}</style>

        <div style={{ position: 'relative' }}>
          {/* Watermark text */}
          <div className="watermark" aria-hidden>SMEW</div>

          <div className="invoice-header">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: 120, height: 120, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Placeholder for logo */}
                <div style={{ fontSize: 18, fontWeight: 700 }}>LOGO</div>
              </div>
            </div>

            <div style={{ flex: 1, paddingLeft: 12 }}>
              <div className="company-name">{invoice.from || defaultCompany.name}</div>
              <div className="company-sub">{defaultCompany.addressLines.join(' | ')}</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <strong>Mob:</strong> {defaultCompany.phone.join(', ')} &nbsp; <strong>GSTIN:</strong> {invoice.gstin || defaultCompany.gstin}
              </div>
            </div>

            <div style={{ width: 260, textAlign: 'right' }}>
              <div className="tax-invoice">TAX INVOICE</div>
              <div style={{ marginTop: 8 }} className="meta-box">
                <div><strong>State:</strong> {invoice.state || defaultCompany.state}</div>
                <div><strong>Code:</strong> {defaultCompany.code}</div>
                <div style={{ marginTop: 6 }}><strong>Invoice No:</strong> {invoice.number || invoice.id.slice(0,6)}</div>
                <div><strong>Date:</strong> {invoice.date}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1, border: '1px solid #333', padding: 8 }}>
              <div style={{ fontWeight: 700 }}>To / Bill To</div>
              <div style={{ minHeight: 60, whiteSpace: 'pre-wrap' }}>{invoice.to}</div>
              <div style={{ marginTop: 8 }}><strong>Party's GSTIN:</strong> {invoice.gstin || '---'}</div>
              <div style={{ marginTop: 4 }}><strong>Despatch Details:</strong> {invoice.notes || '---'}</div>
            </div>

            <div style={{ width: 320, border: '1px solid #333', padding: 8 }}>
              <div style={{ fontSize: 13 }}><strong>Invoice Info</strong></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                <div><strong>D.C. No.</strong></div>
                <div>---</div>
                <div><strong>Party's Order No.</strong></div>
                <div>---</div>
                <div><strong>E-way Bill</strong></div>
                <div>---</div>
                <div><strong>Vehicle No.</strong></div>
                <div>---</div>
              </div>
            </div>
          </div>

          <table className="items-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: '6%' }}>Sl. No</th>
                <th style={{ width: '50%' }}>DESCRIPTION</th>
                <th style={{ width: '12%' }}>HSN Code</th>
                <th style={{ width: '8%' }}>Qty</th>
                <th style={{ width: '12%' }}>Rate</th>
                <th style={{ width: '12%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr className="large-empty"><td colSpan={6} style={{ height: 320 }}></td></tr>
              ) : (
                invoice.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{idx + 1}</td>
                    <td>{it.description}</td>
                    <td>{it.hsn || ''}</td>
                    <td>{it.quantity}</td>
                    <td>{it.rate.toFixed(2)}</td>
                    <td>{(it.quantity * it.rate).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ flex: 1, border: '1px solid #333', padding: 8 }}>
              <div><strong>Rupees in words:</strong></div>
              <div style={{ minHeight: 40 }}>{amountToWords(total)}</div>

              <div style={{ marginTop: 12, fontSize: 12 }}>
                <p>Interest @ 18% Per Annum will be charged on all invoices not paid within due date.</p>
                <p>Material once sold will not be taken back.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
                <div>Receiver Signature</div>
                <div style={{ textAlign: 'right' }}>Authorised Signatory</div>
              </div>
            </div>

            <div style={{ width: 260 }}>
              <div className="totals-box">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Amount</span><span>{subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CGST @ {cgstPercent}%</span><span>{cgstAmount.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SGST @ {sgstPercent}%</span><span>{sgstAmount.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}><span>Grand Total</span><span>{total.toFixed(2)}</span></div>
              </div>

              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: '#b71c1c' }}>For {defaultCompany.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
