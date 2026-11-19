import { expect, test } from "@playwright/test";

test("landing page content", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deep cleaning for sofas, mattresses, chairs & carpets.");
  await expect(page.getByText("100% recommend us")).toBeVisible();
  await expect(page.getByRole("link", { name: "Book on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/94740594100/);

  const services = page.locator("#services article");
  await expect(services).toHaveCount(4);
  await expect(services.first().getByRole("link", { name: /Book This Service/ })).toHaveAttribute(
    "href",
    /Sofa%20Deep%20Cleaning/,
  );
  await expect(page.locator("main")).not.toContainText(/\bcars?\b/i);

  for (const title of [
    "Fabric Inspection & Spot Pre-Treatment",
    "Deep Extraction & Anti-Allergen Sanitization",
    "High-Power Moisture Extraction & Fresh Finish",
  ]) {
    await expect(page.getByText(title)).toBeVisible();
  }

  expect(await page.getByTestId("marquee-review").count()).toBeGreaterThanOrEqual(3);
  await expect(page.getByTestId("moments-strip").getByRole("img")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Explore All Moments & Leave a Review" })).toHaveAttribute(
    "href",
    "/reviews#moments",
  );
  await expect(page.getByRole("link", { name: /074 059 4100/ }).first()).toHaveAttribute("href", "tel:+94740594100");
});

test("hero fills the first screen alone", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section").first();
  const box = (await hero.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(page.viewportSize()!.height - 2);
});
