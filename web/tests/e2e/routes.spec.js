import { expect, test } from "@playwright/test";

import { publicRoutes, styleAuditSections } from "../qa/public-site-fixtures.mjs";

for (const route of publicRoutes) {
  test(`route ${route} renders shell content`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page).toHaveTitle(/Al Hilal|Journeys|Guidance|Contact|About|Privacy|Terms|How to Book/);
  });
}

test("home covers all baseline audit sections", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  for (const section of styleAuditSections) {
    if (section.name === "drawer") {
      continue;
    }

    for (const selector of section.selectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }
  }
});
