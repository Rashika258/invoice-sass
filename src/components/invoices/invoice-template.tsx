import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { formatAddress, formatCurrency } from "@/lib/invoice-utils";
import { numberToWordsIndian } from "@/lib/number-to-words";
import { generateUpiUri, getQrCodeSvgUrl } from "@/lib/qr-code";

type InvoiceTemplateProps = {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  currency?: string;
  className?: string;
};

export function InvoiceTemplate({
  invoice,
  currency = "INR",
  className = "",
}: InvoiceTemplateProps) {
  const companyAddress = formatAddress({
    address: invoice.companyAddress,
    city: invoice.companyCity,
    state: invoice.companyState,
    zipCode: invoice.companyZip,
    country: invoice.companyCountry,
  });

  const customerAddress = formatAddress({
    address: invoice.customer.address,
    city: invoice.customer.city,
    state: invoice.customer.state,
    zipCode: invoice.customer.zipCode,
    country: invoice.customer.country,
  });

  const isInterState = invoice.isInterState;
  const isPurchase = invoice.documentType === "PURCHASE";
  const docTitle = isPurchase ? "PURCHASE BILL" : "TAX INVOICE";

  const balanceDue = Math.max(invoice.total - invoice.paidAmount, 0);

  // Generate UPI URI if company phone or taxId could be used, or standard payee name
  const upiId = invoice.companyEmail?.includes("@")
    ? invoice.companyEmail
    : `${invoice.companyPhone || "9876543210"}@upi`;

  const upiUri = generateUpiUri({
    upiId,
    payeeName: invoice.companyName || "Vyapar Merchant",
    amount: invoice.total,
    transactionNote: `Invoice ${invoice.invoiceNumber}`,
    currency,
  });

  const qrUrl = getQrCodeSvgUrl(upiUri);

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-4 sm:p-6 text-[11px] leading-tight text-slate-950 shadow-md border rounded-sm print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      <div className="border-2 border-slate-900">
        {/* Header Banner */}
        <header className="border-b-2 border-slate-900 bg-slate-50/50">
          <div className="flex items-center justify-between border-b border-slate-900 px-4 py-1.5 bg-[#D32F2F] text-white">
            <span className="text-xs font-bold tracking-wider uppercase">
              {docTitle}
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase opacity-90">
              Original for Recipient
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] p-4 gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#D32F2F]">
                {invoice.companyName || "Your Business Name"}
              </h1>
              <p className="mt-1 font-medium whitespace-pre-line text-slate-700">
                {companyAddress || "Business Address, City, State"}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-800">
                {invoice.companyPhone && <span>Phone: <b>{invoice.companyPhone}</b></span>}
                {invoice.companyEmail && <span>Email: <b>{invoice.companyEmail}</b></span>}
                {invoice.companyTaxId && (
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 font-bold font-mono">
                    GSTIN: {invoice.companyTaxId}
                  </span>
                )}
                {invoice.companyState && (
                  <span>State: <b>{invoice.companyState}</b></span>
                )}
              </div>
            </div>

            {/* Vyapar Badge / Logo */}
            <div className="hidden sm:flex flex-col items-center justify-center text-center pl-4 border-l border-slate-300">
              <div className="size-12 rounded-lg bg-[#D32F2F] text-white flex items-center justify-center font-black text-2xl shadow-xs">
                V
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                Vyapar Bill
              </span>
            </div>
          </div>
        </header>

        {/* Two-Column Details: Billed To vs Invoice Metadata */}
        <section className="grid grid-cols-1 md:grid-cols-2 border-b-2 border-slate-900 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
          {/* Customer / Party details */}
          <div className="p-3 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isPurchase ? "Supplier / Billed By:" : "Billed To (Customer):"}
            </p>
            <p className="text-sm font-black text-slate-900">
              M/s. {invoice.customer.name}
            </p>
            <p className="whitespace-pre-line text-slate-700">
              {customerAddress || "Address not provided"}
            </p>
            <div className="pt-2 space-y-1 text-xs">
              <p>
                <span className="font-bold">GSTIN: </span>
                <span className="font-mono font-semibold">
                  {invoice.customer.taxId || "Unregistered"}
                </span>
              </p>
              {invoice.customer.phone && (
                <p>
                  <span className="font-bold">Phone: </span>
                  <span>{invoice.customer.phone}</span>
                </p>
              )}
              {invoice.placeOfSupply && (
                <p>
                  <span className="font-bold">Place of Supply: </span>
                  <span>{invoice.placeOfSupply}</span>
                </p>
              )}
            </div>
          </div>

          {/* Invoice Information */}
          <div className="divide-y divide-slate-900">
            <div className="grid grid-cols-2">
              <div className="p-2 border-r border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 block">Invoice No:</span>
                <span className="text-sm font-black text-[#D32F2F] font-mono">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="p-2">
                <span className="text-[10px] font-bold text-slate-500 block">Invoice Date:</span>
                <span className="font-bold">
                  {format(new Date(invoice.issueDate), "dd-MM-yyyy")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="p-2 border-r border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 block">Payment Due:</span>
                <span className="font-bold">
                  {format(new Date(invoice.dueDate), "dd-MM-yyyy")}
                </span>
              </div>
              <div className="p-2">
                <span className="text-[10px] font-bold text-slate-500 block">Order No:</span>
                <span>{invoice.orderNumber || "—"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="p-2 border-r border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 block">Vehicle No:</span>
                <span className="font-mono">{invoice.vehicleNumber || "—"}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] font-bold text-slate-500 block">E-Way Bill:</span>
                <span className="font-mono">{invoice.ewayBill || "—"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Items Table */}
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="border-b-2 border-slate-900 bg-slate-100 font-black text-[10px] uppercase tracking-wider text-slate-800">
            <tr>
              <th className="w-8 border-r border-slate-900 p-2 text-center">#</th>
              <th className="border-r border-slate-900 p-2">Item Description</th>
              <th className="w-16 border-r border-slate-900 p-2 text-center">HSN</th>
              <th className="w-14 border-r border-slate-900 p-2 text-right">Qty</th>
              <th className="w-12 border-r border-slate-900 p-2 text-center">Unit</th>
              <th className="w-20 border-r border-slate-900 p-2 text-right">Rate</th>
              <th className="w-14 border-r border-slate-900 p-2 text-center">GST %</th>
              <th className="w-24 p-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b-2 border-slate-900">
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="text-[11px]">
                <td className="border-r border-slate-900 p-2 text-center align-top font-mono text-slate-500">
                  {index + 1}
                </td>
                <td className="border-r border-slate-900 p-2 font-semibold text-slate-900 align-top">
                  {item.description}
                </td>
                <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600 align-top">
                  {item.hsn || "—"}
                </td>
                <td className="border-r border-slate-900 p-2 text-right font-mono font-bold align-top">
                  {item.quantity}
                </td>
                <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-600 align-top">
                  {item.unit || "PCS"}
                </td>
                <td className="border-r border-slate-900 p-2 text-right font-mono align-top">
                  {formatCurrency(item.unitPrice, currency)}
                </td>
                <td className="border-r border-slate-900 p-2 text-center font-mono align-top">
                  {item.gstRate}%
                </td>
                <td className="p-2 text-right font-mono font-black text-slate-900 align-top">
                  {formatCurrency(item.amount, currency)}
                </td>
              </tr>
            ))}

            {/* Empty filler rows for classic printed paper balance */}
            {Array.from({ length: Math.max(0, 6 - invoice.items.length) }).map((_, idx) => (
              <tr key={`blank-${idx}`} className="h-6">
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td className="border-r border-slate-900" />
                <td />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bottom Section: Words, Bank & UPI QR vs GST Totals */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_280px] divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
          {/* Left: Words, Bank details, UPI QR, Terms */}
          <div className="p-3 space-y-3">
            {/* Amount in Words */}
            <div className="rounded border bg-slate-50 p-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                Total Amount in Words:
              </span>
              <p className="font-bold text-slate-900 text-xs italic">
                {numberToWordsIndian(invoice.total)}
              </p>
            </div>

            {/* Bank details & UPI Scan to Pay */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 pt-1">
              <div className="space-y-1 text-xs">
                <p className="text-[10px] font-black uppercase text-slate-500">Bank Details for NEFT / RTGS</p>
                <p><span className="font-semibold text-slate-600">Bank Name:</span> <b>{invoice.companyName ? `${invoice.companyName} Bank` : "State Bank of India"}</b></p>
                <p><span className="font-semibold text-slate-600">A/C Number:</span> <b className="font-mono">9876543210123</b></p>
                <p><span className="font-semibold text-slate-600">IFSC Code:</span> <b className="font-mono">SBIN0001234</b></p>
                <p><span className="font-semibold text-slate-600">Branch:</span> <b>Main Branch</b></p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-2 rounded border bg-white text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="UPI QR Code"
                  className="size-20"
                />
                <span className="text-[9px] font-bold text-slate-700 mt-1">
                  Scan to Pay (UPI)
                </span>
                <span className="text-[8px] text-slate-500">
                  GPay · PhonePe · Paytm
                </span>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2 border-t text-[10px] text-slate-600">
              <span className="font-bold text-slate-800 uppercase block">Terms & Conditions:</span>
              <p className="mt-0.5">
                {invoice.terms || "1. Goods once sold will not be taken back. 2. Interest @ 18% p.a. will be charged if payment is not made within due date."}
              </p>
            </div>
          </div>

          {/* Right: Calculations */}
          <div className="text-xs divide-y divide-slate-900 bg-slate-50/40">
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-700">Taxable Subtotal</span>
              <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal, currency)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="flex justify-between p-2 text-rose-700">
                <span className="font-bold">Discount</span>
                <span className="font-mono font-semibold">-{formatCurrency(invoice.discount, currency)}</span>
              </div>
            )}

            {isInterState ? (
              <div className="flex justify-between p-2">
                <span className="font-bold text-slate-700">IGST</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.igstAmount, currency)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between p-2">
                  <span className="font-bold text-slate-700">CGST</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.cgstAmount, currency)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="font-bold text-slate-700">SGST</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.sgstAmount, currency)}</span>
                </div>
              </>
            )}

            {/* Grand Total */}
            <div className="flex justify-between p-2.5 bg-[#D32F2F]/10 text-slate-950 font-black text-sm">
              <span>Grand Total</span>
              <span className="font-mono text-base text-[#D32F2F]">
                {formatCurrency(invoice.total, currency)}
              </span>
            </div>

            {/* Paid & Balance */}
            <div className="p-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Received / Paid:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(invoice.paidAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-900">Balance Due:</span>
                <span className={`font-mono ${balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  {formatCurrency(balanceDue, currency)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Signatures */}
        <footer className="grid grid-cols-2 border-t-2 border-slate-900 text-center text-[10px]">
          <div className="p-4 pt-12 text-slate-600 border-r-2 border-slate-900 flex flex-col justify-end">
            <span className="border-t border-slate-400 pt-1 font-semibold">
              Customer&apos;s Signature
            </span>
          </div>
          <div className="p-4 pt-12 flex flex-col justify-end">
            <p className="font-black text-[#D32F2F] text-xs">
              For {invoice.companyName || "Your Company"}
            </p>
            <span className="border-t border-slate-400 pt-1 font-semibold text-slate-700 mt-8">
              Authorised Signatory
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
}
