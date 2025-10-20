# Alhilal Pilgrimage Management System

A comprehensive backend system for managing Umrah and Hajj pilgrimages, built with Django REST Framework.

## 📋 Overview

Alhilal is a production-ready pilgrimage management platform that handles the complete lifecycle of pilgrimage trips, from booking to post-trip follow-up. The system provides a secure REST API for mobile/web applications and a powerful Django Admin dashboard for staff operations.

### Key Features

- **OTP Authentication** - Passwordless login via SMS for pilgrims
- **Trip Management** - Complete trip planning with flights, hotels, and itineraries
- **Booking System** - EOI to confirmed booking workflow with validation
- **Visa Processing** - Track visa applications from submission to approval
- **Document Management** - Secure document storage with Cloudinary
- **Admin Dashboard** - Powerful tools with 14 custom actions for operations
- **REST API** - 15 endpoints for mobile/web integration
- **Audit Trail** - Full history tracking on sensitive models
- **Data Encryption** - Passport numbers encrypted at rest

## 🏗️ Architecture

### Tech Stack

- **Backend**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis + Celery
- **Storage**: Cloudinary (documents & media)
- **Authentication**: OTP + JWT (djangorestframework-simplejwt)
- **Deployment**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)

### Project Structure

```
alhilal/
├── backend/                    # Django project
│   ├── alhilal/               # Main project settings
│   ├── apps/
│   │   ├── accounts/          # User accounts & authentication
│   │   ├── pilgrims/          # Passport & visa management
│   │   ├── trips/             # Trip planning & logistics
│   │   ├── bookings/          # Booking management
│   │   ├── content/           # Duas & notifications
│   │   ├── api/               # REST API endpoints
│   │   └── common/            # Shared utilities
│   ├── templates/             # Admin templates
│   └── manage.py
├── nginx/                     # Nginx configuration
├── scripts/                   # Setup & utility scripts
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
└── Makefile                   # Common commands
```

## 🎯 Core Functionality

### For Pilgrims (Mobile/Web App)
- Passwordless authentication via OTP
- View booking details and trip information
- Access day-by-day itinerary
- Check flight and hotel details
- Read trip updates and announcements
- Access travel essentials (guides, checklists, contacts)
- Browse duas by category
- Track visa status

### For Staff (Admin Dashboard)
- Complete trip planning with packages
- Manage pilgrim profiles and documents
- Process bookings (EOI → Booked)
- Track visa applications
- Duplicate trips instantly
- Export manifests (flights, hotels, rosters)
- Auto-assign room numbers
- Import pilgrims from CSV

## 📊 Data Models

**19 Core Models:**

1. **Account** - Custom user model (phone-based)
2. **StaffProfile** - Admin, Agent, Auditor roles
3. **PilgrimProfile** - Pilgrim information with audit trail
4. **OTPCode** - One-time password codes
5. **Passport** - Encrypted passport information
6. **Visa** - Visa tracking with status workflow
7. **Trip** - Trip master data
8. **TripPackage** - Package variants (Gold, Premium, etc.)
9. **PackageFlight** - Flight schedules per package
10. **PackageHotel** - Hotel bookings per package
11. **ItineraryItem** - Day-by-day activities
12. **TripUpdate** - Announcements and updates
13. **TripGuideSection** - Travel guides
14. **ChecklistItem** - Pre-trip checklists
15. **EmergencyContact** - Emergency contacts
16. **TripFAQ** - Frequently asked questions
17. **Booking** - Pilgrim bookings with validation
18. **Dua** - Islamic supplications (multi-language)
19. **NotificationLog** - Notification tracking

## 🔒 Security Features

- **OTP Authentication** - 6-digit codes, 10-minute expiry, rate-limited
- **JWT Tokens** - Short-lived access tokens (1 hour) + refresh tokens
- **Field Encryption** - Passport numbers encrypted with Fernet
- **Audit Trail** - Change history on 6 sensitive models
- **Signed URLs** - Cloudinary documents expire in 10 minutes
- **Object-Level Permissions** - Users only see their own data
- **Rate Limiting** - 5 OTP requests/min per IP, 10/hour per phone
- **Data Validation** - 8 business logic validators

## 📱 API Overview

**15 REST API Endpoints:**

### Authentication (3)
- `POST /api/v1/auth/request-otp` - Request OTP code
- `POST /api/v1/auth/verify-otp` - Verify OTP & get JWT
- `POST /api/v1/auth/refresh` - Refresh access token

### Profile (3)
- `GET /api/v1/me` - Pilgrim profile
- `GET /api/v1/me/visas` - Pilgrim visas
- `GET /api/v1/me/bookings` - Pilgrim bookings

### Trips (5)
- `GET /api/v1/trips` - List trips (user's bookings only)
- `GET /api/v1/trips/{id}` - Trip details
- `GET /api/v1/trips/{id}/itinerary` - Day-by-day itinerary
- `GET /api/v1/trips/{id}/updates` - Trip announcements
- `GET /api/v1/trips/{id}/essentials` - Travel essentials

### Packages (3)
- `GET /api/v1/packages/{id}` - Package details
- `GET /api/v1/packages/{id}/flights` - Package flights
- `GET /api/v1/packages/{id}/hotels` - Package hotels

### Content (1)
- `GET /api/v1/duas` - Islamic supplications

**API Documentation:** `/api/v1/docs/` (Swagger/OpenAPI)

## 🎛️ Admin Actions

**14 Custom Admin Actions:**

### Trip Management
- Duplicate trip (with all logistics)
- Export trip roster
- Export flight manifest
- Export hotel rooming list

### Booking Workflow
- Convert EOI to Booked (with validation)
- Cancel bookings
- Auto-assign room numbers
- Export bookings

### Visa Processing
- Mark as submitted
- Approve visas (with validation)
- Reject visas
- Export visa status

### Data Import/Export
- Export passports (masked)
- Import pilgrims from CSV

## 📈 System Stats

- **70 Python files** - Clean, documented code
- **19 Data models** - Complete domain coverage
- **15 API endpoints** - Full mobile/web integration
- **14 Admin actions** - Operational efficiency
- **50+ Tests** - Comprehensive test coverage
- **5 Permission classes** - Secure access control
- **8 Validators** - Data integrity enforcement

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for detailed installation instructions.

```bash
# 1. Clone repository
git clone <repository-url>
cd alhilal

# 2. Start services
make dev-up

# 3. Run migrations
make migrate

# 4. Create superuser
make superuser

# 5. Access admin
open http://localhost/admin/
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Installation and configuration
- **[FEATURES.md](FEATURES.md)** - Detailed feature guide
- **[TESTING.md](TESTING.md)** - Testing guide
- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Git branching strategy

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test file
docker-compose exec backend pytest apps/api/tests/test_authentication.py -v

# Run with coverage
docker-compose exec backend pytest --cov=apps --cov-report=html
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## 📝 License

Copyright © 2025 Alhilal. All rights reserved.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for seamless pilgrimage management**
