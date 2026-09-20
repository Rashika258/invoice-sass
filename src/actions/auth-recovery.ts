"use server";

import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const RESET_TTL_SECONDS = 30 * 60;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not configured");
  return secret;
}

function signResetToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS })).toString("base64url");
  const signature = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyResetToken(token: string) {
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", authSecret()).update(payload).digest("base64url");
  try {
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: string; exp?: number };
    return data.userId && data.exp && data.exp >= Math.floor(Date.now() / 1000) ? data.userId : null;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address" };

  const user = await db.user.findUnique({ where: { email: email.data.toLowerCase() } });
  // Always return the same response to avoid account enumeration.
  if (user) {
    const token = signResetToken(user.id);
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    if (process.env.PASSWORD_RESET_LOG === "true" || process.env.NODE_ENV !== "production") {
      console.info(`[Password reset link for ${user.email}] ${resetUrl}`);
    }
    // Configure an email provider before enabling production delivery.
    if (process.env.RESEND_API_KEY && process.env.PASSWORD_RESET_FROM) {
      await sendResetEmail(user.email, resetUrl);
    }
  }
  return { success: true };
}

async function sendResetEmail(to: string, resetUrl: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.PASSWORD_RESET_FROM, to, subject: "Reset your Billora password", html: `<p>Reset your password within 30 minutes:</p><p><a href="${resetUrl}">Reset password</a></p>` }),
  });
  if (!response.ok) throw new Error("Unable to send password reset email");
}

export async function resetPassword(formData: FormData) {
  const parsed = z.object({ token: z.string().min(1), password: z.string().min(8, "Password must be at least 8 characters") }).safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid reset request" };
  const userId = verifyResetToken(parsed.data.token);
  if (!userId) return { error: "This reset link is invalid or expired" };
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.update({ where: { id: userId }, data: { passwordHash } });
  await createSession(user.id);
  redirect("/dashboard");
}
