import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const baseUrl = env.APP_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId) {
    // If Client ID isn't configured, redirect to login with informative error parameter
    return NextResponse.redirect(`${baseUrl}/login?error=Google+Auth+Client+ID+not+configured`);
  }

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.append("client_id", clientId);
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.append("response_type", "code");
  googleAuthUrl.searchParams.append("scope", "openid email profile");
  googleAuthUrl.searchParams.append("access_type", "offline");
  googleAuthUrl.searchParams.append("prompt", "consent");

  return NextResponse.redirect(googleAuthUrl.toString());
}
