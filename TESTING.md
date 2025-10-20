# Testing Guide - Alhilal Pilgrimage Management System

Comprehensive guide for testing the application, including unit tests, integration tests, and manual testing.

## 📋 Test Overview

### Test Coverage

- **50+ Tests** across 9 test files
- **Model Tests** - Data validation, encryption, audit trails
- **API Tests** - Authentication, endpoints, permissions
- **Integration Tests** - End-to-end user journeys
- **Security Tests** - Data scoping, access control

### Test Structure

```
backend/
├── conftest.py                          # Shared fixtures
├── apps/
│   ├── accounts/tests/
│   │   └── test_models.py              # Account, Profile, OTP tests
│   ├── pilgrims/tests/
│   │   └── test_models.py              # Passport, Visa tests
│   ├── bookings/tests/
│   │   └── test_models.py              # Booking validation tests
│   └── api/tests/
│       ├── test_authentication.py      # OTP + JWT tests
│       ├── test_profile_endpoints.py   # Profile API tests
│       ├── test_trip_endpoints.py      # Trip API tests
│       ├── test_package_endpoints.py   # Package API tests
│       ├── test_permissions.py         # Security tests
│       └── test_integration.py         # E2E tests
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
make test

# Or with docker-compose
docker-compose exec backend pytest

# Run with verbose output
docker-compose exec backend pytest -v

# Run specific test file
docker-compose exec backend pytest apps/api/tests/test_authentication.py -v

# Run specific test
docker-compose exec backend pytest apps/api/tests/test_authentication.py::TestOTPRequest::test_request_otp_success -v
```

### With Coverage

```bash
# Run with coverage report
docker-compose exec backend pytest --cov=apps --cov-report=term

# Generate HTML coverage report
docker-compose exec backend pytest --cov=apps --cov-report=html

# View coverage report
open backend/htmlcov/index.html
```

### Test Options

```bash
# Stop on first failure
docker-compose exec backend pytest -x

# Show print statements
docker-compose exec backend pytest -s

# Run only failed tests
docker-compose exec backend pytest --lf

# Run tests in parallel (faster)
docker-compose exec backend pytest -n auto

# Run specific marker
docker-compose exec backend pytest -m "slow"
```

## 📝 Test Categories

### 1. Model Tests

#### Account Models (`apps/accounts/tests/test_models.py`)

**Tests:**
- Account creation (pilgrim and staff)
- Phone uniqueness constraint
- Profile creation
- OTP code generation and expiry
- OTP consumption
- Audit trail on PilgrimProfile

**Run:**
```bash
docker-compose exec backend pytest apps/accounts/tests/test_models.py -v
```

**Key Tests:**
```python
# Test account creation
test_create_pilgrim_account()
test_create_staff_account()

# Test OTP
test_otp_expiry()
test_otp_consumption()
test_otp_attempts()

# Test audit
test_pilgrim_profile_history()
```

#### Passport & Visa Models (`apps/pilgrims/tests/test_models.py`)

**Tests:**
- Passport encryption/decryption
- Passport number masking
- Visa status transitions
- Visa approval validation
- Visa date validation
- Audit trail on Passport and Visa

**Run:**
```bash
docker-compose exec backend pytest apps/pilgrims/tests/test_models.py -v
```

**Key Tests:**
```python
# Test encryption
test_passport_encryption()
test_passport_masking()

# Test visa
test_visa_status_transitions()
test_visa_approval_validation()
test_visa_date_validation()

# Test audit
test_passport_history()
test_visa_history()
```

#### Booking Model (`apps/bookings/tests/test_models.py`)

**Tests:**
- Booking creation
- Passport validation (required for BOOKED)
- Passport expiry validation
- Package capacity validation
- EOI booking (no validation)
- Unique active booking constraint
- Audit trail on Booking

**Run:**
```bash
docker-compose exec backend pytest apps/bookings/tests/test_models.py -v
```

**Key Tests:**
```python
# Test validation
test_booking_requires_valid_passport()
test_booking_checks_passport_expiry()
test_booking_checks_capacity()

# Test workflows
test_booking_eoi_no_validation()
test_unique_active_booking_constraint()

# Test audit
test_booking_history()
```

### 2. API Tests

#### Authentication (`apps/api/tests/test_authentication.py`)

**Tests:**
- OTP request (success and validation)
- OTP request rate limiting
- OTP verification (success and failures)
- OTP expiry
- OTP max attempts
- JWT token generation
- JWT token refresh
- Account creation on first login

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_authentication.py -v
```

**Key Tests:**
```python
# OTP request
test_request_otp_success()
test_request_otp_invalid_phone()
test_request_otp_rate_limiting()

