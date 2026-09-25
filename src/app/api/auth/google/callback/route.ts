import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = env.APP_URL || env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=Google+Authentication+was+cancelled`);
  }

  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=Google+OAuth+credentials+missing`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=Failed+to+exchange+Google+authorization+code`);
    }

    // 2. Fetch user profile from Google UserInfo API
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();

    if (!googleUser?.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=Could+not+retrieve+email+from+Google+profile`);
    }

    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name || googleUser.given_name || email.split("@")[0];

    // 3. Find or create User and Organization in database
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create random secure password for OAuth user
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString(36);
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      const companyName = `${name}'s Business`;

      user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          organization: {
            create: {
              name: companyName,
              profile: {
                create: {
                  companyName,
                  paymentTerms: "Net 30",
                  invoicePrefix: "INV",
                  nextInvoiceNumber: 1,
                  currency: "INR",
                  defaultTaxRate: 0,
                },
              },
            },
          },
        },
      });
    }

    // 4. Create user session cookie
    await createSession(user.id);

    // 5. Redirect to Dashboard
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/login?error=An+unexpected+error+occurred+during+Google+sign+in`);
  }
}
