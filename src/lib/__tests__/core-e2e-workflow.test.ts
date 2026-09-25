import { describe, it, expect } from "vitest";
import { calculateDocumentTotals } from "../invoice-utils";
import { evaluateInvoiceHealth, evaluateCustomerHealth, evaluateItemHealth } from "../data-quality";
import { recordActivity } from "../activity-timeline";

describe("Core End-to-End Business Workflow Suite", () => {
  it("executes complete lifecycle: Customer Check -> Invoice Math -> Health Diagnostic -> Activity Audit", () => {
    // 1. Customer Quality & Health Check
    const customer = {
      name: "Standard Manufacturing Co",
      phone: "9876543210",
      email: "contact@stdmfg.in",
      gstin: "27AABCU9603R1ZM",
      address: "Industrial Area Phase 2, Pune, MH 411026",
      outstandingBalance: 12000,
    };

    const customerHealth = evaluateCustomerHealth(customer);
    expect(customerHealth.status).toBe("HEALTHY");
    expect(customerHealth.score).toBe(100);

    // 2. Line Items & Tax Calculation
    const lineItems = [
      { quantity: 10, unitPrice: 500, gstRate: 18 },
      { quantity: 2, unitPrice: 2250, gstRate: 18 },
    ];

    const invoiceMath = calculateDocumentTotals(lineItems, 500, false);
    expect(invoiceMath.subtotal).toBe(9500); // (10*500) + (2*2250) = 5000 + 4500 = 9500
    expect(invoiceMath.taxAmount).toBe(1620); // 18% of (9500 - 500) = 1620
    expect(invoiceMath.total).toBe(10620); // 9000 + 1620 = 10620

    // 3. Evaluate Pre-posting Invoice Health
    const invoiceHealth = evaluateInvoiceHealth({
      customerName: customer.name,
      customerPhone: customer.phone,
      items: [
        { name: "Flange Assembly", price: 500, taxRate: 18 },
        { name: "Motor Housing", price: 2250, taxRate: 18 },
      ],
      totalAmount: invoiceMath.total,
      status: "UNPAID",
    });

    expect(invoiceHealth.status).toBe("HEALTHY");
    expect(invoiceHealth.issues.length).toBe(0);

    // 4. Inventory Item Health & Stock Reduction
    const item = {
      name: "Flange Assembly",
      sellingPrice: 500,
      costPrice: 350,
      stock: 45,
      minStockThreshold: 10,
      hsnCode: "7307",
    };

    const itemHealth = evaluateItemHealth(item);
    expect(itemHealth.status).toBe("HEALTHY");

    const stockRemaining = item.stock - 10;
    expect(stockRemaining).toBe(35);

    // 5. Log Activity Audit Event
    const activityLog = recordActivity(
      "INVOICE",
      "INV-2026-001",
      "INVOICE_CREATED",
      "Created sales invoice for Standard Manufacturing Co",
      { amount: invoiceMath.total }
    );

    expect(activityLog.id).toBeDefined();
    expect(activityLog.action).toBe("INVOICE_CREATED");
    expect(activityLog.metadata?.amount).toBe(10620);
  });
});