# OTP verification
test_verify_otp_success()
test_verify_otp_invalid_code()
test_verify_otp_expired()
test_verify_otp_max_attempts()
test_verify_otp_creates_pilgrim_profile()

# JWT
test_refresh_token()
test_refresh_invalid_token()
```

#### Profile Endpoints (`apps/api/tests/test_profile_endpoints.py`)

**Tests:**
- Get profile (authenticated)
- Profile includes masked passport
- Unauthenticated access denied
- Staff cannot access pilgrim endpoints
- List visas (with filtering)
- List bookings

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_profile_endpoints.py -v
```

**Key Tests:**
```python
# Profile
test_get_profile_authenticated()
test_get_profile_unauthenticated()
test_get_profile_staff_denied()

# Visas
test_get_visas()
test_get_visas_filter_by_trip()

# Bookings
test_get_bookings()
```

#### Trip Endpoints (`apps/api/tests/test_trip_endpoints.py`)

**Tests:**
- List trips (only with bookings)
- Filter trips (upcoming/past)
- Trip details
- Trip itinerary
- Trip updates (trip-level and package-specific)
- Trip essentials (composite data)
- Access control (no booking = no access)

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_trip_endpoints.py -v
```

**Key Tests:**
```python
# Trip list
test_list_trips_with_booking()
test_list_trips_no_bookings()
test_list_trips_filter_upcoming()

# Trip detail
test_get_trip_detail()
test_get_trip_detail_no_access()

# Trip data
test_get_itinerary()
test_get_trip_updates()
test_get_package_specific_updates()
test_get_essentials()
```

#### Package Endpoints (`apps/api/tests/test_package_endpoints.py`)

**Tests:**
- Package details (with flights and hotels)
- Package flights list
- Package hotels list
- Access control (no booking = no access)

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_package_endpoints.py -v
```

**Key Tests:**
```python
# Package
test_get_package_detail()
test_get_package_no_access()

# Package data
test_get_flights()
test_get_flights_no_access()
test_get_hotels()
test_get_hotels_no_access()

# Duas
test_list_duas()
test_list_duas_filter_by_category()
```

#### Permissions (`apps/api/tests/test_permissions.py`)

**Tests:**
- Data scoping (pilgrims only see own data)
- IsPilgrim permission enforcement
- Staff cannot access pilgrim endpoints
- Authentication required for all endpoints

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_permissions.py -v
```

**Key Tests:**
```python
# Data scoping
test_pilgrim_cannot_see_other_pilgrims_bookings()
test_pilgrim_cannot_see_other_pilgrims_visas()
test_pilgrim_cannot_access_trips_without_booking()

# Permissions
test_staff_cannot_access_pilgrim_endpoints()
test_all_endpoints_require_authentication()
```

#### Integration Tests (`apps/api/tests/test_integration.py`)

**Tests:**
- Complete pilgrim journey (OTP → JWT → API access)
- Booking validation flow
- Capacity enforcement

**Run:**
```bash
docker-compose exec backend pytest apps/api/tests/test_integration.py -v
```

**Key Tests:**
```python
# E2E
test_complete_pilgrim_flow()  # OTP → Profile → Booking → Trip access

# Validation
test_cannot_book_without_valid_passport()
test_cannot_book_beyond_capacity()
```

## 🧪 Manual Testing

### 1. Authentication Flow

```bash
# Start services
docker-compose up -d

# Test OTP request
curl -X POST http://localhost/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+256712345678"}'

# Check logs for OTP code (in dev mode)
docker-compose logs backend | grep "OTP for"

# Test OTP verification
curl -X POST http://localhost/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+256712345678", "code": "123456"}'

# Save the access token from response
TOKEN="<access-token>"

# Test authenticated endpoint
curl http://localhost/api/v1/me/ \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Admin Dashboard

**Access:** http://localhost/admin/

**Test Scenarios:**

#### Trip Creation
1. Login as superuser
2. Go to Trips → Add Trip
3. Fill in all fields
4. Save
5. Add packages in trip detail
6. Add flights/hotels to packages
7. Create itinerary items
8. Add travel essentials

#### Booking Workflow
1. Create pilgrim with profile
2. Add passport to pilgrim
3. Create EOI booking
4. Select booking → Action → "Convert EOI to BOOKED"
5. Verify validation passes
6. Check booking status changed

#### Trip Duplication
1. Go to Trips list
2. Select a trip
3. Action → "Duplicate selected trip(s)"
4. Check new trip created with all data

#### CSV Exports
1. Create trip with bookings
2. Select trip
3. Action → "Export trip roster as CSV"
4. Download and open in Excel
5. Verify data accuracy

