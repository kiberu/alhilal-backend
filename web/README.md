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
npm test -- --runInBand
npm run test:e2e
npm run test:links
npm run test:lighthouse
npm run qa:website
```

## Verified on April 2, 2026

- `npm run build` passed.
- `npm test -- --runInBand` passed.
- `npm run test:e2e` passed with 12 checks, including axe scans on the six primary public surfaces.
- `npm run test:links` passed and verified 12 sitemap URLs plus 13 internal navigation targets.
- `npm run test:lighthouse` passed with the homepage, journeys listing, journey detail, and contact pages all clearing the configured `85` score gate across performance, SEO, accessibility, and best practices.

## Known Gaps

- Phase 2 website engineering is complete and is awaiting human sign-off plus upstream readiness-gate acceptance.
- `GUIDE_REQUEST` remains a manual staff follow-up flow by design until a later phase introduces broader automation.
