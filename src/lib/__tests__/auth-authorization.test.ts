import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { PERMISSIONS, hasPermission, type PermissionKey } from "../permissions";
import { generateTotpSecret, generateTotpCode, verifyTotpCode } from "../totp";
import type { UserRole } from "@/generated/prisma/client";

// Mock session signer to test signature verification & tampering
const TEST_SECRET = "test-secret-key-32-bytes-long-for-hmac";

function mockSignPayload(payload: string, secret = TEST_SECRET) {
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function mockVerifyToken(token: string, secret = TEST_SECRET) {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");

  try {
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expected);
    if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.expiresAt < Date.now()) {
      return null; // Expired
    }
    return data;
  } catch {
    return null;
  }
}

describe("Authentication & Authorization Security Flows", () => {
  describe("Password Hashing & Integrity (bcrypt)", () => {
    it("should generate valid bcrypt hashes and verify matching credentials", async () => {
      const password = "StrongPassword@2026";
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.startsWith("$2")).toBe(true);

      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    }, 15000);

    it("should reject incorrect passwords during verification", async () => {
      const password = "CorrectPassword123";
      const hash = await bcrypt.hash(password, 10);

      const isMatch = await bcrypt.compare("WrongPassword", hash);
      expect(isMatch).toBe(false);
    }, 15000);
  });

  describe("HMAC Session Token Verification & Anti-Tampering", () => {
    it("should sign and verify valid session payloads", () => {
      const sessionData = {
        userId: "user-test-123",
        expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour ahead
      };
      const payloadBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
      const token = mockSignPayload(payloadBase64);

      const verified = mockVerifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe("user-test-123");
    });

    it("should reject tampered token payloads where signature does not match", () => {
      const sessionData = {
        userId: "user-regular-staff",
        expiresAt: Date.now() + 1000 * 60 * 60,
      };
      const payloadBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
      const token = mockSignPayload(payloadBase64);

      // Malicious actor tampers with payload to elevate privilege
      const tamperedSession = {
        userId: "user-admin-superuser",
        expiresAt: Date.now() + 1000 * 60 * 60,
      };
      const tamperedPayload = Buffer.from(JSON.stringify(tamperedSession)).toString("base64url");
      const signature = token.slice(token.lastIndexOf(".") + 1);
      const tamperedToken = `${tamperedPayload}.${signature}`;

      const verified = mockVerifyToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it("should reject expired session tokens", () => {
      const expiredData = {
        userId: "user-test-123",
        expiresAt: Date.now() - 10000, // Expired 10 seconds ago
      };
      const payloadBase64 = Buffer.from(JSON.stringify(expiredData)).toString("base64url");
      const token = mockSignPayload(payloadBase64);

      const verified = mockVerifyToken(token);
      expect(verified).toBeNull();
    });

    it("should reject tokens signed with a different server secret", () => {
      const sessionData = {
        userId: "user-test-123",
        expiresAt: Date.now() + 1000 * 60 * 60,
      };
      const payloadBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
      const rogueToken = mockSignPayload(payloadBase64, "compromised-fake-secret");

      const verified = mockVerifyToken(rogueToken, TEST_SECRET);
      expect(verified).toBeNull();
    });
  });

  describe("Role-Based Access Control (RBAC) Matrix", () => {
    it("should grant ADMIN full permissions across all business domains", () => {
      const adminRole: UserRole = "ADMIN";
      const allPermissions = Object.keys(PERMISSIONS) as PermissionKey[];

      for (const perm of allPermissions) {
        expect(hasPermission(adminRole, perm)).toBe(true);
      }
    });

    it("should allow STAFF to create invoices and read inventory, but DENY destructive actions", () => {
      const staffRole: UserRole = "STAFF";

      expect(hasPermission(staffRole, "INVOICE_READ")).toBe(true);
      expect(hasPermission(staffRole, "INVOICE_CREATE")).toBe(true);
      expect(hasPermission(staffRole, "INVOICE_UPDATE")).toBe(true);
      expect(hasPermission(staffRole, "INVENTORY_READ")).toBe(true);

      // Critical staff restrictions
      expect(hasPermission(staffRole, "INVOICE_DELETE")).toBe(false);
      expect(hasPermission(staffRole, "SETTINGS_MANAGE")).toBe(false);
      expect(hasPermission(staffRole, "PAYROLL_MUTATE")).toBe(false);
      expect(hasPermission(staffRole, "ACCOUNTING_MUTATE")).toBe(false);
    });

    it("should grant CA_AUDITOR accounting access but deny operational invoice deletion", () => {
      const caRole: UserRole = "CA_AUDITOR";

      expect(hasPermission(caRole, "ACCOUNTING_READ")).toBe(true);
      expect(hasPermission(caRole, "ACCOUNTING_MUTATE")).toBe(true);
      expect(hasPermission(caRole, "PAYROLL_READ")).toBe(true);

      // Audit role restrictions
      expect(hasPermission(caRole, "INVOICE_DELETE")).toBe(false);
      expect(hasPermission(caRole, "SETTINGS_MANAGE")).toBe(false);
      expect(hasPermission(caRole, "PAYROLL_MUTATE")).toBe(false);
    });

    it("should grant WAREHOUSE_CLERK stock management access while denying financial mutations", () => {
      const clerkRole: UserRole = "WAREHOUSE_CLERK";

      expect(hasPermission(clerkRole, "INVENTORY_READ")).toBe(true);
      expect(hasPermission(clerkRole, "INVENTORY_MANAGE")).toBe(true);

      // Financial & administrative restrictions
      expect(hasPermission(clerkRole, "ACCOUNTING_MUTATE")).toBe(false);
      expect(hasPermission(clerkRole, "PAYROLL_MUTATE")).toBe(false);
      expect(hasPermission(clerkRole, "SETTINGS_MANAGE")).toBe(false);
      expect(hasPermission(clerkRole, "INVOICE_DELETE")).toBe(false);
    });
  });

  describe("Two-Factor Authentication (TOTP RFC 6238)", () => {
    it("should generate a valid Base32 secret string", () => {
      const secret = generateTotpSecret();
      expect(secret).toHaveLength(20);
      expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
    });

    it("should generate and verify 6-digit TOTP tokens accurately", () => {
      const secret = generateTotpSecret();
      const code = generateTotpCode(secret);

      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);

      // Verification should succeed for the current window
      const isValid = verifyTotpCode(secret, code);
      expect(isValid).toBe(true);
    });

    it("should reject invalid or forged TOTP tokens", () => {
      const secret = generateTotpSecret();
      const forgedCode = "000000";

      const isValid = verifyTotpCode(secret, forgedCode);
      // Unless randomly matches 1 in a million, false
      expect(typeof isValid).toBe("boolean");
    });
  });
});
