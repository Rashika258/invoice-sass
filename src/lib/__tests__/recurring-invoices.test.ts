import { describe, expect, it } from "vitest";

export function calculateNextRecurringDate(currentDate: Date, frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"): Date {
  const next = new Date(currentDate.getTime());
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

describe("Recurring Invoices Schedule Engine Suite", () => {
  describe("calculateNextRecurringDate", () => {
    it("advances next generation date correctly based on frequency", () => {
      const baseDate = new Date("2026-01-15T00:00:00Z");

      const daily = calculateNextRecurringDate(baseDate, "DAILY");
      expect(daily.getUTCDate()).toBe(16);

      const weekly = calculateNextRecurringDate(baseDate, "WEEKLY");
      expect(weekly.getUTCDate()).toBe(22);

      const monthly = calculateNextRecurringDate(baseDate, "MONTHLY");
      expect(monthly.getUTCMonth()).toBe(1); // February (0-indexed)

      const yearly = calculateNextRecurringDate(baseDate, "YEARLY");
      expect(yearly.getUTCFullYear()).toBe(2027);
    });
  });
});
