import { test, expect } from "@playwright/test";

test.describe("Invoice Management E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with seeded admin account
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("admin@billora.app");
    await page.getByLabel(/Password/i).fill("admin123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("should display sale invoices directory with filters and new sale action", async ({ page }) => {
    await page.goto("/invoices");

    // Check header and primary action button
    await expect(page.getByText("Sale Invoices").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Add Sale", exact: true })).toBeVisible();

    // Verify presence of table headers
    await expect(page.getByText(/Invoice no/i).first()).toBeVisible();
    await expect(page.getByText(/Party Name/i).first()).toBeVisible();
    await expect(page.getByText(/Amount/i).first()).toBeVisible();
  });

  test("should open the new sale invoice form and allow line item input", async ({ page }) => {
    await page.goto("/invoices/new");

    // Verify invoice form layout
    await expect(page.getByText(/New Sale Invoice/i).first()).toBeVisible();
    await expect(page.getByText(/Line Items/i).first()).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole("button", { name: /Save & Preview Bill/i }).first()).toBeVisible();
  });
});
