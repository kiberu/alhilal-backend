# Al Hilal Application Stack

This workspace holds the production platforms behind Al Hilal Travels in Uganda.

- `apps/backend`: canonical Django API and operations backend
- `apps/web`: public website for discovery, trust, and conversion
- `apps/mobile`: pilgrim app for before, during, and after journey support
- `apps/admin_dashboard`: staff-facing operations dashboard

## Current Program Status

As of April 2, 2026, Phase 1 implementation is complete and the repo is in **Readiness Phase 1 closeout** pending human sign-off.

The closeout review artifact is [readiness-phase-01-evidence-pack.md](/Users/kiberusharif/work/alhilal-documentation/reports/readiness-phase-01-evidence-pack.md). Phase 2 should not begin until that pack is reviewed and approved.

Phase 1 established these rules:

- The backend API is the source of truth.
- The unified `Document` model is authoritative for passports and visas.
- Pilgrim-facing routes live under `/api/v1/me/`.
- Staff auth uses `/api/v1/auth/staff/login/`, `/api/v1/auth/staff/profile/`, and `/api/v1/auth/refresh/`.

## Verified Commands

- Backend system check: `cd apps/backend && python manage.py check`
- Backend Phase 1 contract suite: `cd apps/backend && pytest -q apps/pilgrims/tests/test_models.py apps/bookings/tests/test_models.py apps/api/tests/test_profile_endpoints.py apps/api/tests/test_permissions.py apps/api/tests/test_trip_endpoints.py apps/api/tests/test_package_endpoints.py apps/api/tests/test_integration.py apps/api/tests/test_documents.py`
- Admin tests: `cd apps/admin_dashboard && npm test -- --runInBand`
- Admin build: `cd apps/admin_dashboard && npm run build`
- Website build: `cd apps/web && npm run build`
- Mobile contract lint slice: `cd apps/mobile && npx eslint lib/api/config.ts lib/api/services/auth.ts lib/api/services/documents.ts app/my-documents.tsx`

## Known Program Caveats

- The admin workspace still has broader legacy lint debt outside the Phase 1 contract slice.
- The mobile workspace still has broader type and lint debt outside the Phase 1 contract slice.
- Full website conversion instrumentation, pilgrim support completion, and advanced staff workflows are deferred to later readiness phases.

See [readiness-90-program.md](/Users/kiberusharif/work/alhilal-documentation/reports/readiness-90-program.md) for the full gated program and the phase files in `reports/` for status by phase.
