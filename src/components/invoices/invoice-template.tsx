import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { numberToWordsIndian } from "@/lib/number-to-words";
import { formatCurrency } from "@/lib/invoice-utils";
import { QrCode, Building2, CheckCircle2 } from "lucide-react";

export type TemplateId = "MODERN" | "CLASSIC" | "GST_TAX" | "THERMAL" | "ELEGANT";

type InvoiceTemplateProps = {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  currency?: string;
  logoUrl?: string | null;
  className?: string;
  templateId?: TemplateId;
};

function splitRupeesPaise(amount: number | null | undefined): { rs: string; ps: string } {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return { rs: "", ps: "" };
  }
  const rounded = Math.round(Number(amount) * 100) / 100;
  const isNeg = rounded < 0;
  const abs = Math.abs(rounded);
  const parts = abs.toFixed(2).split(".");
  const rsFormatted = Number(parts[0]).toLocaleString("en-IN");
  return {
    rs: (isNeg ? "-" : "") + rsFormatted,
    ps: parts[1] || "00",
  };
}

function SMEWLogo({ className = "", watermark = false }: { className?: string; watermark?: boolean }) {
  const strokeColor = watermark ? "#1e293b" : "#000000";
  const textColor = watermark ? "#1e293b" : "#000000";

  return (
    <svg viewBox="0 0 100 85" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(50, 36)">
        <g fill={strokeColor}>
          {[0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2].map((deg, i) => (
            <rect key={i} x="-4.5" y="-33" width="9" height="9" rx="1.5" transform={`rotate(${deg})`} />
          ))}
        </g>
        <circle r="26.5" fill={watermark ? "transparent" : "#ffffff"} stroke={strokeColor} strokeWidth="2.8" />
        <circle r="21.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
        <text
          x="0"
          y="8.5"
          fontSize="24"
          fontFamily="'Segoe UI Symbol', 'Noto Sans Devanagari', 'Arial Unicode MS', serif"
          fontWeight="bold"
          textAnchor="middle"
          fill={textColor}
        >
          ॐ
        </text>
      </g>
      <path
        d="M 17 64 C 30 68, 70 68, 83 64 L 81 77.5 C 70 81.5, 30 81.5, 19 77.5 Z"
        fill={watermark ? "transparent" : "#ffffff"}
        stroke={strokeColor}
        strokeWidth="2.2"
      />
      <text
        x="50"
        y="74.5"
        fontSize="9"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        letterSpacing="2.5"
        textAnchor="middle"
        fill={textColor}
      >
        SMEW
      </text>
    </svg>
  );
}

/* =========================================================================
   1. CLASSIC TEMPLATE (MSME Grid Layout)
   ========================================================================= */
