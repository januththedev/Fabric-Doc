import { expect, test } from "@playwright/test";

test("about: hero, tagline, metrics and section headings", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Fabric Doctor");
  await expect(page.getByText("We don't just clean, we care for your health.").first()).toBeVisible();
  const metrics = page.getByTestId("metrics-bar");
  for (const [v, l] of [["100%","Recommendation Rate"],["47+","Verified Reviews"],["4.5K+","Facebook Community"],["24/7","Always Open"]]) {
    await expect(metrics).toContainText(v); await expect(metrics).toContainText(l);
  }
  await expect(page.getByRole("heading", { name: "Why Deep Cleaning Matters" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Our Standards & Equipment" })).toBeVisible();
});
