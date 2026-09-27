/**
 * 🔐 Billora Two-Factor Authentication (2FA) Engine
 * Standard RFC 6238 TOTP (Time-Based One-Time Password) generator & verifier.
 */

import { createHmac, randomBytes } from "crypto";

export function generateTotpSecret(): string {
  // Generate random 20-byte base32 secret key
  const buffer = randomBytes(20);
  return base32Encode(buffer);
}

export function generateTotpUri(secret: string, userEmail: string, issuer = "Billora ERP"): string {
  const cleanIssuer = encodeURIComponent(issuer);
  const cleanEmail = encodeURIComponent(userEmail);
  return `otpauth://totp/${cleanIssuer}:${cleanEmail}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function verifyTotpToken(secret: string, token: string, window = 1): boolean {
  if (!token || token.length !== 6 || !/^\d+$/.test(token)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const step = currentStep + errorWindow;
    const expected = generateHmacSha1Totp(secret, step);
    if (expected === token) {
      return true;
    }
  }

  return false;
}

function generateHmacSha1Totp(secret: string, step: number): string {
  const secretBuffer = base32Decode(secret);

  const buffer = Buffer.alloc(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = step & 0xff;
    step = step >> 8;
  }

  const hmac = createHmac("sha1", secretBuffer).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (code % 1000000).toString();
  return otp.padStart(6, "0");
}

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanInput = input.toUpperCase().replace(/=/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanInput.length; i++) {
    const index = alphabet.indexOf(cleanInput[i]);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}
