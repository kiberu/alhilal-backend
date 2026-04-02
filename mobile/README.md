# Al Hilal Mobile App

`apps/mobile` is the pilgrim support app for the period before travel, during the journey, and after return.

## Phase 3 Support Notes

- Default development API base: `http://localhost:8000/api/v1/`
- Auth and profile:
  - `POST /api/v1/auth/request-otp/`
  - `POST /api/v1/auth/verify-otp/`
  - `POST /api/v1/auth/refresh/`
  - `GET /api/v1/me/`
- Journey data:
  - `GET /api/v1/me/bookings/`
  - `GET /api/v1/me/documents/`
  - `GET /api/v1/me/trips/`
  - `GET /api/v1/me/trips/{trip_id}/milestones/`
  - `GET /api/v1/me/trips/{trip_id}/resources/`
  - `GET /api/v1/me/trips/{trip_id}/readiness/`
  - `GET /api/v1/me/trips/{trip_id}/daily-program/`
  - `GET/POST /api/v1/me/trips/{trip_id}/feedback/`
  - `GET/PUT /api/v1/me/notification-preferences/`
  - `GET/POST /api/v1/me/devices/`
  - `PATCH/DELETE /api/v1/me/devices/{device_id}/`
  - `GET /api/v1/public/trips/`

## Phase 3 Defaults

- SQLite is the required offline read model for cache-first pilgrim support surfaces.
- Notification/device plumbing is provider-agnostic by default.
- The document center is intentionally read-only in Phase 3. Status, expiry, review state, and support next steps are shown in-app, while replacement handoff stays with Al Hilal support.

## Local Commands

```bash
cd apps/mobile
npm ci
npm run start
npm run web
npx eslint lib/api/config.ts lib/api/services/auth.ts lib/api/services/documents.ts app/my-documents.tsx
```

## Verified on April 2, 2026

- The Phase 1 mobile contract slice linted with `0` errors.

## Known Gaps

- Broader workspace lint and TypeScript debt still exists in booking, profile, theme, and auth screens outside the Phase 1 contract slice.
- The Phase 3 support foundation still needs full contract, mobile, offline, and Maestro evidence before it can count as a phase exit.
