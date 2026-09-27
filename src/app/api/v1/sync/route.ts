import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createInvoice } from "@/actions/invoices";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Sync error";
        syncedResults.push({ id: invData.id, status: "ERROR", error: message });
      }
    }

    return NextResponse.json({
      success: true,
      results: syncedResults,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process mobile sync batch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
