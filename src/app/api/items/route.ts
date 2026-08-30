import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { listItems, createItem } from '@/actions/items';

export async function GET() {
  const items = await listItems();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await createItem(body as any);
  return NextResponse.json(created);
}
