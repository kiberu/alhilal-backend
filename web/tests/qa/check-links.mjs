import { primaryJourneySlug } from "./public-site-fixtures.mjs";

const baseUrl = process.env.PUBLIC_SITE_BASE_URL || "http://127.0.0.1:3100";

const seedPages = [
  "/",
  "/journeys",
  `/journeys/${primaryJourneySlug}`,
  "/guidance",
  "/guidance/first-time-umrah-checklist",
  "/how-to-book",
  "/contact",
];

async function assertOk(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Expected ${url} to respond successfully, received ${response.status}`);
  }
  return response;
}

function extractInternalAnchorTargets(html) {
  const matches = html.matchAll(/<a[^>]+href="([^"]+)"/g);
  const paths = [];
  for (const match of matches) {
    const href = match[1];
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      continue;
    }

    const url = new URL(href, baseUrl);
    if (url.origin !== new URL(baseUrl).origin) {
      continue;
    }

    if (url.pathname.startsWith("/_next")) {
      continue;
    }

    paths.push(`${url.pathname}${url.search}`);
  }

  return paths;
}

const sitemapResponse = await assertOk(`${baseUrl}/sitemap.xml`);
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1]);

if (!sitemapUrls.length) {
  throw new Error("Expected sitemap.xml to include at least one URL.");
}

for (const url of sitemapUrls) {
  await assertOk(url);
}

const internalTargets = new Set(seedPages);
for (const path of seedPages) {
  const response = await assertOk(`${baseUrl}${path}`);
  const html = await response.text();
  for (const target of extractInternalAnchorTargets(html)) {
    internalTargets.add(target);
  }
}

for (const path of internalTargets) {
  await assertOk(`${baseUrl}${path}`);
}

console.log(`Verified ${sitemapUrls.length} sitemap URLs and ${internalTargets.size} internal navigation targets.`);
