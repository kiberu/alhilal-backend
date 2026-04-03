# Al Hilal Backend

`apps/backend` is the canonical API and data layer for Al Hilal Travels.

## Phase 1 Contract

The backend contract normalized in Phase 1 is:

- Public trips:
  - `GET /api/v1/public/trips/`
  - `GET /api/v1/public/trips/<id>/`
  - `GET /api/v1/public/trips/slug/<slug>/`
- Pilgrim profile and journey:
  - `GET /api/v1/me/`
  - `PUT /api/v1/profile/update/`
  - `GET /api/v1/me/bookings/`
  - `GET /api/v1/me/documents/`
  - `GET /api/v1/me/trips/`
  - `GET /api/v1/me/trips/<id>/`
  - `GET /api/v1/me/duas/`
- Staff auth:
  - `POST /api/v1/auth/staff/login/`
  - `GET /api/v1/auth/staff/profile/`
  - `POST /api/v1/auth/refresh/`
- Staff admin resources:
  - `trips`, `bookings`, `pilgrims`, `documents`, `duas`, `packages`, `flights`, `hotels`, `itinerary`, `updates`, `guides`, `checklists`, `contacts`, `faqs`

## Data Model Rule

Use the unified `Document` model for pilgrim documents.

- `PASSPORT` and `VISA` are `document_type` values.
- Do not restore standalone `Passport` or `Visa` models as the canonical path.

## Local Commands

```bash
cd apps/backend
python -m pip install -r requirements.txt -r requirements-dev.txt
python manage.py migrate
python manage.py runserver
python manage.py check
pytest
```

## Test Database Defaults

- Local pytest runs now default to SQLite so backend contract tests do not depend on the Docker-only `db` hostname.
- Set `TEST_USE_SQLITE=False` if you want pytest to use the configured Postgres connection instead.
- Set `TEST_SQLITE_NAME` to override the default SQLite test database path.

## Verified on April 3, 2026

- `python manage.py check` passed.
- The Phase 1 contract suite passed with `76` tests.
- The combined Phase 3 and Phase 4 backend contract slice passed with `13` tests under the local SQLite pytest default.
- The full Phase 5 backend certification run passed with `315` tests under the local SQLite pytest default.

## Phase 5 Manual Certification Checklist

- Verify health and startup behavior in the intended release environment.
- Confirm staff and pilgrim auth flows still work end to end.
- Confirm public trip truth matches the approved calendar source.
- Confirm report exports and readiness actions reflect canonical backend data.
- Confirm document truth and support guidance match the mobile document center.

## Notes

- Pilgrim-facing endpoints now require an authenticated user with a pilgrim profile. That includes staff users who also have pilgrim profiles.
- The seed command now creates passport and visa records through `Document`.
- Staff self-service password change is part of the Phase 4 backend contract.
