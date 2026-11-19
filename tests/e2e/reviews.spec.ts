import { expect, test, type Locator } from "@playwright/test";

const top = async (l: Locator) => (await l.boundingBox())!.y;

test("scroll order: form → 4 reviews → Moments → more reviews", async ({ page }) => {
  await page.goto("/reviews");

  const form = page.getByTestId("review-form-section");
  const lead = page.getByTestId("lead-review");
  const moments = page.locator("#moments");
  const more = page.getByTestId("more-reviews");

  await expect(lead).toHaveCount(4);
  await expect(more.getByRole("article")).toHaveCount(1);

  expect(await top(form)).toBeLessThan(await top(lead.first()));
  expect(await top(lead.last())).toBeLessThan(await top(moments));
  expect(await top(moments)).toBeLessThan(await top(more));
});

test("lightbox opens, navigates and closes with the keyboard", async ({ page }) => {
  await page.goto("/reviews");
  await page.locator("#moments").getByRole("button", { name: /Open photo 1 of 5/ }).click();

  const lightbox = page.locator(".yarl__root");
  await expect(lightbox).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();
});

test("deep link from the home page lands on Moments", async ({ page }) => {
  await page.goto("/reviews#moments");
  await expect(page.locator("#moments")).toBeInViewport();
});
