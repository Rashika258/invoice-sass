"use client";

import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoiceExport({ invoice }: { invoice: any }) {
  async function exportPdf() {
    const el = document.getElementById('invoice-pdf');
    if (!el) return;
    const canvas = await html2canvas(el as HTMLElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = (pdf as any).getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice.invoiceNumber || invoice.id}.pdf`);
  }

  return (
    <button onClick={exportPdf} className="px-3 py-2 bg-indigo-600 text-white rounded">Export PDF</button>
  );
}
