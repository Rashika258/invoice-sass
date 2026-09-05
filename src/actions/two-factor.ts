"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { generateTotpSecret, getTotpUri, verifyTotpCode } from "@/lib/totp";

export async function setupTwoFactor() {
  const user = await requireUser();
  const secret = generateTotpSecret();
  const uri = getTotpUri(secret, user.email);

  await db.user.update({
    where: { id: user.id },
    data: { totpSecret: secret },
  });

  return { secret, uri };
}

export async function verifyAndEnableTwoFactor(code: string) {
  const user = await requireUser();
  if (!user.totpSecret) {
    throw new Error("2FA setup not initiated");
  }

  const isValid = verifyTotpCode(user.totpSecret, code);
  if (!isValid) {
    throw new Error("Invalid 6-digit code. Please check your Authenticator app.");
  }

  await db.user.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function disableTwoFactor() {
  const user = await requireUser();

  await db.user.update({
    where: { id: user.id },
    data: { totpSecret: null, totpEnabled: false },
  });

  revalidatePath("/settings");
  return { success: true };
}
