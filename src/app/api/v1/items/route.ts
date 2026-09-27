import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getItems } from "@/actions/items";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
