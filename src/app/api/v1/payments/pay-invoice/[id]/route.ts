import { NextResponse } from "next/server";
import { generateUpiPayUrl } from "@/lib/payment-gateway";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get("amount") || 1000);
    const name = searchParams.get("name") || "Customer";

    const upiUrl = generateUpiPayUrl({
      vpa: "9448673532@okaxis",
      name: "Billora Business OS",
      amount,
      note: `Invoice_${id}`,
      txnRef: id,
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pay Invoice #${id} - Billora OS</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-4 select-none">
        <div class="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
          <div class="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
            ⚡ BILLORA ONLINE PAYMENT PORTAL
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-slate-100">Pay Invoice #${id}</h1>
            <p class="text-xs text-slate-400 mt-1">Billed to: <span class="font-bold text-slate-200">${name}</span></p>
          </div>

          <div class="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-1">
            <span class="text-xs text-slate-400">Total Payable Amount</span>
            <div class="text-3xl font-black text-emerald-400 font-mono">₹ ${amount.toLocaleString("en-IN")}</div>
            <p class="text-[10px] text-slate-500">Includes GST calculation and immediate payment confirmation</p>
          </div>

          <div class="bg-white p-3 rounded-xl inline-block shadow-lg border">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              upiUrl
            )}&margin=6" alt="UPI QR Code" class="w-44 h-44 object-contain mx-auto" />
          </div>

          <div class="space-y-2 text-xs">
            <p class="font-bold text-slate-300">Scan with GPay, PhonePe, Paytm, or BHIM</p>
            <a href="${upiUrl}" class="block w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs">
              Open UPI App to Pay Directly
            </a>
          </div>

          <div class="pt-2 border-t border-slate-700/60 text-[11px] text-slate-500 flex justify-between">
            <span>Powered by Billora OS</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to render payment portal" },
      { status: 500 }
    );
  }
}
