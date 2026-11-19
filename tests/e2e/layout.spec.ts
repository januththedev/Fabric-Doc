import { expect, test } from "@playwright/test";

test("navbar, footer and floating WhatsApp", async ({ page }) => {
  await page.goto("/about");

  const width = page.viewportSize()!.width;
  let nav = page.getByRole("navigation", { name: "Main" });
  if (width < 768) {
    await page.getByRole("button", { name: "Open menu" }).click();
    nav = page.getByRole("dialog").getByRole("navigation", { name: "Mobile" });
  }
  for (const name of ["Home", "Reviews & Moments", "About", "Contact"]) {
    await expect(nav.getByRole("link", { name })).toBeVisible();
  }
  // On a phone the "WhatsApp Us" button lives inside the open menu; on desktop it is in the bar.
  const cta = (width < 768 ? page.getByRole("dialog") : page).getByRole("link", { name: "WhatsApp Us" }).first();
  await expect(cta).toHaveAttribute("href", /^https:\/\/wa\.me\/94740594100\?text=/);
  if (width < 768) await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Chat with Fabric Doctor on WhatsApp" })).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("We don't just clean, we care for your health.");
  await expect(footer).toContainText("074 059 4100");
  await expect(footer).toContainText("Always Open (24/7)");
  await expect(footer.getByRole("link", { name: /facebook/i })).toHaveAttribute(
    "href",
    "https://www.facebook.com/fabricdoctorlk/",
  );
  for (const s of ["Sofa Deep Cleaning", "Mattress Sanitization", "Chair & Dining Upholstery", "Carpet & Rug Cleaning"]) {
    await expect(footer).toContainText(s);
  }
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ["/", "/reviews", "/about", "/contact"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("skip link is the first tab stop", async ({ page }) => {
  await page.goto("/contact");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
});
