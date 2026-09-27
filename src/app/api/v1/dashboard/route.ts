import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBusinessSummary } from "@/actions/reports";
import { getBusinessInsights } from "@/lib/analytics";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    const summary = await getBusinessSummary();
    const insights = orgId ? await getBusinessInsights(orgId) : null;

    return NextResponse.json({
      success: true,
      summary,
      insights,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard metrics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
