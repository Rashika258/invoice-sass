// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { recordActivity, getEntityActivities } from "../activity-timeline";
import { recordRecentItem, getRecentItems } from "../recent-actions";
import { saveFormDraft, loadFormDraft, clearFormDraft } from "../draft-autosave";
import { checkCustomerDuplicate, checkItemDuplicate } from "../duplicate-detector";
import { getSavedViews, saveViewPreset } from "../saved-views";

describe("UX Standardization & Guided Workflows Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Activity Timeline Engine", () => {
    it("records and retrieves activity events for a specific record", () => {
      recordActivity("INVOICE", "inv_99", "PAID", "Payment of ₹ 5,000 received");
      const events = getEntityActivities("INVOICE", "inv_99");

      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events[0].description).toBe("Payment of ₹ 5,000 received");
      expect(events[0].action).toBe("PAID");
    });
  });

  describe("Recent Actions Tracker", () => {
    it("records recently viewed items and avoids duplicate hrefs", () => {
      recordRecentItem("Invoice #101", "Acme Corp", "INVOICE", "/invoices/inv_101");
      recordRecentItem("Invoice #101", "Acme Corp", "INVOICE", "/invoices/inv_101");

      const items = getRecentItems();
      const invoiceItems = items.filter((i) => i.href === "/invoices/inv_101");
      expect(invoiceItems.length).toBe(1);
    });
  });

  describe("Draft Autosave Utility", () => {
    it("saves, loads, and clears form drafts safely", () => {
      const formData = { customerName: "Jindal Steel", amount: 45000 };
      saveFormDraft("new_invoice", formData);

      const loaded = loadFormDraft<typeof formData>("new_invoice");
      expect(loaded).not.toBeNull();
      expect(loaded?.data.customerName).toBe("Jindal Steel");

      clearFormDraft("new_invoice");
      expect(loadFormDraft("new_invoice")).toBeNull();
    });
  });

  describe("Pre-Save Duplicate Detector", () => {
    it("detects customer duplicate phone numbers", () => {
      const customers = [
        { id: "c1", name: "Apex Traders", phone: "+91 98765 43210" },
      ];

      const match = checkCustomerDuplicate("9876543210", customers);
      expect(match).not.toBeNull();
      expect(match?.isDuplicate).toBe(true);
      expect(match?.existingId).toBe("c1");
    });

    it("detects duplicate inventory item names", () => {
      const items = [{ id: "i1", name: "Steel Flange 50mm" }];

      const match = checkItemDuplicate("Steel Flange 50mm", items);
      expect(match).not.toBeNull();
      expect(match?.isDuplicate).toBe(true);
    });
  });

  describe("Saved Table Views Presets", () => {
    it("provides default presets and saves custom view presets", () => {
      const defaultPresets = getSavedViews("INVOICE");
      expect(defaultPresets.length).toBeGreaterThan(0);

      const custom = saveViewPreset("High-Value Invoices", "INVOICE", { minAmount: 100000 });
      expect(custom.name).toBe("High-Value Invoices");

      const updated = getSavedViews("INVOICE");
      expect(updated.some((p) => p.name === "High-Value Invoices")).toBe(true);
    });
  });
});
