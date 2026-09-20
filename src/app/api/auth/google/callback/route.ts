import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = request.headers.get("cookie") || "";
  const stateCookie = cookies.match(/(?:^|; )billora_oauth_state=([^;]+)/)?.[1];
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const failure = (message: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, appUrl));
  if (!code || !state || !stateCookie || state !== decodeURIComponent(stateCookie)) return failure("google_state_invalid");

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return failure("google_not_configured");
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !tokens.access_token) return failure("google_token_failed");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json() as { email?: string; name?: string; email_verified?: boolean };
    if (!profileResponse.ok || !profile.email || profile.email_verified === false) return failure("google_email_unverified");

    let user = await db.user.findUnique({ where: { email: profile.email.toLowerCase() } });
    if (!user) {
      user = await db.user.create({ data: { name: profile.name?.trim() || profile.email.split("@")[0], email: profile.email.toLowerCase(), passwordHash: `oauth:google:${crypto.randomUUID()}`, organization: { create: { name: `${profile.name || "My"} Business`, profile: { create: { companyName: `${profile.name || "My"} Business`, currency: "INR", defaultTaxRate: 18 } } } } } });
    }
    await createSession(user.id);
    const stateData = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { callback?: string };
    const callback = stateData.callback && stateData.callback.startsWith("/") && !stateData.callback.startsWith("//") ? stateData.callback : "/dashboard";
    const response = NextResponse.redirect(new URL(callback, appUrl));
    response.cookies.delete("billora_oauth_state");
    return response;
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    return failure("google_login_failed");
  }
}