function ClassicTemplate({ invoice, className = "" }: InvoiceTemplateProps) {
  const isInterState = invoice.isInterState;
  const isPurchase = invoice.documentType === "PURCHASE";
  const docTitle = isPurchase ? "PURCHASE BILL" : "TAX INVOICE";

  const companyName = invoice.companyName || "Sri Manjunatha Engineering Works";
  const companyAddress = invoice.companyAddress || "# 11/1, 1st Cross, 2nd Main, Ramachandrapuram, Bengaluru - 560 021.";
  const companyPhone1 = "94486 73532";
  const companyPhone2 = "73537 56924";
  const companyState = invoice.companyState || "Karnataka";
  const companyGstin = invoice.companyTaxId || "29AEZPC6364C1Z5";
  const stateCode = companyGstin ? companyGstin.substring(0, 2) : "29";

  const customerName = invoice.customer?.name || "";
  const customerAddress = invoice.customer?.address || "";
  const customerCityState = [invoice.customer?.city, invoice.customer?.state, invoice.customer?.zipCode].filter(Boolean).join(", ");
  const customerGstin = invoice.customer?.taxId || "";
  const despatchDetails = invoice.placeOfSupply || invoice.customer?.state || "";
  const formattedDate = format(new Date(invoice.issueDate), "dd-MM-yyyy");

  const subtotalSplit = splitRupeesPaise(invoice.subtotal);
  const totalSplit = splitRupeesPaise(invoice.total);
  const effectiveTaxRate = invoice.taxRate || 18;
  const halfTaxRate = effectiveTaxRate / 2;

  const cgstSplit = !isInterState && invoice.cgstAmount > 0 ? splitRupeesPaise(invoice.cgstAmount) : { rs: "—", ps: "—" };
  const sgstSplit = !isInterState && invoice.sgstAmount > 0 ? splitRupeesPaise(invoice.sgstAmount) : { rs: "—", ps: "—" };
  const igstSplit = isInterState && invoice.igstAmount > 0 ? splitRupeesPaise(invoice.igstAmount) : { rs: "—", ps: "—" };

  const minRows = 10;
  const blankRowsCount = Math.max(0, minRows - (invoice.items?.length || 0));

  return (
    <article className={`mx-auto w-full max-w-[210mm] bg-white p-3 sm:p-5 text-black font-sans leading-tight shadow-lg border border-black print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}>
      <div className="border-[2px] border-black bg-white">
        <div className="flex border-b-[2px] border-black">
          <div className="w-28 sm:w-32 shrink-0 border-r-[2px] border-black p-2 flex items-center justify-center bg-white">
            <SMEWLogo className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
          <div className="flex-1 p-2 sm:p-3 text-center flex flex-col justify-center">
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-black">{docTitle}</div>
            <h1 className="text-xl sm:text-2xl lg:text-[27px] font-black tracking-tight mt-0.5 text-[#991b1b] italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {companyName}
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold italic text-black mt-0.5">We Undertake all types of Precision Job Work &amp; Turning Components</p>
            <p className="text-[9.5px] sm:text-[10.5px] text-black font-medium mt-0.5">{companyAddress}</p>
          </div>
          <div className="w-32 sm:w-40 shrink-0 p-2 text-right text-[10px] sm:text-[11px] font-bold flex flex-col justify-start">
            <div><span className="font-extrabold">Mob :</span> {companyPhone1}</div>
            <div className="pr-0.5">{companyPhone2}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 border-b-[2px] border-black text-[11px] sm:text-xs font-bold divide-x-[2px] divide-black bg-white">
          <div className="col-span-3 px-3 py-1"><span>State : </span><span className="font-extrabold">{companyState}</span></div>
          <div className="col-span-3 px-3 py-1"><span>Code : </span><span className="font-extrabold">{stateCode}</span></div>
          <div className="col-span-6 px-3 py-1"><span>GSTIN : </span><span className="font-mono font-extrabold tracking-wider">{companyGstin}</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 border-b-[2px] border-black divide-y-[2px] md:divide-y-0 md:divide-x-[2px] divide-black">
          <div className="md:col-span-6 p-2 sm:p-2.5 text-[11px] flex flex-col justify-between space-y-1">
            <div>
              <div className="font-bold text-xs text-black">To,</div>
              <div className="font-extrabold text-sm text-black border-b border-dotted border-black/80 pb-0.5">M/s. {customerName}</div>
              <div className="text-[11px] border-b border-dotted border-black/80 py-0.5 min-h-[20px]">{customerAddress || " "}</div>
              <div className="text-[11px] border-b border-dotted border-black/80 py-0.5 min-h-[20px]">{customerCityState || " "}</div>
            </div>
            <div className="pt-1 space-y-1">
              <div className="border-b border-dotted border-black/80 pb-0.5"><span className="font-bold">Party&apos;s GSTIN : </span><span className="font-mono font-bold">{customerGstin || "Unregistered"}</span></div>
              <div className="border-b border-dotted border-black/80 pb-0.5"><span className="font-bold">Despatch Details : </span><span>{despatchDetails || "By Road / Local Delivery"}</span></div>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col divide-y-[2px] divide-black text-[10.5px] sm:text-[11px]">
            <div className="p-1.5 px-3 space-y-0.5 font-bold text-[10px] sm:text-[10.5px] bg-slate-50/40">
              <div className="flex items-center gap-1.5"><span className="font-mono font-black text-xs">[✓]</span><span>Original for Recipient</span></div>
              <div className="flex items-center gap-1.5 text-black/80"><span className="font-mono text-xs">[  ]</span><span>Duplicate for Supplier / Transporter</span></div>
            </div>
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-7 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">Invoice No.</span><span className="font-mono font-black text-sm sm:text-base text-[#b91c1c] tracking-wider">{invoice.invoiceNumber}</span></div>
              <div className="col-span-5 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">Date :</span><span className="font-mono font-bold">{formattedDate}</span></div>
            </div>
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-7 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">D.C. No.</span><span className="font-mono">{invoice.orderNumber || "—"}</span></div>
              <div className="col-span-5 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">Date :</span><span className="font-mono">{formattedDate}</span></div>
            </div>
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-6 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">E-way Bill</span><span className="font-mono truncate">{invoice.ewayBill || "—"}</span></div>
              <div className="col-span-6 p-1.5 px-2 flex items-center justify-between"><span className="font-bold">Vehicle No.</span><span className="font-mono font-bold truncate">{invoice.vehicleNumber || "—"}</span></div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] select-none z-0">
            <SMEWLogo className="w-72 h-72 sm:w-80 sm:h-80" watermark />
          </div>
          <table className="w-full border-collapse text-[11px] relative z-10">
            <thead>
              <tr className="border-b-[2px] border-black font-extrabold text-center uppercase divide-x-[2px] divide-black bg-white">
                <th className="w-10 p-1 text-center">Sl.<br />No.</th>
                <th className="p-1 px-3 text-center tracking-wider">DESCRIPTION</th>
                <th className="w-20 p-1 text-center">HSN Code</th>
                <th className="w-14 p-1 text-center">Qty</th>
                <th className="w-20 p-1 text-center">Rate</th>
                <th className="w-32 p-0 text-center">
                  <div className="border-b border-black py-0.5">Amount</div>
                  <div className="grid grid-cols-12 divide-x border-black font-bold text-[10px]">
                    <div className="col-span-8">Rs.</div>
                    <div className="col-span-4">Ps.</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/30">
              {invoice.items.map((item, index) => {
                const amtSplit = splitRupeesPaise(item.amount);
                const rateSplit = splitRupeesPaise(item.unitPrice);
                return (
                  <tr key={item.id} className="divide-x-[2px] divide-black align-top h-7">
                    <td className="p-1 text-center font-mono font-semibold">{index + 1}</td>
                    <td className="p-1 px-2 font-bold text-black">{item.description}</td>
                    <td className="p-1 text-center font-mono font-medium">{item.hsn || "—"}</td>
                    <td className="p-1 text-center font-mono font-bold">{item.quantity} {item.unit || "PCS"}</td>
                    <td className="p-1 text-right font-mono pr-2">{rateSplit.rs}.{rateSplit.ps}</td>
                    <td className="p-0">
                      <div className="grid grid-cols-12 divide-x divide-black h-full font-mono">
                        <div className="col-span-8 p-1 text-right pr-2 font-bold">{amtSplit.rs}</div>
                        <div className="col-span-4 p-1 text-center font-medium">{amtSplit.ps}</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {Array.from({ length: blankRowsCount }).map((_, idx) => (
                <tr key={`blank-${idx}`} className="divide-x-[2px] divide-black h-6">
                  <td className="p-1" /><td className="p-1" /><td className="p-1" /><td className="p-1" /><td className="p-1" />
                  <td className="p-0"><div className="grid grid-cols-12 divide-x divide-black h-full"><div className="col-span-8" /><div className="col-span-4" /></div></td>
                </tr>
              ))}
              <tr className="divide-x-[2px] divide-black h-6 border-b-[2px] border-black">
                <td className="p-1" /><td className="p-1 text-right pr-4 font-black text-[10px]">E. &amp; O. E.</td><td className="p-1" /><td className="p-1" /><td className="p-1" />
                <td className="p-0"><div className="grid grid-cols-12 divide-x divide-black h-full"><div className="col-span-8" /><div className="col-span-4" /></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-12 divide-x-[2px] divide-black border-b-[2px] border-black">
          <div className="col-span-7 sm:col-span-8 p-2.5 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] font-bold">Rupees in words : <span className="font-extrabold italic">{numberToWordsIndian(invoice.total)}</span></div>
              <div className="border-b border-dotted border-black/80 mt-2" />
            </div>
            <div className="space-y-1 text-[10.5px] font-bold text-black pt-2">
              <p>Interest @ 18% Per Annum will be charged on all invoices not paid within due date.</p>
              <p>Material once sold will not be taken back.</p>
            </div>
            <div className="pt-6 text-[11px] font-bold">Receiver Signature</div>
          </div>

          <div className="col-span-5 sm:col-span-4 flex flex-col justify-between divide-y-[2px] divide-black text-[11px]">
            <div className="divide-y divide-black">
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">Total Amount</div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">{subtotalSplit.rs}</div>
                  <div className="col-span-4 px-1 text-center">{subtotalSplit.ps}</div>
                </div>
              </div>
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">CGST @ {!isInterState ? `${halfTaxRate}%` : ""}</div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">{cgstSplit.rs}</div>
                  <div className="col-span-4 px-1 text-center">{cgstSplit.ps}</div>
                </div>
              </div>
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">SGST @ {!isInterState ? `${halfTaxRate}%` : ""}</div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">{sgstSplit.rs}</div>
                  <div className="col-span-4 px-1 text-center">{sgstSplit.ps}</div>
                </div>
              </div>
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-8 items-center bg-slate-100/50 border-t-[2px] border-b-[2px] border-black">
                <div className="col-span-6 px-2 font-black text-xs text-left">Grand Total</div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-black text-xs text-black">{totalSplit.rs}</div>
                  <div className="col-span-4 px-1 text-center font-black text-xs text-black">{totalSplit.ps}</div>
                </div>
              </div>
            </div>
            <div className="p-2 pt-3 flex flex-col justify-between min-h-[80px] text-center">
              <div className="font-bold text-xs sm:text-[13px] text-[#991b1b] italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>For {companyName}</div>
              <div className="pt-4 text-[10.5px] font-bold text-black">Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   2. MODERN CLEAN TEMPLATE (Brand Accent Header & Sleek Borderless Design)
   ========================================================================= */
function ModernTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd MMM yyyy");
  const isInterState = invoice.isInterState;

  return (
    <article className={`mx-auto w-full max-w-[210mm] bg-white p-6 text-slate-900 font-sans leading-relaxed shadow-xl rounded-2xl border border-slate-200 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}>
      {/* Brand Header Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex justify-between items-start mb-6 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/20 text-white font-black text-xs backdrop-blur-xs">
            <Building2 className="size-3.5" />
            <span>BILLORA OS</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{invoice.companyName || "Sri Manjunatha Engineering Works"}</h1>
          <p className="text-xs text-white/90">{invoice.companyAddress || "#11/1, 1st Cross, Ramachandrapuram, Bengaluru"}</p>
          <p className="text-xs font-mono font-bold text-white/80">GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}</p>
        </div>
        <div className="text-right space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-black uppercase tracking-wider shadow-xs">
            TAX INVOICE
          </span>
          <p className="text-lg font-mono font-black text-white tracking-wide mt-1">#{invoice.invoiceNumber}</p>
          <p className="text-xs text-white/90">Date: {formattedDate}</p>
        </div>
      </div>

      {/* Side-by-side Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Billed To Customer</span>
          <h3 className="font-extrabold text-sm text-slate-900">{invoice.customer?.name || "Cash Customer"}</h3>
          <p className="text-slate-600">{invoice.customer?.address || "Local Customer Address"}</p>
          <p className="font-mono text-slate-700 font-bold">GSTIN: {invoice.customer?.taxId || "Unregistered"}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Invoice Details</span>
          <p className="font-semibold text-slate-700">Place of Supply: <span className="font-bold text-slate-900">{invoice.placeOfSupply || "Karnataka"}</span></p>
          <p className="font-semibold text-slate-700">Payment Status: <span className="font-bold text-emerald-700 uppercase">{invoice.status}</span></p>
          <p className="font-mono text-slate-600">PO / Ref No: {invoice.orderNumber || "—"}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3 text-left w-12">#</th>
              <th className="p-3 text-left">Item Description</th>
              <th className="p-3 text-center w-24">HSN</th>
              <th className="p-3 text-center w-20">Qty</th>
              <th className="p-3 text-right w-24">Rate</th>
              <th className="p-3 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-medium text-slate-500">{idx + 1}</td>
                <td className="p-3 font-bold text-slate-900">{item.description}</td>
                <td className="p-3 text-center font-mono text-slate-600">{item.hsn || "—"}</td>
                <td className="p-3 text-center font-mono font-bold">{item.quantity} {item.unit || "PCS"}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section: Words & Calculations */}
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-7 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-500 text-[11px] block">Amount in Words:</span>
            <p className="font-extrabold italic text-slate-900 mt-0.5">{numberToWordsIndian(invoice.total)}</p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-emerald-900 block">UPI Instant Payment QR</span>
              <p className="text-[10px] text-emerald-700">Scan via PhonePe, GPay, Paytm, or BHIM</p>
            </div>
            <div className="size-14 rounded-lg bg-white p-1 border border-emerald-300 shadow-xs flex items-center justify-center shrink-0">
              <QrCode className="size-11 text-emerald-900" />
            </div>
          </div>
        </div>

        <div className="col-span-5 rounded-xl border border-slate-200 p-4 space-y-2 text-xs bg-slate-50">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Taxable):</span>
            <span className="font-mono font-bold">{formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          {!isInterState ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({ (invoice.taxRate || 18) / 2 }%):</span>
                <span className="font-mono">{formatCurrency(invoice.cgstAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({ (invoice.taxRate || 18) / 2 }%):</span>
                <span className="font-mono">{formatCurrency(invoice.sgstAmount, currency)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>IGST ({ invoice.taxRate || 18 }%):</span>
              <span className="font-mono">{formatCurrency(invoice.igstAmount, currency)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-emerald-700">{formatCurrency(invoice.total, currency)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   3. GST TAX DETAILED TEMPLATE (Legal GST Compliance with HSN & Bank Wire)
   ========================================================================= */
function GstTaxTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd/MM/yyyy");
  const isInterState = invoice.isInterState;

  return (
    <article className={`mx-auto w-full max-w-[210mm] bg-white p-5 text-slate-900 font-sans leading-tight shadow-xl border border-slate-300 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}>
      {/* GST Formal Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <span className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-0.5 rounded">FORM GST INV-1 • TAX INVOICE</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2 uppercase">{invoice.companyName || "Sri Manjunatha Engineering Works"}</h1>
        <p className="text-xs text-slate-600">{invoice.companyAddress || "#11/1, 1st Cross, Ramachandrapuram, Bengaluru - 560021"}</p>
        <div className="flex justify-center gap-6 text-xs font-bold text-slate-900 mt-1">
          <span>GSTIN: <span className="font-mono">{invoice.companyTaxId || "29AEZPC6364C1Z5"}</span></span>
          <span>State Code: <span className="font-mono">29 (Karnataka)</span></span>
        </div>
      </div>

      {/* Grid metadata */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-4 border border-slate-300 rounded-lg p-3 bg-slate-50">
        <div className="space-y-1">
          <p><span className="font-bold text-slate-500">Invoice No:</span> <span className="font-mono font-extrabold text-slate-900">{invoice.invoiceNumber}</span></p>
          <p><span className="font-bold text-slate-500">Invoice Date:</span> <span className="font-mono font-bold">{formattedDate}</span></p>
          <p><span className="font-bold text-slate-500">Reverse Charge (RCM):</span> <span className="font-bold text-slate-900">No</span></p>
        </div>
        <div className="space-y-1 text-right">
          <p><span className="font-bold text-slate-500">Billed Party:</span> <span className="font-extrabold text-slate-900">{invoice.customer?.name}</span></p>
          <p><span className="font-bold text-slate-500">Party GSTIN:</span> <span className="font-mono font-bold">{invoice.customer?.taxId || "Unregistered"}</span></p>
          <p><span className="font-bold text-slate-500">Place of Supply:</span> <span className="font-bold">{invoice.placeOfSupply || "Karnataka (29)"}</span></p>
        </div>
      </div>

      {/* Detailed GST Table */}
      <table className="w-full text-xs border border-slate-900 border-collapse mb-4">
        <thead>
          <tr className="bg-slate-800 text-white font-bold border-b border-slate-900 text-center">
            <th className="p-2 border-r border-slate-700 w-10">#</th>
            <th className="p-2 border-r border-slate-700 text-left">Description of Goods / Services</th>
            <th className="p-2 border-r border-slate-700 w-20">HSN/SAC</th>
            <th className="p-2 border-r border-slate-700 w-16">Qty</th>
            <th className="p-2 border-r border-slate-700 w-20">Rate</th>
            <th className="p-2 border-r border-slate-700 w-24">Taxable Value</th>
            <th className="p-2 w-24">Tax Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className="align-top">
              <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
              <td className="p-2 border-r border-slate-300 font-bold">{item.description}</td>
              <td className="p-2 border-r border-slate-300 text-center font-mono">{item.hsn || "—"}</td>
              <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{item.quantity}</td>
              <td className="p-2 border-r border-slate-300 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="p-2 border-r border-slate-300 text-right font-mono font-bold">{formatCurrency(item.amount, currency)}</td>
              <td className="p-2 text-right font-mono font-bold">{formatCurrency((item.amount * (invoice.taxRate || 18)) / 100, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bank details & Signatures */}
      <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-3 bg-slate-50">
        <div className="space-y-1">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Bank Transfer (NEFT/RTGS):</span>
          <p>Bank: <span className="font-bold">State Bank of India</span></p>
          <p>A/c No: <span className="font-mono font-bold">38291048291</span></p>
          <p>IFSC: <span className="font-mono font-bold">SBIN0004128</span></p>
        </div>
        <div className="text-right flex flex-col justify-between">
          <p className="font-extrabold text-slate-900">Total Invoice Amount: <span className="text-sm font-mono text-emerald-800">{formatCurrency(invoice.total, currency)}</span></p>
          <div className="pt-6">
            <p className="font-bold text-slate-900">For {invoice.companyName || "Sri Manjunatha Engineering Works"}</p>
            <p className="text-[10px] text-slate-500 pt-3 border-t border-slate-300 mt-1">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   4. THERMAL RECEIPT TEMPLATE (80mm / 58mm POS Counter Receipt)
   ========================================================================= */
function ThermalTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd/MM/yy HH:mm");

  return (
    <article className={`mx-auto w-full max-w-[80mm] bg-white p-3 text-black font-mono text-[10px] leading-tight shadow-md border border-slate-300 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}>
      {/* POS Header */}
      <div className="text-center space-y-1 border-b border-dashed border-black pb-2 mb-2">
        <h2 className="font-black text-xs uppercase">{invoice.companyName || "Sri Manjunatha Engg Works"}</h2>
        <p className="text-[9px]">{invoice.companyAddress || "Bengaluru - 560021"}</p>
        <p className="text-[9px]">GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}</p>
        <p className="font-bold text-[11px] pt-1">*** POS CASH RECEIPT ***</p>
      </div>

      <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2">
        <div className="flex justify-between"><span>Bill No:</span><span className="font-bold">{invoice.invoiceNumber}</span></div>
        <div className="flex justify-between"><span>Date:</span><span>{formattedDate}</span></div>
        <div className="flex justify-between"><span>Customer:</span><span className="font-bold truncate max-w-[120px]">{invoice.customer?.name}</span></div>
      </div>

      {/* Items list */}
      <table className="w-full text-left mb-2">
        <thead>
          <tr className="border-b border-black font-bold">
            <th className="pb-1">Item</th>
            <th className="text-center pb-1">Qty</th>
            <th className="text-right pb-1">Amt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-black/40">
          {invoice.items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="py-1 pr-1 font-bold">{item.description}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right font-bold">{formatCurrency(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-dashed border-black pt-2 space-y-1 text-right mb-3">
        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal, currency)}</span></div>
        <div className="flex justify-between"><span>GST Tax:</span><span>{formatCurrency(invoice.taxAmount, currency)}</span></div>
        <div className="flex justify-between font-black text-xs border-t border-black pt-1">
          <span>NET PAYABLE:</span>
          <span>{formatCurrency(invoice.total, currency)}</span>
        </div>
      </div>

      {/* Cutter & QR Footer */}
      <div className="text-center pt-2 border-t border-dashed border-black space-y-1">
        <div className="size-16 mx-auto bg-slate-100 p-1 border border-black rounded flex items-center justify-center">
          <QrCode className="size-14 text-black" />
        </div>
        <p className="text-[8px] font-bold">SCAN TO PAY VIA UPI</p>
        <p className="text-[8px] pt-1">Thank you for your business!</p>
        <p className="text-[7px] text-slate-500">----------------------------------------</p>
      </div>
    </article>
  );
}

/* =========================================================================
   5. ELEGANT CORPORATE TEMPLATE (Executive Navy / Slate Design)
   ========================================================================= */
function ElegantTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd MMMM yyyy");

  return (
    <article className={`mx-auto w-full max-w-[210mm] bg-white p-6 text-slate-800 font-sans leading-relaxed shadow-2xl rounded-xl border border-slate-200 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}>
      {/* Executive Slate Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-6 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{invoice.companyName || "Sri Manjunatha Engineering Works"}</h1>
          <p className="text-xs text-slate-300 mt-1">{invoice.companyAddress || "Ramachandrapuram, Bengaluru - 560021"}</p>
          <p className="text-xs font-mono text-amber-400 font-bold mt-1">GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">OFFICIAL INVOICE</span>
          <span className="text-xl font-mono font-black text-white">#{invoice.invoiceNumber}</span>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ISSUED BY</span>
          <p className="font-bold text-slate-900">{invoice.companyName}</p>
          <p className="text-slate-600">{invoice.companyAddress}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BILLED TO</span>
          <p className="font-extrabold text-slate-900 text-sm">{invoice.customer?.name}</p>
          <p className="text-slate-600">{invoice.customer?.address}</p>
          <p className="font-mono text-slate-700 font-bold">GSTIN: {invoice.customer?.taxId || "N/A"}</p>
        </div>
      </div>

      <table className="w-full text-xs mb-6 rounded-lg overflow-hidden border border-slate-200">
        <thead className="bg-slate-900 text-white font-bold">
          <tr>
            <th className="p-3 text-left">Item Name</th>
            <th className="p-3 text-center">Qty</th>
            <th className="p-3 text-right">Unit Price</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="p-3 font-bold text-slate-900">{item.description}</td>
              <td className="p-3 text-center font-mono">{item.quantity}</td>
              <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="p-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-slate-500">Amount in Words:</span>
          <p className="font-extrabold italic text-slate-900">{numberToWordsIndian(invoice.total)}</p>
        </div>
        <div className="text-right space-y-1">
          <span className="text-slate-500">Total Amount Payable:</span>
          <p className="text-xl font-mono font-black text-slate-900">{formatCurrency(invoice.total, currency)}</p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   MAIN EXPORT SWITCHER
   ========================================================================= */
export function InvoiceTemplate({
  invoice,
  currency = "INR",
  logoUrl,
  className = "",
  templateId = "CLASSIC",
}: InvoiceTemplateProps) {
  switch (templateId) {
    case "MODERN":
      return <ModernTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;
    case "GST_TAX":
      return <GstTaxTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;
    case "THERMAL":
      return <ThermalTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;
    case "ELEGANT":
      return <ElegantTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;
    case "CLASSIC":
    default:
      return <ClassicTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;
  }
}
