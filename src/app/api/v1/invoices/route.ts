import { NextResponse } from "next/server";
import { getInvoices, createInvoice } from "@/actions/invoices";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const docType = searchParams.get("documentType") as any;
    const invoices = await getInvoices(docType || undefined);

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const invoice = await createInvoice(body);

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create invoice" },
      { status: 400 },
    );
  }
}
