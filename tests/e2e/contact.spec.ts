import { expect, test } from "@playwright/test";

test("contact: call card and WhatsApp hand-off", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __opened: string[] };
    w.__opened = [];
    window.open = ((url?: string | URL) => {
      w.__opened.push(String(url));
      return null;
    }) as unknown as typeof window.open;
  });

  await page.goto("/contact");

  await expect(page.getByRole("link", { name: /Call us/ })).toHaveAttribute("href", "tel:+94740594100");

  await page.getByLabel("Your Name").fill("Kasun");
  await page.getByLabel("Phone / WhatsApp Number").fill("077 123 4567");
  await page.getByLabel("Service Needed").click();
  await page.getByRole("option", { name: "Chair & Dining Upholstery" }).click();
  await page.getByLabel("City / Area").fill("Kandy");
  await page.getByLabel("Message / Stain Details").fill("Coffee stain on seat cushion");

  await page.getByRole("button", { name: "Send Directly via WhatsApp" }).click();

  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  expect(opened).toHaveLength(1);
  const decoded = decodeURIComponent(opened[0]);
  expect(decoded).toContain("Service: Chair & Dining Upholstery");
  expect(decoded).toContain("Area: Kandy");
});

test("contact: demo mode blocks saving with an alert", async ({ page }) => {
  await page.goto("/contact");

  await page.getByLabel("Your Name").fill("Kasun");
  await page.getByLabel("Phone / WhatsApp Number").fill("077 123 4567");
  await page.getByLabel("Service Needed").click();
  await page.getByRole("option", { name: "Chair & Dining Upholstery" }).click();
  await page.getByLabel("City / Area").fill("Kandy");
  await page.getByLabel("Message / Stain Details").fill("Coffee stain on seat cushion");

  await page.getByRole("button", { name: "Send Inquiry" }).click();

  // Next.js keeps its own hidden role="alert" route announcer, so match ours by its text.
  await expect(page.getByRole("alert").filter({ hasText: "Demo mode" })).toHaveText(
    "Demo mode: connect a database to save inquiries.",
  );
});
