import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { publicRoutes } from "../qa/public-site-fixtures.mjs";

for (const route of publicRoutes) {
  test(`route ${route} has no critical or serious axe violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact));

    expect(blockingViolations).toEqual([]);
  });

  test(`route ${route} has no moderate axe violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page }).analyze();
    const moderateViolations = results.violations.filter((violation) => violation.impact === "moderate");

    expect(moderateViolations).toEqual([]);
  });
}

test("all pages have valid heading hierarchy", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: "networkidle" });

    const headingLevels = await page.$$eval(
      "h1, h2, h3, h4, h5, h6",
      (headings) => headings
        .filter((h) => h.offsetParent !== null)
        .map((h) => parseInt(h.tagName[1], 10)),
    );

    if (headingLevels.length === 0) continue;

    const h1Count = headingLevels.filter((level) => level === 1).length;
    expect(h1Count, `route ${route} should have exactly one h1`).toBe(1);

    for (let i = 1; i < headingLevels.length; i++) {
      const jump = headingLevels[i] - headingLevels[i - 1];
      expect(
        jump,
        `route ${route}: heading h${headingLevels[i]} after h${headingLevels[i - 1]} skips a level`,
      ).toBeLessThanOrEqual(1);
    }
  }
});
