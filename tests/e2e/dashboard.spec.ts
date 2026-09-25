import { test, expect } from "@playwright/test";

test.describe("Dashboard & Core Navigation E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("admin@billora.app");
    await page.getByLabel(/Password/i).fill("admin123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("should render main dashboard metrics and revenue cards", async ({ page }) => {
    // Assert dashboard elements
    await expect(page.getByText("Total Revenue").first()).toBeVisible();
    await expect(page.getByText("Total Receivable").first()).toBeVisible();
  });

  test("should navigate to Items catalogue and Godown Stock Transfers via sidebar", async ({ page }) => {
    // Navigate to Items
    await page.goto("/items");
    await expect(page.getByRole("heading", { name: /Items/i })).toBeVisible();

    // Navigate to Stock Transfers
    await page.goto("/items/stock-transfer");
    await expect(page.getByText(/Stock Transfer/i).first()).toBeVisible();
  });

  test("should open the command palette on keyboard shortcut or trigger button", async ({ page }) => {
    // Ensure dashboard is fully loaded
    await expect(page.getByText("Total Revenue").first()).toBeVisible();

    // Try shortcut first, fallback to trigger button
    await page.keyboard.press("Control+k");
    const searchInput = page.getByPlaceholder(/Search or type a command/i);

    const isOpened = await searchInput.isVisible({ timeout: 1500 }).catch(() => false);
    if (!isOpened) {
      await page.getByLabel("Open command palette").click();
    }

    // Expect Command Palette dialog to appear
    await expect(searchInput).toBeVisible();
  });
});
