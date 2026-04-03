import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 1600 },
  { name: "tablet", width: 1024, height: 1366 },
  { name: "mobile", width: 390, height: 844 },
];

function boxesOverlap(a, b, gap = 0) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

async function getBox(locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Expected locator to have a bounding box.");
  }
  return box;
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} style audit`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("hero content placement stays readable", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const title = page.locator(".display-title--hero");
      const support = page.locator(".hero__support");
      const chipGrid = page.locator(".hero__features--reference");
      const intro = page.locator(".hero__intro");

      await expect(title).toBeVisible();
      await expect(support).toBeVisible();
      await expect(chipGrid).toBeVisible();

      const titleBox = await getBox(title);
      const supportBox = await getBox(support);
      const introBox = await getBox(intro);
      const chipGridBox = await getBox(chipGrid);

      const maxTitleWidth = viewport.name === "desktop" ? viewport.width * 0.7 : viewport.width * 0.94;
      expect(titleBox.width).toBeLessThan(maxTitleWidth);
      expect(chipGridBox.y).toBeGreaterThan(introBox.y + introBox.height - 8);
      expect(boxesOverlap(titleBox, supportBox, 6)).toBeFalsy();
    });

    test("journey cards and key sections keep spacing", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const journeysGrid = page.locator(".project-grid--feature");
      const firstCard = page.locator(".project-card").first();
      const facts = firstCard.locator(".project-card__facts");
      const reassurance = page.locator(".reassurance-card");
      const ctaBanner = page.locator(".cta-banner");

      await expect(journeysGrid).toBeVisible();
      await expect(firstCard).toBeVisible();
      await expect(facts).toBeVisible();
      await expect(reassurance).toBeVisible();
      await expect(ctaBanner).toBeVisible();

      const cardBox = await getBox(firstCard);
      const factsBox = await getBox(facts);
      const reassuranceBox = await getBox(reassurance);
      const ctaBox = await getBox(ctaBanner);

      expect(factsBox.y).toBeGreaterThan(cardBox.y + cardBox.height * 0.42);

      if (viewport.name !== "desktop") {
        expect(ctaBox.y).toBeGreaterThan(reassuranceBox.y + reassuranceBox.height + 12);
      }
    });

    test("faq and menu remain legible", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });

      const faqIntro = page.locator(".surface-card--faq-intro");
      const faqList = page.locator("[data-faq-list]");
      await expect(faqIntro).toBeVisible();
      await expect(faqList).toBeVisible();

      const faqIntroBox = await getBox(faqIntro);
      const faqListBox = await getBox(faqList);
      expect(faqIntroBox.width).toBeGreaterThan(180);
      expect(faqListBox.width).toBeGreaterThan(180);

      await page.locator("[data-faq-trigger]").first().click();
      await expect(page.locator(".faq-item__answer p").first()).toBeVisible();

      const toggle = page.locator("[data-menu-toggle]");
      if (await toggle.isVisible()) {
        await toggle.click();
        const panel = page.locator(".site-mobile-nav__panel");
        await expect(panel).toBeVisible();
      }
    });
  });
}

test.describe("keyboard and focus management", () => {
  test("skip-to-content link appears on focus and targets main", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const skipLink = page.locator(".skip-link");
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    const activeId = await page.evaluate(() => document.activeElement?.id || document.activeElement?.closest("[id]")?.id);
    expect(activeId).toBe("main-content");
  });
});
