import React from "react";
import { format } from "date-fns";
import type { Customer, Invoice, InvoiceItem } from "@/generated/prisma/client";
import { numberToWordsIndian } from "@/lib/number-to-words";
import { formatCurrency } from "@/lib/invoice-utils";
import {
  Building2,
  CheckCircle2,
  Factory,
  FileCheck2,
  FileText,
  QrCode,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export type TemplateId =
  | "CLASSIC"
  | "MODERN"
  | "GST_TAX"
  | "MINIMAL"
  | "INDUSTRIAL"
  | "THERMAL";

export interface InvoiceTemplateProps {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  currency?: string;
  logoUrl?: string | null;
  className?: string;
  templateId?: TemplateId | string;
  copyType?: "ORIGINAL" | "DUPLICATE" | "TRIPLICATE";
}

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

/**
 * Authentic SMEW Vector Logo replicating the user's physical bill book:
 * Outer gear teeth cogs + circular rim + inner ॐ glyph + curved SMEW ribbon banner.
 */
function SMEWLogo({
  className = "",
  watermark = false,
}: {
  className?: string;
  watermark?: boolean;
}) {
  const strokeColor = watermark ? "#0284c7" : "#000000";
  const textColor = watermark ? "#0284c7" : "#000000";
  const fillColor = watermark ? "transparent" : "#ffffff";

  // 14 gear teeth around mechanical gear circumference (every ~25.7 deg)
  const teethAngles = [0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2];

  return (
    <svg viewBox="0 0 100 88" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mechanical Gear Cog with Center Om */}
      <g transform="translate(50, 36)">
        <g fill={strokeColor}>
          {teethAngles.map((deg, i) => (
            <rect key={i} x="-4" y="-33" width="8" height="8" rx="1" transform={`rotate(${deg})`} />
          ))}
        </g>
        <circle r="27" fill={fillColor} stroke={strokeColor} strokeWidth="2.4" />
        <circle r="22.5" fill="none" stroke={strokeColor} strokeWidth="1.2" />
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
      {/* Curved SMEW Banner Ribbon overlapping lower gear */}
      <path
        d="M 16 64 C 32 68, 68 68, 84 64 L 81.5 78 C 68 82, 32 82, 18.5 78 Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2.2"
      />
      {/* Banner fold notches */}
      <path d="M 16 64 L 12 71 L 18.5 78" stroke={strokeColor} strokeWidth="1.6" fill="none" />
      <path d="M 84 64 L 88 71 L 81.5 78" stroke={strokeColor} strokeWidth="1.6" fill="none" />
      <text
        x="50"
        y="75.5"
        fontSize="9.5"
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
   1. TEMPLATE: SRI MANJUNATHA AUTHENTIC BILL BOOK (Exact 1:1 PDF Match)
   ========================================================================= */
function ClassicTemplate({
  invoice,
  className = "",
  copyType = "ORIGINAL",
}: InvoiceTemplateProps) {
  const isInterState = invoice.isInterState;
  const isPurchase = invoice.documentType === "PURCHASE";
  const docTitle = isPurchase ? "PURCHASE BILL" : "TAX INVOICE";

  const companyName = invoice.companyName || "Sri Manjunatha Engineering Works";
  const companyAddress =
    invoice.companyAddress ||
    "# 11/1, 1st Cross, 2nd Main, Ramachandrapuram, Bengaluru - 560 021.";
  const companyPhone1 = "94486 73532";
  const companyPhone2 = "73537 56924";
  const companyState = invoice.companyState || "Karnataka";
  const companyGstin = invoice.companyTaxId || "29AEZPC6364C1Z5";
  const stateCode = companyGstin ? companyGstin.substring(0, 2) : "29";

  const customerName = invoice.customer?.name || "";
  const customerAddress = invoice.customer?.address || "";
  const customerCityState = [
    invoice.customer?.city,
    invoice.customer?.state,
    invoice.customer?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
  const customerGstin = invoice.customer?.taxId || "";
  const despatchDetails = invoice.placeOfSupply || invoice.customer?.state || "";
  const formattedDate = format(new Date(invoice.issueDate), "dd-MM-yyyy");

  const subtotalSplit = splitRupeesPaise(invoice.subtotal);
  const totalSplit = splitRupeesPaise(invoice.total);
  const effectiveTaxRate = invoice.taxRate || 18;
  const halfTaxRate = effectiveTaxRate / 2;

  const cgstSplit =
    !isInterState && invoice.cgstAmount > 0
      ? splitRupeesPaise(invoice.cgstAmount)
      : { rs: "—", ps: "—" };
  const sgstSplit =
    !isInterState && invoice.sgstAmount > 0
      ? splitRupeesPaise(invoice.sgstAmount)
      : { rs: "—", ps: "—" };
  const igstSplit =
    isInterState && invoice.igstAmount > 0
      ? splitRupeesPaise(invoice.igstAmount)
      : { rs: "—", ps: "—" };

  return (
    <article
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      className={`mx-auto w-full max-w-[210mm] bg-white p-3 sm:p-5 text-black font-sans leading-tight shadow-xl border border-black print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      <div className="border-[1.5px] border-black bg-white">
        {/* =================================================================
            TOP HEADER BLOCK
            Left: SMEW Logo | Center: Title & Address | Right: Mobile Numbers
            ================================================================= */}
        <div className="flex border-b-[1.5px] border-black">
          {/* Left SMEW Gear Logo */}
          <div className="w-[105px] shrink-0 border-r-[1.5px] border-black p-2 flex items-center justify-center bg-white">
            <SMEWLogo className="w-20 h-20 sm:w-22 sm:h-22" />
          </div>

          {/* Center Brand Details */}
          <div className="flex-1 p-2 sm:p-2.5 text-center flex flex-col justify-center">
            <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-black">
              {docTitle}
            </div>
            <h1
              className="text-xl sm:text-2xl lg:text-[27px] font-black tracking-tight mt-0.5 text-[#991b1b] italic"
              style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
            >
              {companyName}
            </h1>
            <p className="text-[10px] sm:text-[11.5px] font-bold text-black mt-0.5">
              We Undertake all types of Precision Job Work &amp; Turning Components
            </p>
            <p className="text-[9.5px] sm:text-[10.5px] text-black font-semibold mt-0.5">
              {companyAddress}
            </p>
          </div>

          {/* Right Mobile Numbers */}
          <div className="w-[145px] sm:w-[155px] shrink-0 border-l-[1.5px] border-black p-2 text-right text-[11px] sm:text-xs font-bold flex flex-col justify-start">
            <div>
              <span className="font-extrabold">Mob :</span> {companyPhone1}
            </div>
            <div className="pr-0.5">{companyPhone2}</div>
          </div>
        </div>

        {/* =================================================================
            ROW 2: STATE / CODE / GSTIN / COPIES BOX
            ================================================================= */}
        <div className="grid grid-cols-12 border-b-[1.5px] border-black text-[11px] sm:text-xs font-bold divide-x-[1.5px] divide-black bg-white items-center">
          <div className="col-span-3 px-3 py-1">
            <span>State : </span>
            <span className="font-extrabold">{companyState}</span>
          </div>
          <div className="col-span-2 px-3 py-1">
            <span>Code : </span>
            <span className="font-extrabold">{stateCode}</span>
          </div>
          <div className="col-span-4 px-3 py-1">
            <span>GSTIN : </span>
            <span className="font-mono font-black tracking-wider">{companyGstin}</span>
          </div>
          {/* 3 Copy Lines (matching the physical printed bill book) */}
          <div className="col-span-3 px-2 py-0.5 text-[9px] sm:text-[9.5px] leading-tight flex flex-col justify-center">
            <div
              className={
                copyType === "ORIGINAL"
                  ? "font-black underline decoration-red-600 decoration-2 text-black"
                  : "text-black"
              }
            >
              {copyType === "ORIGINAL" && <span className="text-red-600 font-bold mr-1">✓</span>}
              Original for Recipient
            </div>
            <div
              className={
                copyType === "DUPLICATE"
                  ? "font-black underline decoration-red-600 decoration-2 text-black"
                  : "text-black"
              }
            >
              {copyType === "DUPLICATE" && <span className="text-red-600 font-bold mr-1">✓</span>}
              Duplicate for Supplier / Tranporter
            </div>
            <div
              className={
                copyType === "TRIPLICATE"
                  ? "font-black underline decoration-red-600 decoration-2 text-black"
                  : "text-black"
              }
            >
              {copyType === "TRIPLICATE" && <span className="text-red-600 font-bold mr-1">✓</span>}
              Triplicate for Supplier
            </div>
          </div>
        </div>

        {/* =================================================================
            ROW 3: PARTY DETAILS (LEFT) & METADATA GRID 4 ROWS (RIGHT)
            ================================================================= */}
        <div className="flex border-b-[1.5px] border-black divide-x-[1.5px] divide-black">
          {/* Left: Party Details with authentic dotted lines */}
          <div className="flex-1 p-2 sm:p-2.5 text-[11px] flex flex-col justify-between space-y-1">
            <div>
              <div className="font-bold text-xs text-black">To,</div>
              <div className="flex items-baseline min-h-[20px] border-b border-dotted border-black/80">
                <span className="font-bold mr-1 shrink-0">M/s.</span>
                <span className="font-extrabold text-xs sm:text-sm text-black flex-1 truncate">
                  {customerName}
                </span>
              </div>
              <div className="min-h-[19px] border-b border-dotted border-black/80 flex items-center">
                <span className="text-black font-medium">{customerAddress || ""}</span>
              </div>
              <div className="min-h-[19px] border-b border-dotted border-black/80 flex items-center">
                <span className="text-black font-medium">{customerCityState || ""}</span>
              </div>
            </div>
            <div className="pt-0.5 space-y-1">
              <div className="flex items-baseline min-h-[19px] border-b border-dotted border-black/80">
                <span className="font-bold mr-1 shrink-0">Party&apos;s GSTIN :</span>
                <span className="font-mono font-bold">{customerGstin || ""}</span>
              </div>
              <div className="flex items-baseline min-h-[19px] border-b border-dotted border-black/80">
                <span className="font-bold mr-1 shrink-0">Despatch Details :</span>
                <span className="font-medium">{despatchDetails || ""}</span>
              </div>
            </div>
          </div>

          {/* Right: 4 rows with single continuous vertical divider down the exact center (50% / 50%) */}
          <div className="w-[300px] sm:w-[320px] shrink-0 flex flex-col divide-y-[1.5px] divide-black text-[10.5px] sm:text-[11px]">
            {/* Row 1: Invoice No. | Date : */}
            <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Invoice No.</span>
                <span className="font-mono font-black text-sm text-[#b91c1c] tracking-wider">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono font-bold">{formattedDate}</span>
              </div>
            </div>
            {/* Row 2: D.C. No. | Date : */}
            <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">D.C. No.</span>
                <span className="font-mono">{invoice.orderNumber || ""}</span>
              </div>
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono">{invoice.orderNumber ? formattedDate : ""}</span>
              </div>
            </div>
            {/* Row 3: Party's Order No. | Date : */}
            <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Party&apos;s Order No.</span>
                <span className="font-mono">{invoice.orderNumber || ""}</span>
              </div>
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Date :</span>
                <span className="font-mono">{invoice.orderNumber ? formattedDate : ""}</span>
              </div>
            </div>
            {/* Row 4: E-way Bill | Vehicle No. */}
            <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">E-way Bill</span>
                <span className="font-mono truncate">{invoice.ewayBill || ""}</span>
              </div>
              <div className="w-1/2 px-2 flex items-center justify-between">
                <span className="font-bold">Vehicle No.</span>
                <span className="font-mono font-bold truncate">{invoice.vehicleNumber || ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            MAIN ITEMS TABLE (CONTINUOUS VERTICAL COLUMNS & BLUE WATERMARK)
            Exact physical bill format: Open table body without horizontal rows!
            ================================================================= */}
        {/* Table Header */}
        <div className="border-b-[1.5px] border-black flex text-[11px] font-extrabold text-center uppercase divide-x-[1.5px] divide-black bg-white">
          <div className="w-[42px] shrink-0 p-1 flex items-center justify-center leading-tight">
            Sl.
            <br />
            No.
          </div>
          <div className="flex-1 p-1 px-3 flex items-center justify-center tracking-wider">
            DESCRIPTION
          </div>
          <div className="w-[70px] shrink-0 p-1 flex items-center justify-center">
            HSN Code
          </div>
          <div className="w-[50px] shrink-0 p-1 flex items-center justify-center">
            Qty
          </div>
          <div className="w-[70px] shrink-0 p-1 flex items-center justify-center">
            Rate
          </div>
          <div className="w-[106px] shrink-0 flex flex-col divide-y-[1.5px] divide-black">
            <div className="py-0.5 text-center">Amount</div>
            <div className="flex divide-x-[1.5px] divide-black font-bold text-[10px]">
              <div className="w-[70px] text-center">Rs.</div>
              <div className="w-[36px] text-center">Ps.</div>
            </div>
          </div>
        </div>

        {/* Table Body (Open vertical ruled area with faint SMEW watermark) */}
        <div className="relative min-h-[440px] flex divide-x-[1.5px] divide-black bg-white">
          {/* Centered SMEW Blue Stamp Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <SMEWLogo className="w-72 h-72 sm:w-84 sm:h-84 opacity-[0.14]" watermark />
          </div>

          {/* Sl. No. Column */}
          <div className="w-[42px] shrink-0 flex flex-col text-center font-mono font-semibold text-[11px] z-10 pt-1">
            {invoice.items.map((_, idx) => (
              <div key={idx} className="h-6 flex items-center justify-center">
                {idx + 1}
              </div>
            ))}
          </div>

          {/* DESCRIPTION Column */}
          <div className="flex-1 flex flex-col justify-between text-[11px] z-10 p-1 px-2">
            <div className="space-y-0">
              {invoice.items.map((item) => (
                <div key={item.id} className="h-6 flex items-center font-bold text-black truncate">
                  {item.description}
                </div>
              ))}
            </div>
            {/* E. & O. E. anchored at bottom-right of description */}
            <div className="text-right pr-2 pb-0.5 font-black text-[10.5px] tracking-wide text-black">
              E. &amp; O. E.
            </div>
          </div>

          {/* HSN Code Column */}
          <div className="w-[70px] shrink-0 flex flex-col text-center font-mono text-[11px] z-10 pt-1">
            {invoice.items.map((item) => (
              <div key={item.id} className="h-6 flex items-center justify-center">
                {item.hsn || "—"}
              </div>
            ))}
          </div>

          {/* Qty Column */}
          <div className="w-[50px] shrink-0 flex flex-col text-center font-mono font-bold text-[11px] z-10 pt-1">
            {invoice.items.map((item) => (
              <div key={item.id} className="h-6 flex items-center justify-center">
                {item.quantity}
              </div>
            ))}
          </div>

          {/* Rate Column */}
          <div className="w-[70px] shrink-0 flex flex-col text-right font-mono text-[11px] z-10 pt-1 pr-2">
            {invoice.items.map((item) => {
              const rateSplit = splitRupeesPaise(item.unitPrice);
              return (
                <div key={item.id} className="h-6 flex items-center justify-end">
                  {rateSplit.rs}.{rateSplit.ps}
                </div>
              );
            })}
          </div>

          {/* Amount Columns (Rs. and Ps.) */}
          <div className="w-[106px] shrink-0 flex divide-x-[1.5px] divide-black font-mono text-[11px] z-10 pt-1">
            {/* Rs. */}
            <div className="w-[70px] flex flex-col text-right pr-2 font-bold">
              {invoice.items.map((item) => {
                const amtSplit = splitRupeesPaise(item.amount);
                return (
                  <div key={item.id} className="h-6 flex items-center justify-end">
                    {amtSplit.rs}
                  </div>
                );
              })}
            </div>
            {/* Ps. */}
            <div className="w-[36px] flex flex-col text-center font-medium">
              {invoice.items.map((item) => {
                const amtSplit = splitRupeesPaise(item.amount);
                return (
                  <div key={item.id} className="h-6 flex items-center justify-center">
                    {amtSplit.ps}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================================
            BOTTOM SECTION: WORDS, TERMS, SIGNATURES & EXACT TOTALS ALIGNMENT
            ================================================================= */}
        <div className="flex border-t-[1.5px] border-black divide-x-[1.5px] divide-black">
          {/* Left Side (aligned under Sl. No. + DESCRIPTION) */}
          <div className="flex-1 p-2.5 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-[11px] font-bold leading-normal">
                <span>Rupees in words : </span>
                <span className="font-extrabold italic">
                  {numberToWordsIndian(invoice.total).replace(/^Rupees\s+/i, "")}
                </span>
              </div>
              <div className="border-b border-dotted border-black mt-2 min-h-[12px]" />
              <div className="border-b border-dotted border-black mt-2 min-h-[12px]" />
            </div>
            <div className="space-y-1 text-[10.5px] font-bold text-black pt-1">
              <p>
                Interest @ 18% Per Annum will be charged on all invoices not paid within due date.
              </p>
              <p>Material once sold will not be taken back.</p>
            </div>
            <div className="pt-4 text-[11px] font-bold">Receiver Signature</div>
          </div>

          {/* Right Side (Total 296px, aligned under HSN + Qty + Rate + Amount) */}
          <div className="w-[296px] shrink-0 flex flex-col divide-y-[1.5px] divide-black text-[11px]">
            <div className="divide-y-[1.5px] divide-black">
              {/* Total Amount */}
              <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
                <div className="w-[190px] px-2 font-bold text-left">Total Amount</div>
                <div className="w-[70px] px-1 text-right pr-2 font-mono font-bold">{subtotalSplit.rs}</div>
                <div className="w-[36px] text-center font-mono">{subtotalSplit.ps}</div>
              </div>
              {/* CGST */}
              <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
                <div className="w-[190px] px-2 font-bold text-left">
                  CGST @ {!isInterState ? `${halfTaxRate}%` : ""}
                </div>
                <div className="w-[70px] px-1 text-right pr-2 font-mono font-bold">{cgstSplit.rs}</div>
                <div className="w-[36px] text-center font-mono">{cgstSplit.ps}</div>
              </div>
              {/* SGST */}
              <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
                <div className="w-[190px] px-2 font-bold text-left">
                  SGST @ {!isInterState ? `${halfTaxRate}%` : ""}
                </div>
                <div className="w-[70px] px-1 text-right pr-2 font-mono font-bold">{sgstSplit.rs}</div>
                <div className="w-[36px] text-center font-mono">{sgstSplit.ps}</div>
              </div>
              {/* IGST */}
              <div className="flex divide-x-[1.5px] divide-black h-7 items-center">
                <div className="w-[190px] px-2 font-bold text-left">
                  IGST @ {isInterState ? `${effectiveTaxRate}%` : ""}
                </div>
                <div className="w-[70px] px-1 text-right pr-2 font-mono font-bold">{igstSplit.rs}</div>
                <div className="w-[36px] text-center font-mono">{igstSplit.ps}</div>
              </div>
              {/* Grand Total */}
              <div className="flex divide-x-[1.5px] divide-black h-8 items-center bg-zinc-50/50">
                <div className="w-[190px] px-2 font-black text-xs text-left">Grand Total</div>
                <div className="w-[70px] px-1 text-right pr-2 font-mono font-black text-xs text-black">
                  {totalSplit.rs}
                </div>
                <div className="w-[36px] text-center font-mono font-black text-xs text-black">
                  {totalSplit.ps}
                </div>
              </div>
            </div>

            {/* For Sri Manjunatha Engineering Works & Authorised Signatory */}
            <div className="p-2 pt-2.5 flex flex-col justify-between min-h-[90px] text-center">
              <div
                className="font-bold text-xs sm:text-[13px] text-[#991b1b] italic"
                style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
              >
                For {companyName}
              </div>
              <div className="pt-8 text-[10.5px] font-bold text-black">Authorised Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   2. TEMPLATE: MODERN EXECUTIVE GRADIENT (Corporate Tech & UPI QR)
   ========================================================================= */
function ModernTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd MMM yyyy");
  const isInterState = invoice.isInterState;

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-6 text-slate-900 font-sans leading-relaxed shadow-xl rounded-2xl border border-slate-200 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      {/* Brand Header Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex justify-between items-start mb-6 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/20 text-white font-black text-xs backdrop-blur-xs">
            <Building2 className="size-3.5" />
            <span>BILLORA OS</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {invoice.companyName || "Sri Manjunatha Engineering Works"}
          </h1>
          <p className="text-xs text-white/90">
            {invoice.companyAddress || "#11/1, 1st Cross, Ramachandrapuram, Bengaluru"}
          </p>
          <p className="text-xs font-mono font-bold text-white/80">
            GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}
          </p>
        </div>
        <div className="text-right space-y-1">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-black uppercase tracking-wider shadow-xs">
            TAX INVOICE
          </span>
          <p className="text-lg font-mono font-black text-white tracking-wide mt-1">
            #{invoice.invoiceNumber}
          </p>
          <p className="text-xs text-white/90">Date: {formattedDate}</p>
        </div>
      </div>

      {/* Side-by-side Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Billed To Customer
          </span>
          <h3 className="font-extrabold text-sm text-slate-900">
            {invoice.customer?.name || "Cash Customer"}
          </h3>
          <p className="text-slate-600">{invoice.customer?.address || "Local Customer Address"}</p>
          <p className="font-mono text-slate-700 font-bold">
            GSTIN: {invoice.customer?.taxId || "Unregistered"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1 text-xs text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Invoice Details
          </span>
          <p className="font-semibold text-slate-700">
            Place of Supply:{" "}
            <span className="font-bold text-slate-900">
              {invoice.placeOfSupply || "Karnataka"}
            </span>
          </p>
          <p className="font-semibold text-slate-700">
            Payment Status:{" "}
            <span className="font-bold text-emerald-700 uppercase">{invoice.status}</span>
          </p>
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
                <td className="p-3 text-center font-mono font-bold">
                  {item.quantity} {item.unit || "PCS"}
                </td>
                <td className="p-3 text-right font-mono">
                  {formatCurrency(item.unitPrice, currency)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(item.amount, currency)}
                </td>
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
            <p className="font-extrabold italic text-slate-900 mt-0.5">
              {numberToWordsIndian(invoice.total)}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-emerald-900 block">UPI Instant Payment QR</span>
              <p className="text-[10px] text-emerald-700">
                Scan via PhonePe, GPay, Paytm, Cred, or BHIM
              </p>
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
                <span>CGST ({(invoice.taxRate || 18) / 2}%):</span>
                <span className="font-mono">{formatCurrency(invoice.cgstAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({(invoice.taxRate || 18) / 2}%):</span>
                <span className="font-mono">{formatCurrency(invoice.sgstAmount, currency)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>IGST ({invoice.taxRate || 18}%):</span>
              <span className="font-mono">{formatCurrency(invoice.igstAmount, currency)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-emerald-700">
              {formatCurrency(invoice.total, currency)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   3. TEMPLATE: GST TAX DETAILED (Legal Compliance with HSN Summary Table)
   ========================================================================= */
function GstTaxTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd/MM/yyyy");
  const isInterState = invoice.isInterState;
  const effectiveRate = invoice.taxRate || 18;
  const halfRate = effectiveRate / 2;

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-5 text-slate-900 font-sans leading-tight shadow-xl border border-slate-300 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      {/* GST Formal Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <span className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-0.5 rounded">
          FORM GST INV-1 • TAX INVOICE
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2 uppercase">
          {invoice.companyName || "Sri Manjunatha Engineering Works"}
        </h1>
        <p className="text-xs text-slate-600">
          {invoice.companyAddress || "#11/1, 1st Cross, Ramachandrapuram, Bengaluru - 560021"}
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold text-slate-900 mt-1">
          <span>
            GSTIN: <span className="font-mono">{invoice.companyTaxId || "29AEZPC6364C1Z5"}</span>
          </span>
          <span>
            State Code: <span className="font-mono">29 (Karnataka)</span>
          </span>
        </div>
      </div>

      {/* Grid metadata */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-4 border border-slate-300 rounded-lg p-3 bg-slate-50">
        <div className="space-y-1">
          <p>
            <span className="font-bold text-slate-500">Invoice No:</span>{" "}
            <span className="font-mono font-extrabold text-slate-900">{invoice.invoiceNumber}</span>
          </p>
          <p>
            <span className="font-bold text-slate-500">Invoice Date:</span>{" "}
            <span className="font-mono font-bold">{formattedDate}</span>
          </p>
          <p>
            <span className="font-bold text-slate-500">Reverse Charge (RCM):</span>{" "}
            <span className="font-bold text-slate-900">No</span>
          </p>
        </div>
        <div className="space-y-1 text-right">
          <p>
            <span className="font-bold text-slate-500">Billed Party:</span>{" "}
            <span className="font-extrabold text-slate-900">{invoice.customer?.name}</span>
          </p>
          <p>
            <span className="font-bold text-slate-500">Party GSTIN:</span>{" "}
            <span className="font-mono font-bold">{invoice.customer?.taxId || "Unregistered"}</span>
          </p>
          <p>
            <span className="font-bold text-slate-500">Place of Supply:</span>{" "}
            <span className="font-bold">{invoice.placeOfSupply || "Karnataka (29)"}</span>
          </p>
        </div>
      </div>

      {/* Detailed Items Table */}
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
              <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">
                {item.quantity}
              </td>
              <td className="p-2 border-r border-slate-300 text-right font-mono">
                {formatCurrency(item.unitPrice, currency)}
              </td>
              <td className="p-2 border-r border-slate-300 text-right font-mono font-bold">
                {formatCurrency(item.amount, currency)}
              </td>
              <td className="p-2 text-right font-mono font-bold">
                {formatCurrency((item.amount * effectiveRate) / 100, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legal HSN Tax Summary Sub-Table */}
      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1">
          GST Tax Summary Breakdown
        </span>
        <table className="w-full text-[11px] border border-slate-300 border-collapse">
          <thead className="bg-slate-100 font-bold text-slate-700 text-center border-b border-slate-300">
            <tr>
              <th className="p-1.5 border-r border-slate-300">HSN / SAC</th>
              <th className="p-1.5 border-r border-slate-300">Taxable Value</th>
              {!isInterState ? (
                <>
                  <th className="p-1.5 border-r border-slate-300">CGST Rate</th>
                  <th className="p-1.5 border-r border-slate-300">CGST Amount</th>
                  <th className="p-1.5 border-r border-slate-300">SGST Rate</th>
                  <th className="p-1.5 border-r border-slate-300">SGST Amount</th>
                </>
              ) : (
                <>
                  <th className="p-1.5 border-r border-slate-300">IGST Rate</th>
                  <th className="p-1.5 border-r border-slate-300">IGST Amount</th>
                </>
              )}
              <th className="p-1.5">Total Tax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-center">
            <tr>
              <td className="p-1.5 border-r border-slate-300 font-bold">84669390</td>
              <td className="p-1.5 border-r border-slate-300">{formatCurrency(invoice.subtotal, currency)}</td>
              {!isInterState ? (
                <>
                  <td className="p-1.5 border-r border-slate-300">{halfRate}%</td>
                  <td className="p-1.5 border-r border-slate-300">{formatCurrency(invoice.cgstAmount, currency)}</td>
                  <td className="p-1.5 border-r border-slate-300">{halfRate}%</td>
                  <td className="p-1.5 border-r border-slate-300">{formatCurrency(invoice.sgstAmount, currency)}</td>
                </>
              ) : (
                <>
                  <td className="p-1.5 border-r border-slate-300">{effectiveRate}%</td>
                  <td className="p-1.5 border-r border-slate-300">{formatCurrency(invoice.igstAmount, currency)}</td>
                </>
              )}
              <td className="p-1.5 font-bold">{formatCurrency(invoice.taxAmount, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bank details & Signatures */}
      <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 rounded-lg p-3 bg-slate-50">
        <div className="space-y-1">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
            Bank Wire Transfer (NEFT/RTGS):
          </span>
          <p>
            Bank: <span className="font-bold">State Bank of India</span>
          </p>
          <p>
            A/c No: <span className="font-mono font-bold">38291048291</span>
          </p>
          <p>
            IFSC: <span className="font-mono font-bold">SBIN0004128</span>
          </p>
        </div>
        <div className="text-right flex flex-col justify-between">
          <p className="font-extrabold text-slate-900">
            Total Invoice Amount:{" "}
            <span className="text-sm font-mono text-emerald-800">
              {formatCurrency(invoice.total, currency)}
            </span>
          </p>
          <div className="pt-6">
            <p className="font-bold text-slate-900">
              For {invoice.companyName || "Sri Manjunatha Engineering Works"}
            </p>
            <p className="text-[10px] text-slate-500 pt-3 border-t border-slate-300 mt-1">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   4. TEMPLATE: MINIMALIST MONOCHROME (Clean, Laser & Dot-Matrix Friendly)
   ========================================================================= */
function MinimalTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd/MM/yyyy");

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-6 text-black font-sans leading-tight shadow-md border border-black print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            {invoice.companyName || "Sri Manjunatha Engineering Works"}
          </h1>
          <p className="text-xs text-neutral-700">{invoice.companyAddress}</p>
          <p className="text-xs font-mono font-bold">GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-black tracking-widest uppercase block">INVOICE</span>
          <p className="font-mono font-bold text-sm">#{invoice.invoiceNumber}</p>
          <p className="text-xs text-neutral-600">Date: {formattedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-black p-3">
        <div>
          <span className="font-bold block text-neutral-500 uppercase text-[10px]">BILLED TO</span>
          <p className="font-bold text-sm">{invoice.customer?.name}</p>
          <p className="text-neutral-700">{invoice.customer?.address}</p>
          <p className="font-mono font-semibold">GSTIN: {invoice.customer?.taxId || "Unregistered"}</p>
        </div>
        <div className="text-right space-y-0.5">
          <span className="font-bold block text-neutral-500 uppercase text-[10px]">TRANSACTION DETAILS</span>
          <p>Place of Supply: <span className="font-bold">{invoice.placeOfSupply || "Karnataka"}</span></p>
          <p>Order / DC No: <span className="font-mono">{invoice.orderNumber || "—"}</span></p>
          <p>Vehicle No: <span className="font-mono">{invoice.vehicleNumber || "—"}</span></p>
        </div>
      </div>

      <table className="w-full text-xs border border-black border-collapse mb-6">
        <thead>
          <tr className="border-b border-black text-center font-bold uppercase bg-neutral-100">
            <th className="p-2 border-r border-black w-10">#</th>
            <th className="p-2 border-r border-black text-left">Description</th>
            <th className="p-2 border-r border-black w-20">HSN</th>
            <th className="p-2 border-r border-black w-16">Qty</th>
            <th className="p-2 border-r border-black w-24">Rate</th>
            <th className="p-2 w-28">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/40">
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className="align-top">
              <td className="p-2 border-r border-black text-center font-mono">{idx + 1}</td>
              <td className="p-2 border-r border-black font-semibold">{item.description}</td>
              <td className="p-2 border-r border-black text-center font-mono">{item.hsn || "—"}</td>
              <td className="p-2 border-r border-black text-center font-mono font-bold">{item.quantity}</td>
              <td className="p-2 border-r border-black text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="p-2 text-right font-mono font-bold">{formatCurrency(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-12 gap-4 items-start text-xs border-t border-black pt-4">
        <div className="col-span-7 space-y-2">
          <p><span className="font-bold">Amount in Words:</span> {numberToWordsIndian(invoice.total)}</p>
          <p className="text-[11px] text-neutral-600">Terms: Payment due within credit terms. Interest applies on overdue bills.</p>
        </div>
        <div className="col-span-5 space-y-1 text-right font-mono">
          <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal, currency)}</span></div>
          <div className="flex justify-between"><span>Total GST:</span><span>{formatCurrency(invoice.taxAmount, currency)}</span></div>
          <div className="flex justify-between font-black text-sm border-t border-black pt-1">
            <span>Grand Total:</span>
            <span>{formatCurrency(invoice.total, currency)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   5. TEMPLATE: PRECISION ENGINEERING & JOB WORK (CNC, Turning, Fabrication)
   ========================================================================= */
function IndustrialTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd-MM-yyyy");

  return (
    <article
      className={`mx-auto w-full max-w-[210mm] bg-white p-5 text-slate-900 font-sans leading-tight shadow-xl border-2 border-slate-800 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      {/* Industrial Machine Shop Header */}
      <div className="border-b-2 border-slate-800 pb-3 mb-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black">
            <Wrench className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
              PRECISION ENGINEERING &amp; MANUFACTURING
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900">
              {invoice.companyName || "Sri Manjunatha Engineering Works"}
            </h1>
            <p className="text-xs text-slate-600">{invoice.companyAddress}</p>
          </div>
        </div>
        <div className="text-right border-l-2 border-slate-800 pl-4">
          <span className="text-xs font-black uppercase px-2 py-0.5 bg-amber-500 text-black rounded">
            JOB WORK INVOICE
          </span>
          <p className="font-mono font-black text-base text-slate-900 mt-1">#{invoice.invoiceNumber}</p>
          <p className="text-xs font-bold text-slate-600">Date: {formattedDate}</p>
        </div>
      </div>

      {/* Engineering Specs Bar */}
      <div className="grid grid-cols-4 gap-2 text-xs border border-slate-300 rounded p-2 mb-3 bg-slate-50 font-mono">
        <div><span className="font-sans text-slate-500 font-bold block text-[10px]">P.O. REFERENCE</span>{invoice.orderNumber || "PO-REF-001"}</div>
        <div><span className="font-sans text-slate-500 font-bold block text-[10px]">DELIVERY CHALLAN</span>DC-{(invoice.invoiceNumber || "").replace(/[^0-9]/g, "")}</div>
        <div><span className="font-sans text-slate-500 font-bold block text-[10px]">VEHICLE / TRANSPORTER</span>{invoice.vehicleNumber || "Local Delivery"}</div>
        <div><span className="font-sans text-slate-500 font-bold block text-[10px]">JOB TOLERANCE</span>± 0.02 mm Standard</div>
      </div>

      {/* Engineering Table */}
      <table className="w-full text-xs border border-slate-800 border-collapse mb-4">
        <thead>
          <tr className="bg-slate-900 text-white font-bold text-center">
            <th className="p-2 border-r border-slate-700 w-10">Sl.</th>
            <th className="p-2 border-r border-slate-700 text-left">Component Name / Turning Job Work</th>
            <th className="p-2 border-r border-slate-700 w-24">HSN Code</th>
            <th className="p-2 border-r border-slate-700 w-20">Process</th>
            <th className="p-2 border-r border-slate-700 w-16">Qty</th>
            <th className="p-2 border-r border-slate-700 w-24">Rate (₹)</th>
            <th className="p-2 w-28">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {invoice.items.map((item, idx) => (
            <tr key={item.id} className="align-top">
              <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
              <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                {item.description}
                <span className="block text-[10px] text-slate-500 font-normal">Drawing Spec: DWG-SMEW-{idx + 101}</span>
              </td>
              <td className="p-2 border-r border-slate-300 text-center font-mono">{item.hsn || "8466"}</td>
              <td className="p-2 border-r border-slate-300 text-center text-[10px] font-bold text-slate-600">Turning/CNC</td>
              <td className="p-2 border-r border-slate-300 text-center font-mono font-bold">{item.quantity} {item.unit || "NOS"}</td>
              <td className="p-2 border-r border-slate-300 text-right font-mono">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="p-2 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QC & Signatures */}
      <div className="grid grid-cols-12 gap-3 text-xs border border-slate-800 p-3 rounded">
        <div className="col-span-8 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="size-4" />
            <span>Components visually inspected &amp; 100% dimensions verified to drawing specs.</span>
          </div>
          <p className="font-bold text-slate-700">Rupees: <span className="font-extrabold italic text-slate-900">{numberToWordsIndian(invoice.total)}</span></p>
          <div className="pt-4 flex gap-8">
            <div><span className="block font-bold">Quality Inspector</span><span className="text-[10px] text-slate-500">QC Passed [✓]</span></div>
            <div><span className="block font-bold">Customer Material Receipt</span><span className="text-[10px] text-slate-500">Sign &amp; Seal</span></div>
          </div>
        </div>
        <div className="col-span-4 border-l border-slate-300 pl-3 space-y-1 font-mono text-right">
          <div className="flex justify-between"><span>Taxable:</span><span>{formatCurrency(invoice.subtotal, currency)}</span></div>
          <div className="flex justify-between"><span>GST (18%):</span><span>{formatCurrency(invoice.taxAmount, currency)}</span></div>
          <div className="flex justify-between font-black text-sm border-t border-slate-800 pt-1 text-slate-900">
            <span>Net Payable:</span>
            <span>{formatCurrency(invoice.total, currency)}</span>
          </div>
          <div className="pt-6 text-center font-sans font-bold text-[10px]">
            For {invoice.companyName || "Sri Manjunatha Engineering Works"}
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   6. TEMPLATE: THERMAL POS RECEIPT (80mm / 58mm POS Counter Receipt)
   ========================================================================= */
function ThermalTemplate({ invoice, currency = "INR", className = "" }: InvoiceTemplateProps) {
  const formattedDate = format(new Date(invoice.issueDate), "dd/MM/yy HH:mm");

  return (
    <article
      className={`mx-auto w-full max-w-[80mm] bg-white p-3 text-black font-mono text-[10px] leading-tight shadow-md border border-slate-300 print:max-w-none print:p-0 print:border-none print:shadow-none ${className}`}
    >
      <div className="text-center space-y-1 border-b border-dashed border-black pb-2 mb-2">
        <h2 className="font-black text-xs uppercase">{invoice.companyName || "Sri Manjunatha Engg Works"}</h2>
        <p className="text-[9px]">{invoice.companyAddress || "Bengaluru - 560021"}</p>
        <p className="text-[9px]">GSTIN: {invoice.companyTaxId || "29AEZPC6364C1Z5"}</p>
        <p className="font-bold text-[11px] pt-1">*** POS CASH RECEIPT ***</p>
      </div>

      <div className="space-y-0.5 mb-2 border-b border-dashed border-black pb-2">
        <div className="flex justify-between">
          <span>Bill No:</span>
          <span className="font-bold">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span className="font-bold truncate max-w-[120px]">{invoice.customer?.name}</span>
        </div>
      </div>

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

      <div className="border-t border-dashed border-black pt-2 space-y-1 text-right mb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST Tax:</span>
          <span>{formatCurrency(invoice.taxAmount, currency)}</span>
        </div>
        <div className="flex justify-between font-black text-xs border-t border-black pt-1">
          <span>NET PAYABLE:</span>
          <span>{formatCurrency(invoice.total, currency)}</span>
        </div>
      </div>

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
   MAIN EXPORT SWITCHER
   ========================================================================= */
export function InvoiceTemplate({
  invoice,
  currency = "INR",
  logoUrl,
  className = "",
  templateId = "CLASSIC",
  copyType = "ORIGINAL",
}: InvoiceTemplateProps) {
  const normalizedId = (templateId || "CLASSIC").toUpperCase();

  switch (normalizedId) {
    case "MODERN":
    case "MODERN_EXECUTIVE":
    case "ELEGANT":
      return <ModernTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;

    case "GST_TAX":
    case "GST_COMPLIANCE":
      return <GstTaxTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;

    case "MINIMAL":
    case "MINIMAL_INK_SAVER":
      return <MinimalTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;

    case "INDUSTRIAL":
    case "INDUSTRIAL_JOBWORK":
      return <IndustrialTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;

    case "THERMAL":
    case "THERMAL_POS":
      return <ThermalTemplate invoice={invoice} currency={currency} logoUrl={logoUrl} className={className} />;

    case "CLASSIC":
    case "SMEW_CLASSIC":
    default:
      return (
        <ClassicTemplate
          invoice={invoice}
          currency={currency}
          logoUrl={logoUrl}
          className={className}
          copyType={copyType}
        />
      );
  }
}
