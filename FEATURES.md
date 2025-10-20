# Features Guide - Alhilal Pilgrimage Management System

Complete guide to all system features, including API endpoints, admin actions, and workflows.

## 📑 Table of Contents

- [Authentication System](#authentication-system)
- [API Endpoints](#api-endpoints)
- [Admin Dashboard](#admin-dashboard)
- [Admin Custom Actions](#admin-custom-actions)
- [Data Models](#data-models)
- [Security Features](#security-features)

---

## 🔐 Authentication System

### OTP-based Authentication

**How it Works:**
1. User enters phone number
2. System generates 6-digit OTP code
3. OTP expires in 10 minutes
4. User enters OTP to verify
5. System issues JWT access + refresh tokens
6. User accesses API with access token

**Security Features:**
- Rate limiting: 5 requests/min per IP
- Rate limiting: 10 requests/hour per phone
- Max 5 verification attempts per OTP
- Automatic account creation on first login
- Pilgrim profile auto-created

**API Flow:**

```http
# Step 1: Request OTP
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+256712345678"
}

Response:
{
  "sent": true,
  "expires_in": 600,
  "debug_code": "123456"  // Only in DEBUG mode
}

# Step 2: Verify OTP
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+256712345678",
  "code": "123456"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+256712345678",
    "role": "PILGRIM"
  }
}

# Step 3: Use Access Token
GET /api/v1/me/
Authorization: Bearer <access-token>

# Step 4: Refresh Token (when access expires)
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh": "<refresh-token>"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 📱 API Endpoints

### Profile Endpoints

#### Get Profile
```http
GET /api/v1/me/
Authorization: Bearer <token>

Response:
{
  "name": "John Doe",
  "phone": "+256712345678",
  "email": "john@example.com",
  "dob": "1990-01-15",
  "nationality": "UG",
  "emergency_name": "Jane Doe",
  "emergency_phone": "+256712345679",
  "passport": {
    "id": "uuid",
    "country": "UG",
    "expiry_date": "2026-12-31",
    "number_masked": "****5678",
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

#### Get Visas
```http
GET /api/v1/me/visas/
Authorization: Bearer <token>
Query Parameters:
  - trip_id (optional): Filter by trip

Response:
{
  "count": 2,
  "results": [
    {
      "id": "uuid",
      "trip_code": "UMRAH2025",
      "trip_name": "Umrah 2025 - May",
      "status": "APPROVED",
      "ref_no": "VIS123456",
      "issue_date": "2025-01-15",
      "expiry_date": "2025-07-15",
      "doc_url_signed": "https://cloudinary.com/...",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

#### Get Bookings
```http
GET /api/v1/me/bookings/
Authorization: Bearer <token>

Response:
{
  "count": 1,
  "results": [
    {
      "id": "uuid",
      "trip": {
        "id": "uuid",
        "code": "UMRAH2025",
        "name": "Umrah 2025 - May",
        "start_date": "2025-05-01",
        "end_date": "2025-05-16",
        "cities": ["Makkah", "Madinah"]
      },
      "package": {
        "id": "uuid",
        "name": "Gold Package",
        "price_minor_units": 5000000,
        "currency": "UGX"
      },
      "status": "BOOKED",
      "ticket_number": "TK123456",
      "room_assignment": "Room 201",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Trip Endpoints

#### List Trips
```http
GET /api/v1/trips/
Authorization: Bearer <token>
Query Parameters:
  - when: "upcoming" | "past" (filter by date)

Response:
{
  "count": 2,
  "results": [
    {
      "id": "uuid",
      "code": "UMRAH2025",
      "name": "Umrah 2025 - May",
      "cities": ["Makkah", "Madinah"],
      "start_date": "2025-05-01",
      "end_date": "2025-05-16"
    }
  ]
}
```

#### Trip Details
```http
GET /api/v1/trips/{id}/
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "code": "UMRAH2025",
  "name": "Umrah 2025 - May",
  "cities": ["Makkah", "Madinah"],
  "start_date": "2025-05-01",
  "end_date": "2025-05-16",
  "visibility": "PUBLIC",
  "packages_count": 2
}
```

#### Trip Itinerary
```http
GET /api/v1/trips/{id}/itinerary/
Authorization: Bearer <token>

Response:
{
  "count": 15,
  "results": [
    {
      "id": "uuid",
      "day_index": 1,
      "start_time": "06:00:00",
      "end_time": "10:00:00",
      "title": "Arrival at Jeddah Airport",
      "location": "King Abdulaziz International Airport",
      "notes": "Group meet at Terminal 1",
      "attach_url_signed": "https://cloudinary.com/..."
    }
  ]
}
```

#### Trip Updates
```http
GET /api/v1/trips/{id}/updates/
Authorization: Bearer <token>
Query Parameters:
  - since: ISO datetime (get updates after this time)

Response:
{
  "count": 5,
  "results": [
    {
      "id": "uuid",
      "title": "Flight Delay Notice",
      "body_md": "Our outbound flight has been delayed...",
      "urgency": "IMPORTANT",
      "pinned": true,
      "publish_at": "2025-04-25T14:30:00Z",
      "package_name": "Gold Package",
      "attach_url_signed": "https://cloudinary.com/...",
      "created_at": "2025-04-25T14:00:00Z"
    }
  ]
}
```

#### Trip Essentials
```http
GET /api/v1/trips/{id}/essentials/
Authorization: Bearer <token>

Response:
{
  "sections": [
    {
      "id": "uuid",
      "order": 1,
      "title": "What to Pack",
      "content_md": "# Packing List\n- Ihram clothing...",
      "attach_url_signed": "https://cloudinary.com/..."
    }
  ],
  "checklist": [
    {
      "id": "uuid",
      "label": "Valid Passport",
      "category": "DOCS",
      "is_required": true,
      "link_url": null,
      "package_name": null
    }
  ],
  "contacts": [
    {
      "id": "uuid",
      "label": "Tour Guide",
      "phone": "+966501234567",
      "hours": "24/7",
      "notes": "WhatsApp available"
    }
  ],
  "faqs": [
    {
      "id": "uuid",
      "question": "What time is check-in at the hotel?",
      "answer": "Check-in is at 2:00 PM. Early check-in subject to availability.",
      "order": 1
    }
  ]
}
```

### Package Endpoints

#### Package Details
```http
GET /api/v1/packages/{id}/
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "Gold Package",
  "price_minor_units": 5000000,
  "currency": "UGX",
  "capacity": 50,
  "flights": [
    {
      "id": "uuid",
      "leg": "OUTBOUND",
      "carrier": "EK",
      "flight_no": "EK730",
      "dep_airport": "EBB",
      "dep_dt": "2025-05-01T02:00:00Z",
      "arr_airport": "DXB",
      "arr_dt": "2025-05-01T08:00:00Z",
      "group_pnr": "ABC123"
    }
  ],
  "hotels": [
    {
      "id": "uuid",
      "name": "Hilton Makkah Convention Hotel",
      "address": "Near Haram, Makkah",
      "room_type": "Standard",
      "check_in": "2025-05-01",
      "check_out": "2025-05-11",
      "group_confirmation_no": "CONF123"
    }
  ]
}
```

#### Package Flights
```http
GET /api/v1/packages/{id}/flights/
Authorization: Bearer <token>

Response: (same as flights array in package details)
```

#### Package Hotels
```http
GET /api/v1/packages/{id}/hotels/
Authorization: Bearer <token>

Response: (same as hotels array in package details)
```

### Content Endpoints

#### List Duas
```http
GET /api/v1/duas/
Authorization: Bearer <token>
Query Parameters:
  - category: "TAWAF" | "SAI" | "ARAFAT" | "GENERAL"

Response:
{
  "count": 10,
  "results": [
    {
      "id": "uuid",
      "category": "TAWAF",
      "text_ar": "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ",
      "text_en": "Glory be to Allah and praise be to Allah",
      "transliteration": "SubhanAllah wal-hamdu lillah",
      "source": "Hadith"
    }
  ]
}
```

---

## 🎛️ Admin Dashboard

Access: `http://localhost/admin/`

### Trip Management

**Create Trip:**
1. Go to Trips → Add Trip
2. Fill in:
   - Code (unique identifier, e.g., UMRAH2025)
   - Name (display name)
   - Cities (JSON array: ["Makkah", "Madinah"])
   - Start/End dates
   - Visibility (PUBLIC/PRIVATE)
3. Save trip
4. Add packages, itinerary, essentials via inlines

**Trip Inlines (edit in trip detail):**
- Packages (with capacity & pricing)
- Itinerary Items (day-by-day schedule)
- Updates (announcements)
- Guide Sections (travel guides)
- Checklist Items (pre-trip tasks)
- Emergency Contacts
- FAQs

### Package Management

**Add Package:**
1. In trip detail, scroll to Packages inline
2. Add row:
   - Name (Gold, Premium, etc.)
   - Capacity (number of slots)
   - Price (in minor units: 5000000 = 50,000.00)
   - Currency (UGX, USD, etc.)
   - Visibility
3. Save
4. Add flights and hotels in package detail

**Package Details:**
- Flights inline: Add all outbound, connecting, return flights
- Hotels inline: Add all accommodation details

### Booking Management

**Create Booking:**
1. Go to Bookings → Add Booking
2. Select:
   - Pilgrim (must have profile)
   - Package
   - Status (EOI or BOOKED)
3. Optional:
   - Ticket Number
   - Room Assignment
4. Save

**Booking Workflow:**
- PENDING → Not yet confirmed
- EOI → Expression of Interest
- BOOKED → Confirmed (validated)
- CANCELLED → Cancelled booking

**Validation on BOOKED:**
- Pilgrim must have valid passport
- Passport must not be expired before trip end
- Package must have available capacity

### Visa Management

**Create Visa:**
1. Go to Visas → Add Visa
2. Select:
   - Pilgrim
   - Trip
   - Status (PENDING)
3. Save

**Visa Workflow:**
1. PENDING → Initial state
2. SUBMITTED → Sent to embassy
3. APPROVED → Visa granted (requires doc + dates)
4. REJECTED → Visa denied

**Approval Requirements:**
- Must upload document (doc_public_id)
- Must set issue_date
- Must set expiry_date
- Expiry must be after issue

---

## ⚡ Admin Custom Actions

### Trip Actions

#### 1. Duplicate Trip
**What it does:** Creates complete copy of trip with all related data

**Duplicates:**
- Trip (new code with timestamp)
- All packages
- All flights (per package)
- All hotels (per package)
- Itinerary items
- Guide sections
- Checklist items
- Emergency contacts
- FAQs

**Does NOT duplicate:**
- Bookings
- Visas
- Updates

**Usage:**
1. Go to Trips list
2. Select trip(s) to duplicate
3. Action → "Duplicate selected trip(s) with all logistics"
4. Click "Go"
5. New trip created instantly

**Time Saved:** 2 hours → 5 seconds!

#### 2. Export Trip Roster
**What it does:** Exports complete pilgrim roster as CSV

**Includes:**
- Pilgrim details (name, phone, email, nationality, DOB)
- Booking details (status, ticket, room)
- Passport info (masked number, country, expiry)
- Emergency contacts

**Usage:**
1. Select trip(s)
2. Action → "Export trip roster as CSV"
3. Download file
4. Open in Excel/Google Sheets

**Use Case:** Provide to tour guides, airlines, embassies

#### 3. Export Flight Manifest
**What it does:** Exports flight details with passenger list

**Includes:**
- All flights (outbound, connecting, return)
- All pilgrims per flight
- PNR, ticket numbers
- Seat assignment column (to fill manually)

**Usage:**
1. Select trip(s)
2. Action → "Export flight manifest as CSV"
3. Download
4. Share with airline

#### 4. Export Hotel Rooming List
**What it does:** Exports hotel bookings with guest list

**Includes:**
- All hotels
- All pilgrims per hotel
- Check-in/out dates
- Room assignments
- Confirmation numbers

**Usage:**
1. Select trip(s)
2. Action → "Export hotel rooming list as CSV"
3. Download
4. Share with hotels

### Booking Actions

#### 5. Convert EOI to BOOKED
**What it does:** Confirms bookings with validation

**Validates:**
- Pilgrim has valid passport
- Passport not expired (vs trip dates)
- Package has available capacity

**Usage:**
1. Go to Bookings list
2. Filter: Status = EOI
3. Select bookings to confirm
4. Action → "Convert EOI to BOOKED (with validation)"
5. Click "Go"
6. Success/error messages shown

**Errors:**
- "No valid passport found" → Create passport first
- "Passport expires before trip" → Update passport
- "Package at capacity" → Increase capacity or change package

#### 6. Cancel Bookings
**What it does:** Bulk cancel bookings

**Usage:**
1. Select bookings
2. Action → "Cancel selected bookings"
3. Status changed to CANCELLED

#### 7. Auto-Assign Rooms
**What it does:** Automatically assigns room numbers

**Logic:**
- Assigns sequential numbers (Room 101, 102, 103...)
- Only assigns to BOOKED status
- Skips if room already assigned

**Usage:**
1. Filter: Status = BOOKED, Room Assignment = Empty
2. Select bookings
3. Action → "Auto-assign room numbers"
4. Rooms assigned instantly

#### 8. Export Bookings CSV
**What it does:** Exports booking report

**Includes:**
- All booking details
- Pilgrim information
- Passport (masked)
- Trip & package details

**Usage:**
1. Select bookings (use filters)
2. Action → "Export as CSV"
3. Download report

### Visa Actions

#### 9-11. Visa Workflow Actions
**Workflow:**
1. Mark as SUBMITTED → Update status to SUBMITTED
2. Approve visas → Change to APPROVED (validates doc + dates)
3. Reject visas → Change to REJECTED

**Usage:**
1. Filter by status
2. Select visas
3. Choose action
4. Click "Go"

#### 12. Export Visa Status
**What it does:** Exports visa tracking report

**Includes:**
- Pilgrim details
- Trip information
- Visa status, ref number
- Issue/expiry dates
- Timeline

**Usage:**
1. Select visas (any status)
2. Action → "Export visa status as CSV"
3. Download report

### Passport Actions

#### 13. Export Passports CSV
**What it does:** Exports passport list with masked numbers

**Security:**
- Numbers always masked (****1234)
- Safe for sharing

**Usage:**
1. Go to Passports list
2. Select passports
3. Action → "Export as CSV (masked)"
4. Download

---

## 📊 Data Models

### Account
- **Purpose:** User authentication
- **Fields:** phone (unique), name, email, role, password
- **Roles:** PILGRIM, STAFF
- **Note:** Phone-based authentication

### PilgrimProfile
- **Purpose:** Pilgrim information
- **Fields:** dob, nationality, emergency contacts
- **Audit:** Full history tracked
- **Relationship:** One-to-one with Account

### Passport
- **Purpose:** Passport details
- **Fields:** number (encrypted!), country, expiry_date
- **Security:** Number encrypted with Fernet
- **Audit:** Full history tracked

### Visa
- **Purpose:** Visa tracking
- **Fields:** status, ref_no, issue_date, expiry_date, doc_public_id
- **Status Workflow:** PENDING → SUBMITTED → APPROVED/REJECTED
- **Audit:** Full history tracked
- **Validation:** APPROVED requires doc + dates

### Trip
- **Purpose:** Trip master data
- **Fields:** code (unique), name, cities, start_date, end_date
- **Audit:** Full history tracked
- **Relationships:** Has many packages, itinerary items, etc.

### TripPackage
- **Purpose:** Package variants
- **Fields:** name, capacity, price_minor_units, currency
- **Audit:** Full history tracked
- **Validation:** Capacity enforced on bookings

### Booking
- **Purpose:** Pilgrim bookings
- **Fields:** status, ticket_number, room_assignment
- **Status:** PENDING, EOI, BOOKED, CANCELLED
- **Audit:** Full history tracked
- **Validation:** Passport + capacity checks on BOOKED
- **Constraint:** One active booking per pilgrim/package

---

## 🔒 Security Features

### Field Encryption
- **What:** Passport numbers encrypted at rest
- **How:** Fernet symmetric encryption
- **Key:** 32-character key in FIELD_ENCRYPTION_KEY
- **Display:** Always masked (****1234) in exports

### Audit Trail
- **What:** Full change history on sensitive models
- **Models:** PilgrimProfile, Passport, Visa, Trip, TripPackage, Booking
- **Info:** Who changed what and when
- **Access:** Admin can view history

### Signed URLs
- **What:** Cloudinary documents have temporary access
- **Expiry:** 10 minutes
- **Auto-refresh:** New URL generated on each API call
- **Security:** No permanent public access

### Data Scoping
- **What:** Users only see their own data
- **Enforcement:** Object-level permissions
- **Example:** Pilgrim only sees their trips (via bookings)

### Rate Limiting
- **OTP:** 5 requests/min per IP, 10/hour per phone
- **API:** Configurable per endpoint
- **Protection:** Prevents brute force attacks

---

**For implementation details, see source code in `backend/apps/`**

