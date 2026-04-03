import { publicRoutes } from "./public-site-fixtures.mjs";

const baseUrl = process.env.PUBLIC_SITE_BASE_URL || "http://127.0.0.1:4317";

async function assertOk(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Expected ${url} to respond successfully, received ${response.status}`);
  }
  return response;
}

function extractInternalAnchorTargets(html) {
  const matches = html.matchAll(/<a[^>]+href="([^"]+)"/g);
  const baseOrigin = new URL(baseUrl).origin;
  const paths = [];

  for (const match of matches) {
    const href = match[1];
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      continue;
    }

    const url = new URL(href, baseUrl);
    if (url.origin !== baseOrigin || url.pathname.startsWith("/assets/")) {
      continue;
    }

    paths.push(`${url.pathname}${url.search}`);
  }

  return paths;
}

const internalTargets = new Set(publicRoutes);

for (const path of publicRoutes) {
  const response = await assertOk(`${baseUrl}${path}`);
  const html = await response.text();

  for (const target of extractInternalAnchorTargets(html)) {
    internalTargets.add(target);
  }
}

for (const path of internalTargets) {
  await assertOk(`${baseUrl}${path}`);
}

console.log(`Verified ${internalTargets.size} public navigation targets.`);
