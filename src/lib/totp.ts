/**
 * Lightweight RFC 6238 TOTP Engine for Two-Factor Authentication (2FA)
 * Built with Node.js crypto module — Zero external library dependencies.
 */

import { createHmac, randomBytes } from "crypto";

// Base32 Alphabet
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  const buffer = randomBytes(20);
  let secret = "";
  for (let i = 0; i < buffer.length; i++) {
    secret += ALPHABET[buffer[i] % 32];
  }
  return secret;
}

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bits: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = ALPHABET.indexOf(clean[i]);
    for (let bit = 4; bit >= 0; bit--) {
      bits.push((val >> bit) & 1);
    }
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }

  return Buffer.from(bytes);
}

export function generateTotpCode(secret: string, timeStep = 30): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);

  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (codeInt % 1000000).toString().padStart(6, "0");
  return code;
}

export function verifyTotpCode(secret: string, userCode: string): boolean {
  const cleanCode = userCode.trim();
  if (cleanCode.length !== 6) return false;

  // Allow 1 step (30s) clock skew tolerance (past, current, future)
  const currentCode = generateTotpCode(secret, 30);
  if (currentCode === cleanCode) return true;

  // Check +/- 30 seconds
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);

  for (const delta of [-1, 1]) {
    const counter = Math.floor((epoch + delta * 30) / 30);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));
    const hmac = createHmac("sha1", key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const codeInt =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    const code = (codeInt % 1000000).toString().padStart(6, "0");
    if (code === cleanCode) return true;
  }

  return false;
}

export function getTotpUri(secret: string, email: string, issuer = "Billora ERP"): string {
  const cleanIssuer = encodeURIComponent(issuer);
  const cleanAccount = encodeURIComponent(email);
  return `otpauth://totp/${cleanIssuer}:${cleanAccount}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}
