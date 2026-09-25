import { NextRequest, NextResponse } from "next/server";
import { JobsEngine } from "@/lib/jobs-engine";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "billora-cron-secret-2026";

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  const results = await JobsEngine.runAllJobs();
  return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
}
