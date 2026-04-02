# Al Hilal Website

`apps/web` is the public website for Hajj and Umrah information, trust building, and lead conversion.

## Current Role

The website is the public discovery surface for:

- trip and package exploration
- guidance and educational content
- Al Hilal brand trust
- structured consultation capture
- planning-guide slow-nurture capture
- analytics-attributed CTA and lead conversion for the public website

## Local Commands

```bash
cd apps/web
npm ci
npm run dev
npm run build
npm run build:qa
npm test -- --runInBand
npm run test:e2e
npm run test:links
npm run test:lighthouse
npm run qa:website
```

## Verified on April 3, 2026

- `npm run qa:website` passed.
- That gate includes:
  - `npm test -- --runInBand` -> `6` suites passed, `11` tests passed
  - `npm run test:e2e` -> `12` Playwright checks passed
  - `npm run test:links` -> verified `12` sitemap URLs and `13` internal navigation targets
  - `npm run test:lighthouse` -> passed on `/`, `/journeys`, `/journeys/january-umrah-2027`, and `/contact`
- Local QA note: `build:qa`, `test:links`, and `test:lighthouse` disable analytics only for the QA build so Lighthouse stays deterministic without changing production analytics behavior.

## Phase 5 Manual Certification Checklist

- Open the homepage, journeys listing, one journey detail page, guidance hub, one guidance article, and contact page in a real browser.
- Confirm consultation and planning-guide forms still save correctly.
- Confirm no critical placeholder or misleading message appears on public pages.
- Compare homepage and journey-detail truth against the approved calendar source before release.

## Known Gaps

- Website engineering and automated certification are complete in repo and are awaiting human release sign-off plus the final calendar-truth spot-check.
- `GUIDE_REQUEST` remains a manual staff follow-up flow by design until a later phase introduces broader automation.
