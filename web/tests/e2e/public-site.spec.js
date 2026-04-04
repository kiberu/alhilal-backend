import { expect, test } from "@playwright/test";

import { firstGuidanceSlug, primaryJourneySlug } from "../qa/public-site-fixtures.mjs";

async function mockLeadSuccess(page) {
  await page.route("**/public/leads/", async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: "lead-1",
        status: "NEW",
        ...payload,
      }),
    });
  });
}

test("journeys listing to journey detail", async ({ page }) => {
  await page.goto("/journeys", { waitUntil: "networkidle" });

  const januaryCard = page.locator(".project-card").filter({ has: page.getByRole("heading", { name: "January Umrah 2027" }) }).first();

  await expect(januaryCard.getByRole("heading", { name: "January Umrah 2027" })).toBeVisible();
  await expect(januaryCard.getByText("Open for sales")).toBeVisible();
  await januaryCard.getByRole("link", { name: /trip and booking information/i }).click();

  await expect(page).toHaveURL(new RegExp(`/journeys/${primaryJourneySlug}$`));
  await expect(page.getByRole("heading", { name: /every package, with booking guidance/i })).toBeVisible();
});

test("journey detail package booking guidance links", async ({ page }) => {
  await page.goto(`/journeys/${primaryJourneySlug}`, { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: /how to book this package/i }).first()).toBeVisible();
  await page.getByRole("link", { name: /read how to book/i }).first().click();
  await expect(page).toHaveURL(/\/how-to-book$/);
});

test("contact consultation save", async ({ page }) => {
  await mockLeadSuccess(page);
  await page.goto("/contact", { waitUntil: "networkidle" });

  const section = page.locator("#consultation-form");
  let savedPayload;

  page.on("request", (request) => {
    if (request.url().includes("/public/leads/") && request.method() === "POST") {
      savedPayload = request.postDataJSON();
    }
  });

  await section.getByLabel("Full name *").fill("Safiya");
  await section.getByLabel("Phone or WhatsApp *").fill("+256700555666");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
  expect(savedPayload).toMatchObject({
    source: "contact",
    context_label: "contact_consultation",
    page_path: "/contact",
  });
});

test("guidance hub to article to contact CTA", async ({ page }) => {
  await page.goto("/guidance", { waitUntil: "networkidle" });

  await page.getByRole("link", { name: /read article/i }).first().click();
  await expect(page).toHaveURL(new RegExp(`/guidance/${firstGuidanceSlug}$`));
  await page.getByRole("link", { name: /talk to al hilal/i }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("guidance hub falls back to static guidance when API is unavailable", async ({ page }) => {
  await page.route("**/public/guidance/**", async (route) => {
    await route.abort();
  });

  await page.goto("/guidance", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: /first-time umrah checklist from uganda and east africa/i })
  ).toBeVisible();
});
