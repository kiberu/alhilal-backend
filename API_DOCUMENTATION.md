# 📚 Alhilal Travels API Documentation

Complete API documentation for the Alhilal Pilgrimage Management System.

---

## 🌐 **Access Documentation**

### **Production:**
- **Landing Page**: https://api.alhilaltravels.com/
- **Swagger UI**: https://api.alhilaltravels.com/api/docs/
- **ReDoc**: https://api.alhilaltravels.com/api/redoc/
- **OpenAPI Schema**: https://api.alhilaltravels.com/api/schema/

### **Railway (Staging):**
- **Landing Page**: https://alhilal-backend-production.up.railway.app/
- **Swagger UI**: https://alhilal-backend-production.up.railway.app/api/docs/
- **ReDoc**: https://alhilal-backend-production.up.railway.app/api/redoc/

### **Local Development:**
- **Landing Page**: http://localhost:8000/
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

---

## 📖 **Documentation Interfaces**

### **1. Swagger UI** (Interactive)
- ✅ Try API endpoints directly in browser
- ✅ Test authentication
- ✅ See request/response examples
- ✅ Download responses
- **Best for**: Development and testing

### **2. ReDoc** (Clean & Professional)
- ✅ Clean, responsive design
- ✅ Easy to navigate
- ✅ Code samples in multiple languages
- ✅ Print-friendly
- **Best for**: Client documentation and reference

### **3. OpenAPI Schema** (JSON)
- ✅ Raw OpenAPI 3.0 specification
- ✅ Import into Postman, Insomnia, etc.
- ✅ Generate client SDKs
- **Best for**: Integration and code generation

---

## 🔐 **Authentication**

### **Obtaining JWT Token**

```bash
# Login Request
curl -X POST https://api.alhilaltravels.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin"
  }
}
```

### **Using JWT Token**

```bash
# Include token in Authorization header
curl -X GET https://api.alhilaltravels.com/api/v1/trips/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### **Refresh Token**

```bash
curl -X POST https://api.alhilaltravels.com/api/v1/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'
```

---

## 📋 **Main API Endpoints**

### **Authentication**
```
POST   /api/v1/auth/register/          # Register new user
POST   /api/v1/auth/login/             # Login
POST   /api/v1/auth/refresh/           # Refresh token
POST   /api/v1/auth/logout/            # Logout
POST   /api/v1/auth/password/change/   # Change password
POST   /api/v1/auth/password/reset/    # Reset password
```

### **Profile**
```
GET    /api/v1/profile/                # Get user profile
PUT    /api/v1/profile/                # Update profile
PATCH  /api/v1/profile/                # Partial update
```

### **Trips**
```
GET    /api/v1/trips/                  # List trips
POST   /api/v1/trips/                  # Create trip (admin)
GET    /api/v1/trips/{id}/             # Get trip details
PUT    /api/v1/trips/{id}/             # Update trip (admin)
DELETE /api/v1/trips/{id}/             # Delete trip (admin)
GET    /api/v1/trips/{id}/packages/    # List trip packages
```

### **Packages**
```
GET    /api/v1/trips/{trip_id}/packages/              # List packages
POST   /api/v1/trips/{trip_id}/packages/              # Create package (admin)
GET    /api/v1/trips/{trip_id}/packages/{id}/         # Get package
PUT    /api/v1/trips/{trip_id}/packages/{id}/         # Update package (admin)
DELETE /api/v1/trips/{trip_id}/packages/{id}/         # Delete package (admin)
```

### **Bookings**
```
GET    /api/v1/bookings/               # List bookings
POST   /api/v1/bookings/               # Create booking
GET    /api/v1/bookings/{id}/          # Get booking
PUT    /api/v1/bookings/{id}/          # Update booking
DELETE /api/v1/bookings/{id}/          # Cancel booking
POST   /api/v1/bookings/{id}/payment/  # Record payment
```

### **Pilgrims**
```
GET    /api/v1/admin/pilgrims/         # List pilgrims (admin)
POST   /api/v1/admin/pilgrims/         # Create pilgrim (admin)
GET    /api/v1/admin/pilgrims/{id}/    # Get pilgrim (admin)
PUT    /api/v1/admin/pilgrims/{id}/    # Update pilgrim (admin)
DELETE /api/v1/admin/pilgrims/{id}/    # Delete pilgrim (admin)
POST   /api/v1/admin/pilgrims/import/  # Bulk import (admin)
```

### **Documents**
```
GET    /api/v1/admin/passports/        # List passports (admin)
POST   /api/v1/admin/passports/        # Create passport (admin)
GET    /api/v1/admin/visas/            # List visas (admin)
POST   /api/v1/admin/visas/            # Create visa (admin)
```

### **Content**
```
GET    /api/v1/duas/                   # List duas
GET    /api/v1/duas/{id}/              # Get dua
GET    /api/v1/itineraries/            # List itineraries
GET    /api/v1/itineraries/{id}/       # Get itinerary
```

---

## 💻 **Code Examples**

### **JavaScript/Node.js**

```javascript
// Fetch trips
const response = await fetch('https://api.alhilaltravels.com/api/v1/trips/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

const trips = await response.json();
console.log(trips);
```

### **Python**

```python
import requests

# Login
response = requests.post(
    'https://api.alhilaltravels.com/api/v1/auth/login/',
    json={
        'email': 'user@example.com',
        'password': 'password'
    }
)

data = response.json()
access_token = data['access']

# Get trips
trips = requests.get(
    'https://api.alhilaltravels.com/api/v1/trips/',
    headers={'Authorization': f'Bearer {access_token}'}
).json()

print(trips)
```

### **cURL**

```bash
# Create booking
curl -X POST https://api.alhilaltravels.com/api/v1/bookings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trip": 1,
    "package": 1,
    "pilgrims": [1, 2, 3],
    "notes": "Special requirements"
  }'
