import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { numberToWordsIndian } from "@/lib/number-to-words";

type InvoiceTemplateProps = {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  currency?: string;
  logoUrl?: string | null;
  className?: string;
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
      {/* 14 Gear Teeth */}
      <g transform="translate(50, 36)">
        <g fill={strokeColor}>
          {[0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2].map((deg, i) => (
            <rect key={i} x="-4.5" y="-33" width="9" height="9" rx="1.5" transform={`rotate(${deg})`} />
          ))}
        </g>
        {/* Gear body rings */}
        <circle r="26.5" fill={watermark ? "transparent" : "#ffffff"} stroke={strokeColor} strokeWidth="2.8" />
        <circle r="21.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
        {/* Om Symbol in center */}
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
      {/* SMEW Ribbon / Banner at bottom */}
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

export function InvoiceTemplate({
  invoice,
  className = "",
}: InvoiceTemplateProps) {
  const isInterState = invoice.isInterState;
  const isPurchase = invoice.documentType === "PURCHASE";
  const docTitle = isPurchase ? "PURCHASE BILL" : "TAX INVOICE";

  // Company Details matching physical Sri Manjunatha Engineering Works invoice
  const companyName = invoice.companyName || "Sri Manjunatha Engineering Works";
  const companyAddress = invoice.companyAddress || "# 11/1, 1st Cross, 2nd Main, Ramachandrapuram, Bengaluru - 560 021.";
  const companyPhone1 = "94486 73532";
  const companyPhone2 = "73537 56924";
  const companyState = invoice.companyState || "Karnataka";
  const companyGstin = invoice.companyTaxId || "29AEZPC6364C1Z5";
  const stateCode = companyGstin ? companyGstin.substring(0, 2) : "29";

  // Customer / Consignee details
  const customerName = invoice.customer?.name || "";
  const customerAddress = invoice.customer?.address || "";
  const customerCityState = [invoice.customer?.city, invoice.customer?.state, invoice.customer?.zipCode]
    .filter(Boolean)
    .join(", ");
  const customerGstin = invoice.customer?.taxId || "";
  const despatchDetails = invoice.placeOfSupply || invoice.customer?.state || "";

  // Date formatting
  const formattedDate = format(new Date(invoice.issueDate), "dd-MM-yyyy");

  // Amounts split into Rs. and Ps.
  const subtotalSplit = splitRupeesPaise(invoice.subtotal);
  const totalSplit = splitRupeesPaise(invoice.total);

  // Tax calculations
  const effectiveTaxRate = invoice.taxRate || 18;
  const halfTaxRate = effectiveTaxRate / 2;

  const cgstSplit = !isInterState && invoice.cgstAmount > 0
    ? splitRupeesPaise(invoice.cgstAmount)
    : { rs: "—", ps: "—" };

  const sgstSplit = !isInterState && invoice.sgstAmount > 0
    ? splitRupeesPaise(invoice.sgstAmount)
    : { rs: "—", ps: "—" };

  const igstSplit = isInterState && invoice.igstAmount > 0
    ? splitRupeesPaise(invoice.igstAmount)
    : { rs: "—", ps: "—" };

  // Fill up blank rows to maintain authentic bill height
  const minRows = 10;
  const blankRowsCount = Math.max(0, minRows - (invoice.items?.length || 0));

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-3 sm:p-5 text-black font-sans leading-tight shadow-lg border border-black print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      {/* Outer Heavy Border Box */}
      <div className="border-[2px] border-black bg-white">
        {/* =========================================================================
            1. TOP HEADER: LOGO, TAX INVOICE, COMPANY TITLE, ADDRESS & PHONE
            ========================================================================= */}
        <div className="flex border-b-[2px] border-black">
          {/* Left: SMEW Logo Emblem Box */}
          <div className="w-28 sm:w-32 shrink-0 border-r-[2px] border-black p-2 flex items-center justify-center bg-white">
            <SMEWLogo className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>

          {/* Center: TAX INVOICE & Company Details */}
          <div className="flex-1 p-2 sm:p-3 text-center flex flex-col justify-center">
            <div className="text-xs sm:text-sm font-black tracking-wider uppercase text-black">
              {docTitle}
            </div>

            {/* Sri Manjunatha Engineering Works in signature red calligraphy style */}
            <h1
              className="text-xl sm:text-2xl lg:text-[27px] font-black tracking-tight mt-0.5 text-[#991b1b] italic"
              style={{
                fontFamily: "Georgia, 'Times New Roman', 'Apple Chancery', 'Brush Script MT', serif",
              }}
            >
              {companyName}
            </h1>

            <p className="text-[10px] sm:text-[11px] font-bold italic text-black mt-0.5">
              We Undertake all types of Precision Job Work &amp; Turning Components
            </p>

            <p className="text-[9.5px] sm:text-[10.5px] text-black font-medium mt-0.5">
              {companyAddress}
            </p>
          </div>

          {/* Right: Mobile Numbers */}
          <div className="w-32 sm:w-40 shrink-0 p-2 text-right text-[10px] sm:text-[11px] font-bold flex flex-col justify-start">
            <div>
              <span className="font-extrabold">Mob :</span> {companyPhone1}
            </div>
            <div className="pr-0.5">{companyPhone2}</div>
          </div>
        </div>

        {/* =========================================================================
            2. STATE / CODE / GSTIN HORIZONTAL BAR
            ========================================================================= */}
        <div className="grid grid-cols-12 border-b-[2px] border-black text-[11px] sm:text-xs font-bold divide-x-[2px] divide-black bg-white">
          <div className="col-span-3 px-3 py-1">
            <span>State : </span>
            <span className="font-extrabold">{companyState}</span>
          </div>
          <div className="col-span-3 px-3 py-1">
            <span>Code : </span>
            <span className="font-extrabold">{stateCode}</span>
          </div>
          <div className="col-span-6 px-3 py-1">
            <span>GSTIN : </span>
            <span className="font-mono font-extrabold tracking-wider">{companyGstin}</span>
          </div>
        </div>

        {/* =========================================================================
            3. PARTY DETAILS (LEFT) & INVOICE METADATA GRID (RIGHT)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b-[2px] border-black divide-y-[2px] md:divide-y-0 md:divide-x-[2px] divide-black">
          {/* Left Column: Consignee / Billed To */}
          <div className="md:col-span-6 p-2 sm:p-2.5 text-[11px] flex flex-col justify-between space-y-1">
            <div>
              <div className="font-bold text-xs text-black">To,</div>
              <div className="font-extrabold text-sm text-black border-b border-dotted border-black/80 pb-0.5">
                M/s. {customerName}
              </div>
              <div className="text-[11px] border-b border-dotted border-black/80 py-0.5 min-h-[20px]">
                {customerAddress || " "}
              </div>
              <div className="text-[11px] border-b border-dotted border-black/80 py-0.5 min-h-[20px]">
                {customerCityState || " "}
              </div>
            </div>

            <div className="pt-1 space-y-1">
              <div className="border-b border-dotted border-black/80 pb-0.5">
                <span className="font-bold">Party&apos;s GSTIN : </span>
                <span className="font-mono font-bold">{customerGstin || "Unregistered"}</span>
              </div>
              <div className="border-b border-dotted border-black/80 pb-0.5">
                <span className="font-bold">Despatch Details : </span>
                <span>{despatchDetails || "By Road / Local Delivery"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Metadata Grid */}
          <div className="md:col-span-6 flex flex-col divide-y-[2px] divide-black text-[10.5px] sm:text-[11px]">
            {/* Top Right: Recipient Checkboxes */}
            <div className="p-1.5 px-3 space-y-0.5 font-bold text-[10px] sm:text-[10.5px] bg-slate-50/40">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-xs">[✓]</span>
                <span>Original for Recipient</span>
              </div>
              <div className="flex items-center gap-1.5 text-black/80">
                <span className="font-mono text-xs">[  ]</span>
                <span>Duplicate for Supplier / Tranporter</span>
              </div>
              <div className="flex items-center gap-1.5 text-black/80">
                <span className="font-mono text-xs">[  ]</span>
                <span>Triplicate for Supplier</span>
              </div>
            </div>

            {/* Row 2: Invoice No & Date */}
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-7 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Invoice No.</span>
                <span className="font-mono font-black text-sm sm:text-base text-[#b91c1c] tracking-wider">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="col-span-5 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono font-bold">{formattedDate}</span>
              </div>
            </div>

            {/* Row 3: D.C. No & Date */}
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-7 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">D.C. No.</span>
                <span className="font-mono">{invoice.orderNumber || "—"}</span>
              </div>
              <div className="col-span-5 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono">{formattedDate}</span>
              </div>
            </div>

            {/* Row 4: Party's Order No & Date */}
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-7 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Party&apos;s Order No.</span>
                <span className="font-mono">{invoice.orderNumber || "—"}</span>
              </div>
              <div className="col-span-5 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono">{formattedDate}</span>
              </div>
            </div>

            {/* Row 5: E-way Bill & Vehicle No */}
            <div className="grid grid-cols-12 divide-x-[2px] divide-black">
              <div className="col-span-6 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">E-way Bill</span>
                <span className="font-mono truncate">{invoice.ewayBill || "—"}</span>
              </div>
              <div className="col-span-6 p-1.5 px-2 flex items-center justify-between">
                <span className="font-bold">Vehicle No.</span>
                <span className="font-mono font-bold truncate">{invoice.vehicleNumber || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. ITEMS TABLE WITH SL. NO, DESCRIPTION, HSN, QTY, RATE, AMOUNT (RS | PS)
            ========================================================================= */}
        <div className="relative">
          {/* Faint Center Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] select-none z-0">
            <SMEWLogo className="w-72 h-72 sm:w-80 sm:h-80" watermark />
          </div>

          <table className="w-full border-collapse text-[11px] relative z-10">
            <thead>
              {/* Main Header */}
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
                    <td className="p-1 text-center font-mono font-semibold">
                      {index + 1}
                    </td>
                    <td className="p-1 px-2 font-bold text-black">
                      {item.description}
                    </td>
                    <td className="p-1 text-center font-mono font-medium">
                      {item.hsn || "—"}
                    </td>
                    <td className="p-1 text-center font-mono font-bold">
                      {item.quantity} {item.unit || "PCS"}
                    </td>
                    <td className="p-1 text-right font-mono pr-2">
                      {rateSplit.rs}.{rateSplit.ps}
                    </td>
                    <td className="p-0">
                      <div className="grid grid-cols-12 divide-x divide-black h-full font-mono">
                        <div className="col-span-8 p-1 text-right pr-2 font-bold">
                          {amtSplit.rs}
                        </div>
                        <div className="col-span-4 p-1 text-center font-medium">
                          {amtSplit.ps}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Blank filler rows to replicate physical notepad layout */}
              {Array.from({ length: blankRowsCount }).map((_, idx) => (
                <tr key={`blank-${idx}`} className="divide-x-[2px] divide-black h-6">
                  <td className="p-1" />
                  <td className="p-1" />
                  <td className="p-1" />
                  <td className="p-1" />
                  <td className="p-1" />
                  <td className="p-0">
                    <div className="grid grid-cols-12 divide-x divide-black h-full">
                      <div className="col-span-8" />
                      <div className="col-span-4" />
                    </div>
                  </td>
                </tr>
              ))}

              {/* E. & O. E. line inside the description table */}
              <tr className="divide-x-[2px] divide-black h-6 border-b-[2px] border-black">
                <td className="p-1" />
                <td className="p-1 text-right pr-4 font-black text-[10px]">
                  E. &amp; O. E.
                </td>
                <td className="p-1" />
                <td className="p-1" />
                <td className="p-1" />
                <td className="p-0">
                  <div className="grid grid-cols-12 divide-x divide-black h-full">
                    <div className="col-span-8" />
                    <div className="col-span-4" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            5. SUMMARY & TAX BREAKDOWN (RIGHT) & WORDS / NOTICE / RECEIVER (LEFT)
            ========================================================================= */}
        <div className="grid grid-cols-12 divide-x-[2px] divide-black border-b-[2px] border-black">
          {/* Left Section: Rupees in words, Terms, Receiver Signature */}
          <div className="col-span-7 sm:col-span-8 p-2.5 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[11px] font-bold">
                Rupees in words : <span className="font-extrabold italic">{numberToWordsIndian(invoice.total)}</span>
              </div>
              <div className="border-b border-dotted border-black/80 mt-2" />
              <div className="border-b border-dotted border-black/80 mt-3" />
            </div>

            <div className="space-y-1 text-[10.5px] font-bold text-black pt-2">
              <p>Interest @ 18% Per Annum will be charged on all invoices not paid within due date.</p>
              <p>Material once sold will not be taken back.</p>
            </div>

            <div className="pt-8 text-[11px] font-bold">
              Receiver Signature
            </div>
          </div>

          {/* Right Section: GST Calculations & Authorised Signatory */}
          <div className="col-span-5 sm:col-span-4 flex flex-col justify-between divide-y-[2px] divide-black text-[11px]">
            <div className="divide-y divide-black">
              {/* Total Amount (Taxable Subtotal) */}
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">
                  Total Amount
                </div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">
                    {subtotalSplit.rs}
                  </div>
                  <div className="col-span-4 px-1 text-center">
                    {subtotalSplit.ps}
                  </div>
                </div>
              </div>

              {/* CGST */}
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">
                  CGST @ {!isInterState ? `${halfTaxRate}%` : ""}
                </div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">
                    {cgstSplit.rs}
                  </div>
                  <div className="col-span-4 px-1 text-center">
                    {cgstSplit.ps}
                  </div>
                </div>
              </div>

              {/* SGST */}
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">
                  SGST @ {!isInterState ? `${halfTaxRate}%` : ""}
                </div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">
                    {sgstSplit.rs}
                  </div>
                  <div className="col-span-4 px-1 text-center">
                    {sgstSplit.ps}
                  </div>
                </div>
              </div>

              {/* IGST */}
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-7 items-center">
                <div className="col-span-6 px-2 font-bold text-left">
                  IGST @ {isInterState ? `${effectiveTaxRate}%` : ""}
                </div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-bold">
                    {igstSplit.rs}
                  </div>
                  <div className="col-span-4 px-1 text-center">
                    {igstSplit.ps}
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="grid grid-cols-12 divide-x-[2px] divide-black h-8 items-center bg-slate-100/50 border-t-[2px] border-b-[2px] border-black">
                <div className="col-span-6 px-2 font-black text-xs text-left">
                  Grand Total
                </div>
                <div className="col-span-6 grid grid-cols-12 divide-x divide-black h-full items-center font-mono">
                  <div className="col-span-8 px-1 text-right pr-2 font-black text-xs text-black">
                    {totalSplit.rs}
                  </div>
                  <div className="col-span-4 px-1 text-center font-black text-xs text-black">
                    {totalSplit.ps}
                  </div>
                </div>
              </div>
            </div>

            {/* Authorised Signatory block */}
            <div className="p-2 pt-3 flex flex-col justify-between min-h-[90px] text-center">
              <div
                className="font-bold text-xs sm:text-[13px] text-[#991b1b] italic"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                For {companyName}
              </div>
              <div className="pt-6 text-[10.5px] font-bold text-black">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
