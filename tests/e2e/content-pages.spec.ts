import { expect, test } from "@playwright/test";

test("each service has its own page, reachable from the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Details about Sofa Deep Cleaning" }).click();
  await expect(page).toHaveURL(/\/services\/sofa-cleaning$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sofa Deep Cleaning");
  await expect(page.getByRole("link", { name: "Book Sofa Deep Cleaning" })).toHaveAttribute("href", /wa\.me/);
  await expect(page.getByRole("heading", { name: "What's included" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/cars?/i);
});

test("an unknown service is a 404", async ({ page }) => {
  const res = await page.goto("/services/not-a-service");
  expect(res!.status()).toBe(404);
});

test("care guide page", async ({ page }) => {
  await page.goto("/care-guide");
  await expect(page).toHaveTitle("Stain & Care Guide | Fabric Doctor");
  await expect(page.getByRole("heading", { name: "Blot, never rub" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Coffee & tea" })).toBeVisible();
});

test("home page FAQ opens", async ({ page }) => {
  await page.goto("/");
  const q = page.getByRole("button", { name: "How much does it cost?" });
  await q.click();
  await expect(page.getByText(/give you a clear quote before we start/)).toBeVisible();
});
