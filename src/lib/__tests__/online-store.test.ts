import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "@/lib/db";

// Global mock variable for org id in test
let currentTestOrgId = "";

vi.mock("@/lib/organization", () => ({
  requireOrganization: vi.fn(async () => {
    if (!currentTestOrgId) {
      return { id: "test_org_fallback", name: "Test Store" };
    }
    const org = await db.organization.findUnique({ where: { id: currentTestOrgId } });
    return org || { id: currentTestOrgId, name: "Test Store" };
  }),
}));

import {
  getStoreCatalog,
  createDirectOnlineOrderAction,
  convertOrderToBill,
} from "@/actions/online-store";

describe("Online Store Security & Order Processing", () => {
  let publicItemId: string;
  let hiddenItemId: string;

  beforeEach(async () => {
    // 1. Create test organization
    const org = await db.organization.create({
      data: {
        name: `ECom Test Store ${Date.now()}`,
      },
    });
    currentTestOrgId = org.id;

    // 2. Create company profile
    await db.companyProfile.create({
      data: {
        organizationId: currentTestOrgId,
        companyName: "Zenith E-Store",
        phone: "9876543210",
        email: "store@zenith.com",
        city: "Bengaluru",
        state: "Karnataka",
        currency: "INR",
      },
    });

    // 3. Create a public product item
    const publicItem = await db.item.create({
      data: {
        organizationId: currentTestOrgId,
        name: "Wireless Ergonomic Mouse",
        unitPrice: 1500,
        purchasePrice: 900,
        gstRate: 18,
        unit: "PCS",
        stockQty: 50,
        itemType: "PRODUCT",
        isPublic: true,
      },
    });
    publicItemId = publicItem.id;

    // 4. Create a hidden/private product item
    const hiddenItem = await db.item.create({
      data: {
        organizationId: currentTestOrgId,
        name: "Internal Wholesale Cable",
        unitPrice: 200,
        purchasePrice: 100,
        gstRate: 18,
        unit: "PCS",
        stockQty: 100,
        itemType: "PRODUCT",
        isPublic: false,
      },
    });
    hiddenItemId = hiddenItem.id;
  });

  it("should filter out non-public items in public store catalog", async () => {
    const catalog = await getStoreCatalog(currentTestOrgId);
    expect(catalog).not.toBeNull();
    expect(catalog?.companyName).toBe("Zenith E-Store");

    const itemNames = catalog?.items.map((i) => i.name);
    expect(itemNames).toContain("Wireless Ergonomic Mouse");
    expect(itemNames).not.toContain("Internal Wholesale Cable");
  });

  it("should prevent price tampering during online checkout by enforcing DB prices", async () => {
    // Attempt price tampering: Client sends unitPrice: 10 instead of 1500
    const result = await createDirectOnlineOrderAction({
      slug: currentTestOrgId,
      customerName: "Aarav Patel",
      phone: "9988776655",
      address: "123 Tech Park, Whitefield",
      paymentMethod: "UPI",
      items: [
        {
          id: publicItemId,
          name: "Wireless Ergonomic Mouse",
          quantity: 2,
          unitPrice: 10, // Manipulated low price!
        },
      ],
    });

    expect(result.success).toBe(true);
    // 2 items * 1500 (DB unitPrice) = 3000 subtotal. GST 18% = 540. Total = 3540.
    expect(result.total).toBe(3540);
    expect(result.upiPayUrl).toContain("upi://pay");
    expect(result.upiPayUrl).toContain("3540.00");
  });

  it("should convert online sale order to formal sale bill with sequential numbering", async () => {
    const orderResult = await createDirectOnlineOrderAction({
      slug: currentTestOrgId,
      customerName: "Neha Sharma",
      phone: "9112233445",
      address: "45 MG Road, Bengaluru",
      paymentMethod: "COD",
      items: [
        {
          id: publicItemId,
          name: "Wireless Ergonomic Mouse",
          quantity: 1,
          unitPrice: 1500,
        },
      ],
    });

    const orderInDb = await db.invoice.findFirst({
      where: { organizationId: currentTestOrgId, invoiceNumber: orderResult.orderId },
    });
    expect(orderInDb).not.toBeNull();
    expect(orderInDb?.documentType).toBe("SALE_ORDER");

    // Convert order to formal bill
    const convertResult = await convertOrderToBill(orderInDb!.id);
    expect(convertResult.success).toBe(true);
    expect(convertResult.billNumber).toContain("INV-");

    const billInDb = await db.invoice.findUnique({
      where: { id: convertResult.billId },
    });
    expect(billInDb?.documentType).toBe("SALE");
    expect(billInDb?.total).toBe(orderInDb?.total);
  });
});
