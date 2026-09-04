import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { formatAddress, formatCurrency } from "@/lib/invoice-utils";

type InvoiceTemplateProps = {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  currency?: string;
  className?: string;
};

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  return <p><span className="font-bold">{label}</span> {value || "-"}</p>;
}

export function InvoiceTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const companyAddress = formatAddress({ address: invoice.companyAddress, city: invoice.companyCity, state: invoice.companyState, zipCode: invoice.companyZip, country: invoice.companyCountry });
  const customerAddress = formatAddress({ address: invoice.customer.address, city: invoice.customer.city, state: invoice.customer.state, zipCode: invoice.customer.zipCode, country: invoice.customer.country });
  const cgst = invoice.taxAmount / 2;
  const sgst = invoice.taxAmount / 2;

  return (
    <article className={`mx-auto w-full max-w-[210mm] bg-white p-2 text-[11px] leading-tight text-black shadow print:max-w-none print:p-0 print:shadow-none ${className}`}>
      <div className="overflow-hidden border-2 border-black">
        <header className="border-b-2 border-black">
          <p className="py-1 text-center text-base font-black tracking-wide">TAX INVOICE</p>
          <div className="grid grid-cols-[88px_1fr] border-t border-black">
            <div className="flex min-h-24 items-center justify-center border-r-2 border-black text-center">
              <div className="text-3xl font-black text-red-900">ॐ</div>
            </div>
            <div className="px-3 py-1 text-center">
              <h1 className="text-2xl font-black tracking-wide text-red-950">{invoice.companyName}</h1>
              <p className="mt-1 font-bold">{companyAddress || "Business address"}</p>
              <p className="mt-1">Phone: {invoice.companyPhone || "-"} &nbsp; Email: {invoice.companyEmail || "-"}</p>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1fr_1.2fr] border-t border-black font-bold">
            <p className="border-r border-black px-2 py-1">State: {invoice.companyState || "-"}</p>
            <p className="border-r border-black px-2 py-1">Code: {invoice.companyState ? "-" : "-"}</p>
            <p className="px-2 py-1">GSTIN: {invoice.companyTaxId || "-"}</p>
          </div>
        </header>

        <section className="grid grid-cols-[1fr_1.05fr] border-b-2 border-black">
          <div className="min-h-36 border-r-2 border-black p-2">
            <p className="font-bold">To,</p>
            <p className="mt-1 font-bold">M/s. {invoice.customer.name}</p>
            <p className="mt-1 whitespace-pre-line">{customerAddress || "-"}</p>
            <div className="mt-3 space-y-1"><DetailLine label="Party&apos;s GSTIN:" value={invoice.customer.taxId} /><DetailLine label="Phone:" value={invoice.customer.phone} /></div>
          </div>
          <div className="divide-y-2 divide-black">
            <div className="grid grid-cols-2"><p className="border-r border-black p-2 font-bold">Invoice No. <span className="ml-2 text-base text-red-900">{invoice.invoiceNumber}</span></p><p className="p-2 font-bold">Date: {format(invoice.issueDate, "dd-MM-yyyy")}</p></div>
            <div className="grid grid-cols-2"><p className="border-r border-black p-2 font-bold">D.C. No.</p><p className="p-2 font-bold">Due Date: {format(invoice.dueDate, "dd-MM-yyyy")}</p></div>
            <div className="grid grid-cols-2"><p className="border-r border-black p-2 font-bold">Party&apos;s Order No.</p><p className="p-2 font-bold">Vehicle No.</p></div>
            <div className="grid grid-cols-2"><p className="border-r border-black p-2 font-bold">E-way Bill</p><p className="p-2 font-bold">Original for Recipient</p></div>
          </div>
        </section>

        <table className="w-full table-fixed border-collapse">
          <thead className="border-b-2 border-black"><tr className="font-black"><th className="w-9 border-r border-black p-1">Sl.<br />No.</th><th className="border-r border-black p-1">DESCRIPTION</th><th className="w-16 border-r border-black p-1">HSN<br />Code</th><th className="w-12 border-r border-black p-1">Qty</th><th className="w-16 border-r border-black p-1">Rate</th><th className="w-20 p-1">Amount<br />(Rs.)</th></tr></thead>
          <tbody>
            {invoice.items.map((item, index) => <tr key={item.id} className="border-b border-black"><td className="border-r border-black px-1 py-2 text-center align-top">{index + 1}</td><td className="border-r border-black px-2 py-2 align-top">{item.description}</td><td className="border-r border-black px-1 py-2 text-center align-top">{item.hsn || "-"}</td><td className="border-r border-black px-1 py-2 text-right align-top">{item.quantity}</td><td className="border-r border-black px-1 py-2 text-right align-top">{formatCurrency(item.unitPrice, currency)}</td><td className="px-1 py-2 text-right align-top">{formatCurrency(item.amount, currency)}</td></tr>)}
            {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, index) => <tr key={`blank-${index}`} className="h-7 border-b border-black"><td className="border-r border-black" /><td className="border-r border-black" /><td className="border-r border-black" /><td className="border-r border-black" /><td className="border-r border-black" /><td /></tr>)}
          </tbody>
        </table>

        <section className="grid grid-cols-[1fr_270px] border-t-2 border-black">
          <div className="min-h-40 border-r-2 border-black p-3"><p className="font-bold">Rupees in words:</p><p className="mt-3 border-b border-dotted border-black pb-1">{formatCurrency(invoice.total, currency)} only</p><div className="mt-10 text-[10px]">{invoice.terms || "Interest may be charged on invoices not paid within the due date."}</div></div>
          <div className="text-sm"><div className="grid grid-cols-[1fr_100px] border-b border-black"><p className="border-r border-black p-2 font-bold">Total Amount</p><p className="p-2 text-right">{formatCurrency(invoice.subtotal, currency)}</p></div><div className="grid grid-cols-[1fr_100px] border-b border-black"><p className="border-r border-black p-2 font-bold">CGST @ {invoice.taxRate / 2}%</p><p className="p-2 text-right">{formatCurrency(cgst, currency)}</p></div><div className="grid grid-cols-[1fr_100px] border-b border-black"><p className="border-r border-black p-2 font-bold">SGST @ {invoice.taxRate / 2}%</p><p className="p-2 text-right">{formatCurrency(sgst, currency)}</p></div><div className="grid grid-cols-[1fr_100px] border-b border-black"><p className="border-r border-black p-2 font-bold">IGST @ 0%</p><p className="p-2 text-right">-</p></div><div className="grid grid-cols-[1fr_100px] font-black"><p className="border-r border-black p-2">Grand Total</p><p className="p-2 text-right">{formatCurrency(invoice.total, currency)}</p></div></div>
        </section>
        <footer className="grid grid-cols-2 border-t-2 border-black text-center"><p className="p-3 pt-10">Receiver Signature</p><p className="border-l-2 border-black p-3"><span className="font-bold text-red-900">For {invoice.companyName}</span><br /><span className="inline-block pt-8">Authorised Signatory</span></p></footer>
      </div>
    </article>
  );
}