```

---

## 📦 **Using OpenAPI Schema**

### **Import to Postman**

1. Download schema: `https://api.alhilaltravels.com/api/schema/`
2. Open Postman
3. Click **Import** → **Upload Files**
4. Select downloaded `openapi.json`
5. All endpoints imported!

### **Generate Client SDK**

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate \
  -i https://api.alhilaltravels.com/api/schema/ \
  -g typescript-axios \
  -o ./src/api-client

# Generate Python client
openapi-generator-cli generate \
  -i https://api.alhilaltravels.com/api/schema/ \
  -g python \
  -o ./python-client
```

---

## 🔍 **Response Formats**

### **Success Response**

```json
{
  "id": 1,
  "title": "Umrah Package 2025",
  "description": "Complete Umrah package...",
  "start_date": "2025-03-01",
  "end_date": "2025-03-15",
  "status": "active",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### **List Response (Paginated)**

```json
{
  "count": 25,
  "next": "https://api.alhilaltravels.com/api/v1/trips/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Umrah Package 2025",
      ...
    }
  ]
}
```

### **Error Response**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "email": ["This field is required."],
  "password": ["This field may not be blank."]
}
```

---

## 🎯 **Filtering & Pagination**

### **Filtering**

```bash
# Filter trips by status
GET /api/v1/trips/?status=active

# Filter bookings by date
GET /api/v1/bookings/?created_after=2025-01-01

# Search trips
GET /api/v1/trips/?search=umrah
```

### **Pagination**

```bash
# Get second page
GET /api/v1/trips/?page=2

# Change page size
GET /api/v1/trips/?page_size=50
```

### **Ordering**

```bash
# Order by start date (ascending)
GET /api/v1/trips/?ordering=start_date

# Order by start date (descending)
GET /api/v1/trips/?ordering=-start_date
```

---

## 🛠️ **Development**

### **Local Setup**

```bash
# Start Django server
cd backend
python manage.py runserver

# Access docs
open http://localhost:8000/api/docs/
```

### **Generate Updated Schema**

```bash
# Generate schema file
python manage.py spectacular --file schema.yml

# Validate schema
python manage.py spectacular --validate
```

---

## 📞 **Support**

- **Website**: https://alhilaltravels.com
- **Email**: info@alhilaltravels.com
- **API Issues**: Create an issue in the repository
- **Documentation Issues**: Submit a pull request

---

## 📄 **License**

© 2025 Alhilal Travels. All rights reserved.

