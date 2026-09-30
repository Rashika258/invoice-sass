import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, Store } from "lucide-react";
import { fetchStoreBill } from "@/actions/store-ops";
import { getCompanyProfile } from "@/actions/settings";
import { Badge } from "@/components/ui/badge";
import { PrintStoreBillButton } from "@/components/products/print-store-bill-button";
import { formatCurrency } from "@/lib/invoice-utils";
import { numberToWordsIndian } from "@/lib/number-to-words";

export const dynamic = "force-dynamic";

export default async function StoreBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bill, profile] = await Promise.all([fetchStoreBill(id), getCompanyProfile()]);

  if (!bill) {
    notFound();
  }

  const companyName = profile?.companyName || "Sri Manjunatha Engineering Works";
  const address = profile?.address || "No. 42, Industrial Area, Peenya 3rd Phase";
  const cityState = `${profile?.city || "Bengaluru"}, ${profile?.state || "Karnataka"} - ${profile?.zipCode || "560058"}`;
  const gstin = profile?.taxId || "29AABCU9603R1ZM";
  const phone = profile?.phone || "9483374137";
  const email = profile?.email || "sales@srimanjunatha.com";
  const bankName = profile?.bankName || "State Bank of India";
  const accountNumber = profile?.accountNumber || "38492019482";
  const ifsc = profile?.routingNumber || "SBIN0004051";

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print border-b border-border/80 pb-4">
        <Link
          href="/grow/online-store"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Online Store</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-xs font-mono font-bold">
            STORE GST BILL • {bill.billNumber}
          </Badge>
          <PrintStoreBillButton />
        </div>
      </div>

      {/* Formal Tax Invoice Template (matching Sri Manjunatha Engineering Works format) */}
      <div className="rounded-xl border border-zinc-300 bg-white text-zinc-900 p-8 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none font-sans text-xs">
        {/* Header Strip */}
        <div className="border-b-2 border-zinc-900 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Online Store Digital Invoice
              </span>
              <h1 className="text-xl font-black text-zinc-950 uppercase tracking-tight mt-0.5">
                {companyName}
              </h1>
              <p className="text-zinc-600 mt-1 max-w-md">{address}, {cityState}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-zinc-700">
                <span><strong>GSTIN:</strong> {gstin}</span>
                <span><strong>Ph:</strong> {phone}</span>
                <span><strong>Email:</strong> {email}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-zinc-900 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded">
                Tax Invoice (GST)
              </div>
              <div className="mt-2 text-right space-y-0.5">
                <p className="font-mono text-sm font-black text-zinc-950">
                  Bill No: {bill.billNumber}
                </p>
                <p className="text-[11px] text-zinc-600">
                  Date: {new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <p className="text-[11px] text-zinc-600">
                  Payment: <span className="font-semibold">{bill.paymentMode}</span> ({bill.paymentStatus})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Party Details */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-300">
          <div>
            <h3 className="text-[11px] font-black uppercase text-zinc-500 mb-1">
              Billed To (Customer):
            </h3>
            <p className="text-sm font-bold text-zinc-950">{bill.customerName}</p>
            <p className="text-zinc-600 mt-0.5">{bill.customerAddress}</p>
            <p className="font-mono text-zinc-700 mt-0.5">Contact: {bill.customerPhone}</p>
          </div>

          <div className="text-right">
            <h3 className="text-[11px] font-black uppercase text-zinc-500 mb-1">
              Shipping / Delivery Info:
            </h3>
            <p className="text-zinc-700">Status: <strong>{bill.fulfillmentStatus}</strong></p>
            <p className="text-zinc-700">Channel: Direct WhatsApp / Online Catalog</p>
            <p className="text-zinc-700">Place of Supply: Karnataka (29)</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[11px] font-black uppercase text-zinc-700">
                <th className="py-2 w-10">#</th>
                <th className="py-2">Item Description</th>
                <th className="py-2 w-20">HSN</th>
                <th className="py-2 text-right w-16">Qty</th>
                <th className="py-2 text-right w-24">Rate (₹)</th>
                <th className="py-2 text-right w-20">GST %</th>
                <th className="py-2 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {bill.items.map((it, idx) => (
                <tr key={it.id || idx} className="text-xs">
                  <td className="py-2 text-zinc-500 font-mono">{idx + 1}</td>
                  <td className="py-2 font-medium text-zinc-950">{it.name}</td>
                  <td className="py-2 text-zinc-600 font-mono">{it.hsn}</td>
                  <td className="py-2 text-right font-mono">{it.quantity}</td>
                  <td className="py-2 text-right font-mono">{it.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono">{it.gstRate}%</td>
                  <td className="py-2 text-right font-mono font-bold">{it.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Calculation Summary */}
        <div className="grid grid-cols-12 gap-4 border-t-2 border-zinc-900 pt-4">
          <div className="col-span-7 space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-500">
                Amount in Words:
              </span>
              <p className="text-xs font-semibold italic text-zinc-800 capitalize">
                INR {numberToWordsIndian(Math.round(bill.total))} Only
              </p>
            </div>

            <div className="rounded border border-zinc-200 p-2.5 space-y-1 bg-zinc-50 text-[11px]">
              <span className="font-bold text-zinc-900">Bank Transfer Details:</span>
              <p className="text-zinc-700">Bank: {bankName} | A/c No: {accountNumber} | IFSC: {ifsc}</p>
            </div>
          </div>

          <div className="col-span-5 space-y-1.5 text-right font-mono text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Taxable Value:</span>
              <span>₹ {bill.subtotal.toFixed(2)}</span>
            </div>
            {bill.cgst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>CGST:</span>
                <span>₹ {bill.cgst.toFixed(2)}</span>
              </div>
            )}
            {bill.sgst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>SGST:</span>
                <span>₹ {bill.sgst.toFixed(2)}</span>
              </div>
            )}
            {bill.igst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>IGST:</span>
                <span>₹ {bill.igst.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-zinc-900 pt-2 text-sm font-black text-zinc-950">
              <span>Total Bill Amount:</span>
              <span>₹ {bill.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-end">
          <div className="text-[10px] text-zinc-500">
            <p>1. Goods once sold will not be taken back without original bill.</p>
            <p>2. Subject to local jurisdiction.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-950">For {companyName}</p>
            <div className="h-12" />
            <p className="text-[11px] text-zinc-600 border-t border-zinc-400 pt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