### 3. API Documentation

**Access:** http://localhost/api/v1/docs/

**Test:**
1. Open Swagger UI
2. Click "Authorize" button
3. Enter JWT token: `Bearer <token>`
4. Try out each endpoint
5. Verify responses

### 4. Security Testing

#### Test Data Scoping
```bash
# Create two pilgrims with bookings
# Login as pilgrim 1
TOKEN1="<token1>"

# Try to access pilgrim 1's data - should work
curl http://localhost/api/v1/me/bookings/ \
  -H "Authorization: Bearer $TOKEN1"

# Login as pilgrim 2
TOKEN2="<token2>"

# Access pilgrim 2's data - should only see own bookings
curl http://localhost/api/v1/me/bookings/ \
  -H "Authorization: Bearer $TOKEN2"
```

#### Test Passport Encryption
```bash
# In Django shell
docker-compose exec backend python manage.py shell

from apps.pilgrims.models import Passport
passport = Passport.objects.first()

# Number is decrypted automatically
print(passport.number)  # "AB1234567"

# Check database has encrypted value
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT number FROM pilgrims_passport WHERE id = %s", [str(passport.id)])
row = cursor.fetchone()
print(row[0])  # Should be encrypted string, not plain text
```

## 📊 Test Fixtures

Shared fixtures are defined in `backend/conftest.py`:

```python
# Available fixtures:
- api_client              # DRF test client
- pilgrim_user            # Pilgrim account with profile
- staff_user              # Staff account with profile
- pilgrim_tokens          # JWT tokens for pilgrim
- authenticated_client    # Client with auth header
- trip                    # Test trip
- trip_package            # Test package
- passport                # Test passport
- booking                 # Test booking
- visa                    # Test visa
- otp_code               # Test OTP
- flight                  # Test flight
- hotel                   # Test hotel
- dua                     # Test dua
```

**Usage in tests:**
```python
def test_something(authenticated_client, booking):
    # authenticated_client has JWT token
    # booking fixture provides test booking
    response = authenticated_client.get('/api/v1/me/bookings/')
    assert response.status_code == 200
```

## 🔍 Debugging Tests

### Print Debugging

```python
def test_something(pilgrim_user):
    print(f"User: {pilgrim_user}")
    print(f"Phone: {pilgrim_user.phone}")
    # Run with: pytest -s
```

### Django Shell

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# Import models and test
from apps.trips.models import Trip
trips = Trip.objects.all()
print(trips)
```

### Database Inspection

```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres alhilal

# List tables
\dt

# Query data
SELECT * FROM accounts_account;
SELECT * FROM trips_trip;
```

## ✅ Test Checklist

Before deploying, ensure:

- [ ] All tests passing: `make test`
- [ ] No linting errors: `make lint`
- [ ] Manual authentication flow works
- [ ] Admin dashboard accessible
- [ ] API documentation loads
- [ ] Data scoping verified
- [ ] Passport encryption verified
- [ ] CSV exports work
- [ ] Admin actions work
- [ ] Integration tests pass

## 📈 Continuous Integration

### GitHub Actions (Example)

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install -r backend/requirements-dev.txt
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test
          REDIS_URL: redis://localhost:6379/0
        run: |
          cd backend
          pytest --cov=apps --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🐛 Common Issues

### Issue: Tests fail with database errors

```bash
# Reset test database
docker-compose exec backend pytest --create-db

# Or recreate database
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### Issue: Import errors

```bash
# Rebuild containers
docker-compose up -d --build

# Check Python path
docker-compose exec backend python -c "import sys; print(sys.path)"
```

### Issue: Fixtures not found

```bash
# Ensure conftest.py exists
ls backend/conftest.py

# Check fixture import
docker-compose exec backend pytest --fixtures
```

## 📝 Writing New Tests

### Test Template

```python
import pytest
from rest_framework import status

@pytest.mark.django_db
class TestMyFeature:
    """Tests for my feature."""
    
    def test_success_case(self, authenticated_client):
        """Test successful operation."""
        response = authenticated_client.get('/api/v1/endpoint/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'data' in response.data
    
    def test_validation_error(self, api_client):
        """Test validation handles errors."""
        response = api_client.post('/api/v1/endpoint/', {})
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
```

### Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** (`test_booking_requires_valid_passport`)
3. **Use fixtures** (don't repeat setup code)
4. **Test edge cases** (empty data, max values, etc.)
5. **Test permissions** (authenticated, unauthorized, wrong role)
6. **Test validation** (invalid data, missing fields)
7. **Clean up** (use transactions, fixtures handle cleanup)

---

**For more testing examples, see the test files in `backend/apps/*/tests/`**

