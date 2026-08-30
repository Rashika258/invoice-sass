"use client";

import React, { useEffect, useRef, useState } from "react";
import { getInvoice } from "../lib/storage";
import type { Invoice } from "../lib/invoices";
import { calculateSubtotal, calculateTaxAmount, calculateTotal } from "../lib/invoices";
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

  async function exportPdf() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const imgProps = (pdf as any).getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice.number || invoice.id}.pdf`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={exportPdf} className="px-3 py-2 bg-indigo-600 text-white rounded">Export PDF</button>
      </div>

      <div ref={ref} className="p-6 bg-white rounded shadow">
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold">{invoice.number || 'Invoice'}</h3>
            <div className="text-sm text-zinc-600">Date: {invoice.date}</div>
            <div className="text-sm text-zinc-600">Due: {invoice.dueDate}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">From</div>
            <div className="text-sm">{invoice.from}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-semibold">Bill to</div>
          <div className="text-sm">{invoice.to}</div>
        </div>

        <table className="w-full mb-6 table-fixed">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Description</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Rate</th>
              <th className="pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="py-2">{it.description}</td>
                <td className="py-2">{it.quantity}</td>
                <td className="py-2">{it.rate.toFixed(2)}</td>
                <td className="py-2">{(it.quantity * it.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{total.toFixed(2)}</span></div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6">
            <div className="font-semibold">Notes</div>
            <div className="text-sm">{invoice.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
