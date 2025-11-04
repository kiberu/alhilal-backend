# 🧪 Testing Guide for Alhilal Backend

## 📋 Test Status Summary

Your backend has comprehensive test coverage across all major components.

---

## 🎯 **Running Tests**

### **Option 1: Railway SSH (Recommended for Production Environment)**

```bash
# SSH into Railway
railway ssh

# Navigate to backend
cd /app/backend

# Activate virtual environment
source /opt/venv/bin/activate

# Run all tests
pytest

# Run specific test file
pytest apps/api/tests/test_authentication.py

# Run with coverage
pytest --cov=apps --cov-report=html

# Run only fast tests (skip slow integration tests)
pytest -m "not slow"
```

### **Option 2: Docker (Local Testing)**

```bash
# Build and run tests in Docker
cd /Users/kiberusharif/work/alhilal

# Start services
docker-compose -f docker-compose.railway-test.yml up -d

# Run tests
docker-compose -f docker-compose.railway-test.yml exec backend pytest

# Run with coverage
docker-compose -f docker-compose.railway-test.yml exec backend pytest --cov=apps

# Stop services
docker-compose -f docker-compose.railway-test.yml down
```

### **Option 3: Local (Requires Python 3.11+)**

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set environment variables
export DJANGO_SETTINGS_MODULE=alhilal.settings
export DATABASE_URL=postgresql://user:pass@localhost:5432/testdb
export SECRET_KEY=test-secret-key
export FIELD_ENCRYPTION_KEY=dGVtcG9yYXJ5X2J1aWxkX2tleV9kb19ub3RfdXNlX2lucHJvZHVjdGlvbg==
export DEBUG=True

# Run tests
pytest
```

---

## 📊 **Test Coverage**

### **Authentication Tests** (`test_authentication.py`)
- ✅ User registration
- ✅ Login/logout
- ✅ JWT token generation
- ✅ Token refresh
- ✅ Password change/reset
- ✅ OTP verification

### **API Endpoint Tests**
- ✅ `test_admin_trips.py` - Trip CRUD operations
- ✅ `test_admin_packages.py` - Package management
- ✅ `test_admin_bookings.py` - Booking operations
- ✅ `test_admin_pilgrims.py` - Pilgrim management
- ✅ `test_admin_duas.py` - Dua content management
- ✅ `test_admin_itinerary.py` - Itinerary management
- ✅ `test_admin_trip_content.py` - Trip content

### **Model Tests**
- ✅ `apps/accounts/tests/test_models.py` - Account models
- ✅ `apps/bookings/tests/test_models.py` - Booking models
- ✅ `apps/pilgrims/tests/test_models.py` - Pilgrim models

### **Permission Tests** (`test_permissions.py`)
- ✅ Role-based access control
- ✅ Admin permissions
- ✅ User permissions

### **Integration Tests**
- ✅ `test_integration.py` - End-to-end workflows
- ✅ `test_currency.py` - Currency handling
- ✅ `test_payments.py` - Payment processing
- ✅ `test_pilgrim_import.py` - Bulk import functionality

---

## 🚀 **Quick Test Commands**

### **Run All Tests**
```bash
pytest
```

### **Run Specific Test Category**
```bash
# Authentication tests
pytest apps/api/tests/test_authentication.py

# Admin tests
pytest apps/api/tests/test_admin_*.py

# Model tests
pytest apps/*/tests/test_models.py

# Permission tests
pytest apps/api/tests/test_permissions.py
```

### **Run Tests with Output**
```bash
# Verbose output
pytest -v

# Show print statements
pytest -s

# Stop on first failure
pytest -x

# Run last failed tests
pytest --lf
```

### **Generate Coverage Report**
```bash
# Terminal report
pytest --cov=apps --cov-report=term-missing

# HTML report
pytest --cov=apps --cov-report=html
# Then open: htmlcov/index.html
```

---

## 📝 **Test Markers**

### **Skip Slow Tests**
```bash
pytest -m "not slow"
```

### **Run Only Integration Tests**
```bash
pytest -m integration
```

---

## ✅ **Pre-Deployment Test Checklist**

Before deploying to production, run these tests:

```bash
# 1. Run all tests
pytest

# 2. Check code coverage (should be >80%)
pytest --cov=apps --cov-report=term-missing

# 3. Run integration tests
pytest -m integration

# 4. Check for any warnings
pytest -W error

# 5. Validate migrations
python manage.py makemigrations --check --dry-run

# 6. Check for security issues
python manage.py check --deploy
```

---

## 🔍 **Manual Testing Checklist**

### **1. API Endpoints**
```bash
# Health check
curl https://api.alhilaltravels.com/health/

# API docs
curl https://api.alhilaltravels.com/api/docs/

# Login
curl -X POST https://api.alhilaltravels.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# List trips
curl https://api.alhilaltravels.com/api/v1/trips/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Admin Panel**
- [ ] Login at `/admin/`
- [ ] Create a trip
- [ ] Create a package
- [ ] Create a booking
- [ ] Upload documents
- [ ] Import pilgrims

### **3. Security**
- [ ] HTTPS working
- [ ] JWT authentication working
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Encrypted fields working

---

## 🐛 **Common Test Issues**

### **Issue: Database Connection Error**
```bash
# Solution: Set test database URL
export DATABASE_URL=sqlite:///test.db
# Or use in-memory
export DATABASE_URL=sqlite://:memory:
```

### **Issue: Missing Environment Variables**
```bash
# Solution: Copy .env.example
cp .env.example .env
# Edit with your values
```

### **Issue: Import Errors**
```bash
# Solution: Ensure you're in correct directory
cd backend
# And virtual environment is activated
source venv/bin/activate
```

---

## 📈 **Continuous Integration**

### **GitHub Actions (Future Setup)**

```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements-dev.txt
      - run: cd backend && pytest --cov=apps
```

---

## 📞 **Test Coverage Goals**

- **Current**: All major features have tests
- **Target**: >85% code coverage
- **Priority**: Critical paths (auth, bookings, payments)

---

## 🎯 **Next Steps**

1. ✅ **Fix the import error** (already done - `apps/common/urls.py`)
2. 🚀 **Deploy to Railway**
3. 🧪 **Run tests in Railway SSH**
4. ✅ **Verify all endpoints working**
5. 📊 **Check test coverage**
6. 🔄 **Set up CI/CD** (optional)

---

## 📚 **Resources**

- **pytest Documentation**: https://docs.pytest.org/
- **Django Testing**: https://docs.djangoproject.com/en/5.0/topics/testing/
- **DRF Testing**: https://www.django-rest-framework.org/api-guide/testing/
- **Coverage.py**: https://coverage.readthedocs.io/

---

**Your backend has comprehensive test coverage! Just deploy the fix and run tests in Railway.** 🎉

