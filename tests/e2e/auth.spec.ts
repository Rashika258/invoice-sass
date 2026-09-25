import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Flow", () => {
  test("should render the login screen with branded elements", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/Billora/i);
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("should display validation error on incorrect login credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill("wrong-user@company.com");
    await page.getByLabel(/Password/i).fill("InvalidPassword123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Expect error alert message
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("should successfully log in with seeded admin credentials and reach dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email/i).fill("admin@billora.app");
    await page.getByLabel(/Password/i).fill("admin123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // Verify successful redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Billora/i).first()).toBeVisible();
  });
});
