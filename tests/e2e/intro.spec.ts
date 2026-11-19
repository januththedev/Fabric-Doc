import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("intro plays on the first visit, then gets out of the way", async ({ page }) => {
  await page.goto("/");
  const intro = page.locator(".fd-intro");
  await expect(intro).toBeVisible();
  await expect(intro).toHaveAttribute("aria-hidden", "true");

  // After ~3.3s it has lifted off screen and the page is usable.
  await expect(async () => {
    const box = await intro.boundingBox();
    expect(box === null || box.y + box.height <= 1).toBe(true);
  }).toPass({ timeout: 6000 });
  await page.getByRole("link", { name: "See Reviews & Moments" }).click();
  await expect(page).toHaveURL(/\/reviews$/);
});

test("intro is skipped on later pages in the same visit", async ({ page }) => {
  await page.goto("/");
  await page.mouse.click(10, 10); // any click skips
  await page.goto("/about");
  await expect(page.locator("html")).toHaveAttribute("data-intro", "seen");
  await expect(page.locator(".fd-intro")).toBeHidden();
});

test("visitors who prefer reduced motion never see it", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".fd-intro")).toBeHidden();
  await ctx.close();
});
