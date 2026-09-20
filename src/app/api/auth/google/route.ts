import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
  if (!clientId) return NextResponse.redirect(new URL("/login?error=google_not_configured", appUrl));
  const callback = `${appUrl}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ callback: url.searchParams.get("callbackUrl") || "/dashboard", nonce: crypto.randomUUID() })).toString("base64url");
  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: clientId, redirect_uri: callback, response_type: "code", scope: "openid email profile", state, prompt: "select_account" })}`);
  response.cookies.set("billora_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
