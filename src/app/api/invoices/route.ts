import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createInvoice } from '@/actions/invoices';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createInvoice(body as any);
    return NextResponse.json(created);
  } catch (err: any) {
    console.error('Failed to create invoice', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use server actions or listInvoices() for listing' });
}
