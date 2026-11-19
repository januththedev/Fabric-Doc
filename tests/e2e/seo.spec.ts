import { expect, test } from "@playwright/test";

test("home page title and structured data", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Fabric Doctor | Sofa, Mattress, Chair & Carpet Deep Cleaning in Sri Lanka");

  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}");
  expect(ld["@type"]).toBe("LocalBusiness");
  expect(ld.telephone).toBe("+94740594100");
  expect(ld.sameAs).toContain("https://www.facebook.com/fabricdoctorlk/");
  expect(ld.aggregateRating).toBeUndefined(); // Google disallows self-published review markup
});

test("page titles", async ({ page }) => {
  for (const [path, title] of [
    ["/reviews", "Reviews & Moments | Fabric Doctor"],
    ["/about", "About Us | Fabric Doctor"],
    ["/contact", "Contact Us | Fabric Doctor"],
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
  }
});

test("robots and sitemap", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const p of ["/reviews", "/about", "/contact", "/care-guide", "/services/sofa-cleaning"]) expect(sitemap).toContain(p);
  expect(sitemap).not.toContain("/admin");
});

test("404 page", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page got vacuumed up");
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
