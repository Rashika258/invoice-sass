import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=missing_token", url.origin));
  const userId = token.startsWith("billora_token_") ? token.replace("billora_token_", "").split("_")[0] : null;
  if (!userId) return NextResponse.redirect(new URL("/login?error=invalid_token", url.origin));
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.redirect(new URL("/login?error=invalid_token", url.origin));
  await createSession(user.id);
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
