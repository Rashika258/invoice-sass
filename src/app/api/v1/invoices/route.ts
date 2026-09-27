import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getInvoices, createInvoice } from "@/actions/invoices";
import type { DocumentType } from "@/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docType = searchParams.get("documentType") as DocumentType | null;
    const invoices = await getInvoices(docType || undefined);

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch invoices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const invoice = await createInvoice(body);

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
