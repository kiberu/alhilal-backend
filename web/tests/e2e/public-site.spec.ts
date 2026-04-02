import { expect, test } from "@playwright/test";

import { primaryJourneySlug } from "../qa/public-site-fixtures.mjs";

test("homepage consultation save", async ({ page }) => {
  await page.goto("/?utm_source=google&utm_medium=cpc&utm_campaign=phase2");

  const responsePromise = page.waitForResponse((response) => response.url().includes("/public/leads/") && response.request().method() === "POST");
  const section = page.locator("#structured-consultation");

  await section.getByLabel("Full name").fill("Amina K");
  await section.getByLabel("Phone or WhatsApp").fill("+256700111222");
  await section.getByLabel("Email address").fill("amina@example.com");
  await section.getByLabel("Preferred travel window").fill("January 2027");
  await section.getByLabel("What would you like help with?").fill("Looking for a calmer family departure.");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  const response = await responsePromise;
  const request = response.request();
  const payload = request.postDataJSON();

  expect(payload).toMatchObject({
    source: "homepage",
    context_label: "homepage_structured_consultation",
    cta_label: "consultation_form_submit",
    utm_source: "google",
    utm_campaign: "phase2",
  });
  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
});

test("homepage planning guide save", async ({ page }) => {
  await page.goto("/");

  const responsePromise = page.waitForResponse((response) => response.url().includes("/public/leads/") && response.request().method() === "POST");
  const section = page.locator("#planning-guide-form");

  await section.getByLabel("Full name").fill("Mariam S");
  await section.getByLabel("Email address").fill("mariam@example.com");
  await section.getByRole("button", { name: /request the planning guide/i }).click();

  const response = await responsePromise;
  const request = response.request();
  const payload = request.postDataJSON();

  expect(payload).toMatchObject({
    source: "homepage",
    context_label: "homepage_planning_guide",
    interest_type: "GUIDE_REQUEST",
  });
  await expect(section.getByText(/planning guide request saved/i)).toBeVisible();
});

test("journeys listing to journey detail", async ({ page }) => {
  await page.goto("/journeys");

  await expect(page.getByRole("heading", { name: "January Umrah 2027" })).toBeVisible();
  await expect(page.getByText("Open for sales")).toBeVisible();
  await page.getByRole("link", { name: /see dates and pricing/i }).first().click();

  await expect(page).toHaveURL(new RegExp(`/journeys/${primaryJourneySlug}$`));
  await expect(page.getByText(/package truth, not brochure shorthand/i)).toBeVisible();
});

test("journey detail consultation save", async ({ page }) => {
  await page.goto(`/journeys/${primaryJourneySlug}`);

  const responsePromise = page.waitForResponse((response) => response.url().includes("/public/leads/") && response.request().method() === "POST");
  const section = page.locator("#consultation-form");

  await section.getByLabel("Full name").fill("Yusuf Family");
  await section.getByLabel("Phone or WhatsApp").fill("+256700333444");
  await section.getByLabel("Email address").fill("yusuf@example.com");
  await section.getByLabel("Preferred travel window").fill("January 2027");
  await section.getByLabel("What would you like help with?").fill("Need help comparing premium and family packages.");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  const response = await responsePromise;
  const request = response.request();
  const payload = request.postDataJSON();

  expect(payload).toMatchObject({
    source: "journey_detail",
    context_label: primaryJourneySlug,
    trip: "trip-jan-2027",
  });
  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
});

test("contact consultation save", async ({ page }) => {
  await page.goto("/contact");

  const responsePromise = page.waitForResponse((response) => response.url().includes("/public/leads/") && response.request().method() === "POST");
  const section = page.locator("#consultation-form");

  await section.getByLabel("Full name").fill("Safiya");
  await section.getByLabel("Phone or WhatsApp").fill("+256700555666");
  await section.getByRole("button", { name: /request follow-up/i }).click();

  const response = await responsePromise;
  const request = response.request();
  const payload = request.postDataJSON();

  expect(payload).toMatchObject({
    source: "contact",
    context_label: "contact_consultation",
    page_path: "/contact",
  });
  await expect(section.getByText(/consultation request is saved/i)).toBeVisible();
});

test("guidance hub to article to contextual CTA", async ({ page }) => {
  await page.goto("/guidance");

  await page.getByRole("link", { name: /read this guide/i }).first().click();
  await expect(page).toHaveURL(/\/guidance\/first-time-umrah-checklist$/);
  await page.getByRole("link", { name: /planning for july already\?/i }).first().click();
  await expect(page).toHaveURL(/\/fenna-umrah-july-2026$/);
});
