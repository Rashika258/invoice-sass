import { describe, it, expect } from "vitest";
import { buildUpiPayUrl, generateQrCodeImageUrl } from "@/lib/dynamic-upi-qr";
import { convertVoucherToTallyXml, parseTallyXmlToVoucher } from "@/lib/tally-sync-engine";
import { generateTotpSecret, generateTotpUri, verifyTotpToken } from "@/lib/totp-auth";
import { checkCustomPermission } from "@/lib/permissions";
import { calculateSalesVelocity, forecastItemDepletion, predict30DayCashflow } from "@/lib/ai-forecasting";
import { calculateReminderSchedule } from "@/lib/automated-reminders";

describe("Dynamic UPI QR Payment Engine", () => {
  it("builds valid standards-compliant upi://pay URI", () => {
    const url = buildUpiPayUrl({
      vpa: "store@okaxis",
      payeeName: "Billora Retail",
      amount: 1450.5,
      transactionRef: "INV-2026-99",
      note: "Invoice #99",
    });

    expect(url).toContain("upi://pay?");
    expect(url).toContain("pa=store%40okaxis");
    expect(url).toContain("am=1450.50");
    expect(url).toContain("tr=INV-2026-99");
  });

  it("generates QR code image URL for UPI payload", () => {
    const qrUrl = generateQrCodeImageUrl("upi://pay?pa=test@upi");
    expect(qrUrl).toContain("https://api.qrserver.com/v1/create-qr-code/");
    expect(qrUrl).toContain("upi%3A%2F%2Fpay");
  });
});

describe("Tally Prime XML Sync Engine", () => {
  it("converts sales voucher into Tally Prime XML structure", () => {
    const xml = convertVoucherToTallyXml({
      voucherType: "Sales",
      voucherNumber: "SLV-1001",
      date: "2026-09-27",
      partyName: "Acme Corp",
      amount: 5000,
      narration: "Sales to Acme",
      entries: [
        { ledgerName: "Acme Corp", isDeemedPositive: true, amount: 5000 },
        { ledgerName: "Sales Account", isDeemedPositive: false, amount: 5000 },
      ],
    });

    expect(xml).toContain("<VOUCHER VCHTYPE=\"Sales\" ACTION=\"Create\">");
    expect(xml).toContain("<VOUCHERNUMBER>SLV-1001</VOUCHERNUMBER>");
    expect(xml).toContain("<LEDGERNAME>Acme Corp</LEDGERNAME>");
    expect(xml).toContain("<AMOUNT>-5000</AMOUNT>");
  });

  it("parses Tally XML into voucher data structure", () => {
    const xml = `<VOUCHER VCHTYPE="Sales"><VOUCHERNUMBER>TAL-500</VOUCHERNUMBER><PARTYLEDGERNAME>Tech Corp</PARTYLEDGERNAME></VOUCHER>`;
    const voucher = parseTallyXmlToVoucher(xml);
    expect(voucher.voucherNumber).toBe("TAL-500");
    expect(voucher.partyName).toBe("Tech Corp");
  });
});

describe("Two-Factor Authentication (2FA / TOTP) Security Engine", () => {
  it("generates base32 secret and valid OTP URI", () => {
    const secret = generateTotpSecret();
    expect(secret.length).toBeGreaterThanOrEqual(16);

    const uri = generateTotpUri(secret, "admin@billora.app");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("admin%40billora.app");
  });

  it("verifies time-based OTP tokens within time window", () => {
    const secret = generateTotpSecret();
    // Verification with empty/invalid format token fails
    expect(verifyTotpToken(secret, "000000")).toBeDefined();
    expect(verifyTotpToken(secret, "abc")).toBe(false);
  });
});

describe("Custom RBAC Permission Evaluation", () => {
  it("grants full access to ADMIN role", () => {
    expect(checkCustomPermission("ADMIN", [], "sales:delete")).toBe(true);
  });

  it("evaluates custom role permission arrays accurately", () => {
    const customPermissions = ["INVENTORY_READ", "INVENTORY_MANAGE"] as any[];
    expect(checkCustomPermission("STAFF", customPermissions, "inventory:adjust")).toBe(true);
    expect(checkCustomPermission("STAFF", customPermissions, "payroll:approve")).toBe(false);
  });
});

describe("AI Sales Velocity & Cashflow Forecasting", () => {
  it("calculates sales velocity and inventory depletion", () => {
    const history = [
      { date: "2026-09-01", amount: 1000, unitsSold: 10 },
      { date: "2026-09-02", amount: 2000, unitsSold: 20 },
    ];
    const velocity = calculateSalesVelocity(history, 30);
    expect(velocity).toBe(1);

    const forecast = forecastItemDepletion("item-1", "Widget", 50, history);
    expect(forecast.daysUntilDepletion).toBe(50);
    expect(forecast.recommendedOrderQty).toBe(0);
  });

  it("predicts 30-day cashflow summary", () => {
    const invoices = [
      { amount: 10000, paidAmount: 2000, dueDate: new Date() },
    ];
    const expenses = [{ amount: 3000 }];

    const cf = predict30DayCashflow(invoices, expenses, 0.90);
    expect(cf.projectedInflow30Days).toBe(7200);
    expect(cf.projectedOutflow30Days).toBe(3000);
    expect(cf.netProjectedCashflow).toBe(4200);
  });
});

describe("Automated Debt Collection Schedule", () => {
  it("calculates overdue debt collection reminder triggers", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 5);

    const invoices = [
      {
        id: "inv-overdue",
        invoiceNumber: "INV-101",
        total: 5000,
        paidAmount: 1000,
        dueDate: yesterday,
        customer: { name: "John Customer", phone: "919876543210" },
      },
    ];

    const reminders = calculateReminderSchedule(invoices);
    expect(reminders.length).toBe(1);
    expect(reminders[0].reminderStage).toBe("OVERDUE_LIGHT");
    expect(reminders[0].amountDue).toBe(4000);
    expect(reminders[0].messageText).toContain("INV-101");
  });
});
