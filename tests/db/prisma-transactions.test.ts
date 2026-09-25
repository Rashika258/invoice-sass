import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

describe("Prisma Database & Transaction Integrity Suite", () => {
  const testOrgId = "test-org-db-integrity";

  beforeAll(async () => {
    // Setup clean test organization and customer
    await prisma.organization.upsert({
      where: { id: testOrgId },
      update: {},
      create: {
        id: testOrgId,
        name: "Test Financial Org Ltd",
      },
    });

    await prisma.customer.upsert({
      where: { id: "test-cust-db-1" },
      update: {},
      create: {
        id: "test-cust-db-1",
        organizationId: testOrgId,
        name: "Test Party DB",
      },
    });
  });

  afterAll(async () => {
    // Teardown test organization
    try {
      await prisma.organization.delete({
        where: { id: testOrgId },
      });
    } catch {
      // Ignored if cascade already handled
    }
    await prisma.$disconnect();
  });

  it("should enforce unique constraint on [organizationId, invoiceNumber]", async () => {
    const invoiceNumber = `INV-TEST-UNIQ-${Date.now()}`;

    // 1. Create first invoice
    await prisma.invoice.create({
      data: {
        organizationId: testOrgId,
        customerId: "test-cust-db-1",
        invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(),
        companyName: "Test Company",
        total: 1000,
      },
    });

    // 2. Attempt to create a duplicate invoice with the same invoiceNumber in the same org
    await expect(
      prisma.invoice.create({
        data: {
          organizationId: testOrgId,
          customerId: "test-cust-db-1",
          invoiceNumber,
          issueDate: new Date(),
          dueDate: new Date(),
          companyName: "Test Company",
          total: 2000,
        },
      })
    ).rejects.toThrow();
  });

  it("should guarantee transaction atomicity and rollback on error", async () => {
    const initialItemCount = await prisma.item.count({ where: { organizationId: testOrgId } });

    // Intentionally cause failure inside transaction
    await expect(
      prisma.$transaction(async (tx) => {
        // Step A: Create an item
        await tx.item.create({
          data: {
            organizationId: testOrgId,
            name: "Atomicity Item Test",
            unitPrice: 100,
          },
        });

        // Step B: Trigger intentional error
        throw new Error("Simulated downstream payment gateway failure");
      })
    ).rejects.toThrow("Simulated downstream payment gateway failure");

    // Item creation should have rolled back
    const postItemCount = await prisma.item.count({ where: { organizationId: testOrgId } });
    expect(postItemCount).toBe(initialItemCount);
  });

  it("should atomically increment NumberSeries sequence numbers", async () => {
    const seriesKey = `TEST_SERIES_${Date.now()}`;

    const series = await prisma.numberSeries.create({
      data: {
        organizationId: testOrgId,
        key: seriesKey,
        prefix: "TST-",
        nextNumber: 100,
      },
    });

    expect(series.nextNumber).toBe(100);

    // Increment atomically
    const updated = await prisma.numberSeries.update({
      where: { id: series.id },
      data: { nextNumber: { increment: 1 } },
    });

    expect(updated.nextNumber).toBe(101);
  });

  it("should cascade delete invoice items when parent invoice is deleted", async () => {
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: testOrgId,
        customerId: "test-cust-db-1",
        invoiceNumber: `INV-CASCADE-${Date.now()}`,
        issueDate: new Date(),
        dueDate: new Date(),
        companyName: "Test Company",
        items: {
          create: [
            {
              description: "Line Item 1",
              quantity: 2,
              unitPrice: 50,
              amount: 100,
            },
            {
              description: "Line Item 2",
              quantity: 1,
              unitPrice: 200,
              amount: 200,
            },
          ],
        },
      },
      include: { items: true },
    });

    expect(invoice.items.length).toBe(2);

    // Delete parent invoice
    await prisma.invoice.delete({
      where: { id: invoice.id },
    });

    // Assert that orphan items are cascade deleted
    const orphanItems = await prisma.invoiceItem.findMany({
      where: { invoiceId: invoice.id },
    });
    expect(orphanItems.length).toBe(0);
  });
});
