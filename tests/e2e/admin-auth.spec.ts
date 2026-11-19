import { expect, test } from "@playwright/test";

// Runs in demo mode: no ADMIN_* variables are set.
test("guards /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Admin Sign In");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(
    page.getByText("Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET."),
  ).toBeVisible();
});
