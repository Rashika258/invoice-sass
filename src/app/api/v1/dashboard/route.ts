import { NextResponse } from "next/server";
import { getBusinessSummary } from "@/actions/reports";
import { getBusinessInsights } from "@/lib/analytics";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    const summary = await getBusinessSummary();
    const insights = orgId ? await getBusinessInsights(orgId) : null;

    return NextResponse.json({
      success: true,
      summary,
      insights,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
