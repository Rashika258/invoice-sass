import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listCustomers, createCustomer } from '@/actions/customers';

export async function GET() {
  const customers = await listCustomers();
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await createCustomer(body);
  return NextResponse.json(created);
}
