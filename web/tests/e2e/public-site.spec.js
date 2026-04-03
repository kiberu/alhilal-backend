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
  await januaryCard.getByRole("link", { name: /see dates and pricing/i }).click();

  await expect(page).toHaveURL(new RegExp(`/journeys/${primaryJourneySlug}$`));
  await expect(page.getByText(/package truth, not brochure shorthand/i)).toBeVisible();
});

test("journey detail consultation save", async ({ page }) => {
  await mockLeadSuccess(page);
  await page.goto(`/journeys/${primaryJourneySlug}`, { waitUntil: "networkidle" });

  const section = page.locator("#consultation-form");
  let savedPayload;

  page.on("request", (request) => {
    if (request.url().includes("/public/leads/") && request.method() === "POST") {
      savedPayload = request.postDataJSON();
    }
  });

  await section.getByLabel("Full name *").fill("Yusuf Family");
  await section.getByLabel("Phone or WhatsApp *").fill("+256700333444");
  await section.getByLabel("Email address").fill("yusuf@example.com");
  await section.getByLabel("Preferred travel window").fill("January 2027");
  await section.getByLabel("What would you like help with?").fill("Need help comparing premium and family packages.");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
  expect(savedPayload).toMatchObject({
    source: "journey_detail",
    context_label: primaryJourneySlug,
    trip: "trip-jan-2027",
  });
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

  await page.getByRole("link", { name: /read this guide/i }).first().click();
  await expect(page).toHaveURL(new RegExp(`/guidance/${firstGuidanceSlug}$`));
  await page.getByRole("link", { name: /talk to al hilal/i }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
});
