import { NextResponse } from "next/server";
import { getItems } from "@/actions/items";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.toLowerCase();
    const barcode = searchParams.get("barcode");

    const items = await getItems();

    if (barcode) {
      const match = items.find(
        (it) => it.id === barcode || it.name.toLowerCase() === barcode.toLowerCase(),
      );
      return NextResponse.json({
        success: true,
        item: match || null,
      });
    }

    if (query) {
      const filtered = items.filter(
        (it) =>
          it.name.toLowerCase().includes(query) ||
          (it.hsn && it.hsn.toLowerCase().includes(query)),
      );
      return NextResponse.json({
        success: true,
        items: filtered,
      });
    }

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch items" },
      { status: 500 },
    );
  }
}
