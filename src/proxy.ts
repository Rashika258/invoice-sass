import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const protectedPrefixes = [
  "/dashboard",
  "/invoices",
  "/customers",
  "/items",
  "/employees",
  "/attendance",
  "/settings",
  "/accounting",
  "/ai",
  "/reports",
  "/expenses",
  "/payments",
  "/cash-bank",
  "/purchases",
  "/estimates",
  "/challans",
  "/proforma",
  "/sale-orders",
  "/payment-in",
  "/payment-out",
  "/purchase-orders",
  "/credit-notes",
  "/debit-notes",
  "/pos",
  "/alerts",
  "/companies",
  "/compliance",
  "/ca-portal",
  "/tally",
  "/plans",
  "/grow",
  "/sync-share",
  "/utilities",
];

function verifyToken(token: string): boolean {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { userId: string; expiresAt: number };

    if (!data.userId || !data.expiresAt || data.expiresAt < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("invoiceflow_session")?.value;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const isUnauthenticatedQuery = searchParams.has("unauthenticated");
  const isValidToken = token ? verifyToken(token) : false;

  // 1. Protected route requested, but token is missing or invalid
  if (isProtected && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("unauthenticated", "1");
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("invoiceflow_session");
    return res;
  }

  // 2. Auth page (/login, /register) requested
  if (isAuthPage) {
    // If explicit unauthenticated redirect flag OR invalid token: clear session cookie and render login page directly
    if (isUnauthenticatedQuery || !isValidToken) {
      const res = NextResponse.next();
      if (token) {
        res.cookies.delete("invoiceflow_session");
      }
      return res;
    }
    // Only redirect valid session to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|api/).*)",
  ],
};
