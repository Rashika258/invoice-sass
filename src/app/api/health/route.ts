import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbError = null;

  try {
    // Basic ping check to ensure database query succeeds
    await db.$queryRaw`SELECT 1`;
  } catch (error: any) {
    dbStatus = "unhealthy";
    dbError = error?.message || "Database connection failed";
  }

  const responseTimeMs = Date.now() - startTime;
  const isHealthy = dbStatus === "healthy";

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      appName: env.NEXT_PUBLIC_APP_NAME,
      environment: env.NODE_ENV,
      services: {
        database: {
          status: dbStatus,
          error: dbError,
          latencyMs: responseTimeMs,
        },
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
