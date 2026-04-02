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

## Verified on April 2, 2026

- `python manage.py check` passed.
- The Phase 1 contract suite passed with `76` tests.

## Notes

- Pilgrim-facing endpoints now require an authenticated user with a pilgrim profile. That includes staff users who also have pilgrim profiles.
- The seed command now creates passport and visa records through `Document`.
- Staff self-service password change is not part of the current backend contract. That work is planned for a later phase.
