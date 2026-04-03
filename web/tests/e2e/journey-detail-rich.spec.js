import { expect, test } from "@playwright/test";

const SITE_URL = "http://localhost:15173";
const JOURNEY_SLUG = "july-ffenna-umrah";

test("rich journey detail renders backend-driven sections and package booking guides", async ({ page }) => {
  await page.goto(`${SITE_URL}/journeys/${JOURNEY_SLUG}`, { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: /july ffenna umrah/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /every package, with booking guidance/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /full itinerary data/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /milestones and guide/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /emergency contacts and common questions/i })).toBeVisible();

  await expect(page.getByText(/how to book this package/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /read how to book/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /ask on whatsapp/i }).first()).toBeVisible();
});

test("journey detail lead funnel submits from consultation block", async ({ page }) => {
  await page.goto(`${SITE_URL}/journeys/${JOURNEY_SLUG}`, { waitUntil: "networkidle" });

  const section = page.locator("#consultation-form");
  await expect(section).toBeVisible();

  await section.getByLabel("Full name *").fill("E2E Journey Detail");
  await section.getByLabel("Phone or WhatsApp *").fill("+256700111222");
  await section.getByLabel("Preferred travel window").fill("July 2026");
  await section.getByLabel("What would you like help with?").fill("Compare package options and booking steps.");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
});
