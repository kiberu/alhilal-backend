import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { primaryJourneySlug } from "../qa/public-site-fixtures.mjs";

const pages = [
  { name: "homepage", path: "/" },
  { name: "journeys listing", path: "/journeys" },
  { name: "journey detail", path: `/journeys/${primaryJourneySlug}` },
  { name: "guidance article", path: "/guidance/first-time-umrah-checklist" },
  { name: "how to book", path: "/how-to-book" },
  { name: "contact", path: "/contact" },
];

for (const pageConfig of pages) {
  test(`${pageConfig.name} has no axe violations`, async ({ page }) => {
    await page.goto(pageConfig.path, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
