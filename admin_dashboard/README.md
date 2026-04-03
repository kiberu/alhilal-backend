# Al Hilal Admin Dashboard

`apps/admin_dashboard` is the staff-facing operations dashboard.

## Purpose

The dashboard supports staff login, trip management, bookings, pilgrims, documents, reports, and operational oversight.

## Phase 1 Contract Notes

- Staff auth uses the backend routes below:
  - `POST /api/v1/auth/staff/login/`
  - `GET /api/v1/auth/staff/profile/`
  - `POST /api/v1/auth/refresh/`
- Passport and visa screens now run on top of the unified `Document` API.
- Client-side logout is handled in the dashboard. The backend does not provide a logout endpoint in the current contract.
- Staff self-service password change is deferred to a later readiness phase.

## Local Commands

```bash
cd apps/admin_dashboard
npm ci
npm run dev
npm test -- --runInBand
npm run build
```

## Verified on April 2, 2026

- `npm test -- --runInBand` passed with `31` tests.
- `npm run build` passed.

## Known Gaps

- `npm run lint` still fails because of broader legacy `any` usage and older UI lint debt outside the Phase 1 contract slice.
- Deeper reporting, settings, and self-service account management are covered in later readiness phases.
