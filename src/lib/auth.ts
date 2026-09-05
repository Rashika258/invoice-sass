import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "invoiceflow_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return secret;
}

function signPayload(payload: string) {
  const signature = createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifyPayload(token: string) {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");

  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return payload;
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString(
    "base64url",
  );
  const token = signPayload(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyPayload(token);
  if (!payload) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as { userId: string; expiresAt: number };

    if (data.expiresAt < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    include: {
      organization: {
        include: { profile: true },
      },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?unauthenticated=1");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin privileges required");
  }
  return user;
}

export async function getOrganizationId() {
  const user = await requireUser();
  return user.organizationId;
}

