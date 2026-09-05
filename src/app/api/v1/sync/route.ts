import { NextResponse } from "next/server";
import { createInvoice } from "@/actions/invoices";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoices } = body;

    if (!Array.isArray(invoices)) {
      return NextResponse.json(
        { error: "Invalid sync payload: 'invoices' array is required" },
        { status: 400 },
      );
    }

    const syncedResults = [];
    for (const invData of invoices) {
      try {
        const invoice = await createInvoice(invData);
        syncedResults.push({ id: invData.id, status: "SYNCED", serverInvoiceId: invoice.id });
      } catch (err: any) {
        syncedResults.push({ id: invData.id, status: "ERROR", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      results: syncedResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process mobile sync batch" },
      { status: 500 },
    );
  }
}
