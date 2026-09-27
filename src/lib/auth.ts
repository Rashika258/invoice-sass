import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "invoiceflow_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret() {
  const defaultSecret = "billora-default-dev-secret-key-2026";
  const secret = process.env.AUTH_SECRET || defaultSecret;
  if (process.env.NODE_ENV === "production" && secret === defaultSecret) {
    throw new Error(
      "FATAL SECURITY ERROR: AUTH_SECRET must be configured with a strong secret in production."
    );
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

import type { UserRole } from "@/generated/prisma/client";

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized: Role '${user.role}' lacks permission for this action.`);
  }
  return user;
}

export function hasRole(role: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(role);
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

import { assertPermission, type Permission } from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  assertPermission(user.role, permission);
  return user;
}

export async function getOrganizationId() {
  const user = await requireUser();
  return user.organizationId;
}


