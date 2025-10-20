# Alhilal Admin Dashboard - Implementation Plan
## Next.js 15 + shadcn/ui + Django API

---

## 📋 Project Overview

**Frontend Stack:**
- Next.js 15 (App Router)
- TypeScript
- shadcn/ui (Radix UI components)
- TailwindCSS
- React Hook Form + Zod (validation)
- TanStack Query (React Query v5)
- Zustand (state management)
- Axios (API client)

**Backend:**
- Django REST Framework (existing)
- JWT Authentication
- OpenAPI/Swagger docs

---

## 🎯 Required Functionalities

### 1. **Authentication & Authorization**
- [ ] Staff login (phone + password)
- [ ] JWT token management (access + refresh)
- [ ] Protected routes & layouts
- [ ] Role-based access (ADMIN vs AGENT)
- [ ] Session persistence
- [ ] Auto-refresh tokens
- [ ] Logout functionality

### 2. **Dashboard Home**
- [ ] Key metrics cards
  - Total trips
  - Active bookings
  - Pending visas
  - Total pilgrims
- [ ] Recent activity feed
- [ ] Upcoming trips widget
- [ ] Quick actions menu
- [ ] Real-time statistics

### 3. **Trip Management**
- [ ] List all trips (table view)
  - Filters: status, date range, visibility
  - Search by name, code, cities
  - Sort by date, name, capacity
  - Pagination
- [ ] Create new trip
  - Trip details form
  - Package creation (inline)
  - Flight information
  - Hotel bookings
  - Itinerary builder
  - Travel guide editor (markdown)
- [ ] View trip details
  - Overview tab
  - Packages tab
  - Bookings tab
  - Itinerary tab
  - Updates tab
  - Essentials tab (checklist, contacts, FAQs)
- [ ] Edit trip
  - All fields editable
  - Image upload (Cloudinary)
  - Operator notes
- [ ] Duplicate trip
- [ ] Delete trip (with confirmation)
- [ ] Export trip roster (CSV)
- [ ] Publish/unpublish trip

### 4. **Package Management**
- [ ] List packages per trip
- [ ] Create package
  - Pricing (multi-currency)
  - Capacity management
  - Visibility settings
- [ ] Add flights to package
  - Outbound, connecting, return
  - Flight details (carrier, number, PNR)
  - Date/time pickers
- [ ] Add hotels to package
  - Hotel details
  - Room types
  - Confirmation numbers
  - Date ranges
- [ ] Edit package
- [ ] Delete package
- [ ] View package bookings
- [ ] Export flight manifest
- [ ] Export hotel rooming list

### 5. **Booking Management**
- [ ] List all bookings
  - Filters: status, trip, package, dates
  - Search by pilgrim name, ticket number
  - Status badges (EOI, BOOKED, CONFIRMED, CANCELLED)
- [ ] View booking details
  - Pilgrim information
  - Package details
  - Payment status
  - Room assignment
  - Visa status
- [ ] Create booking
  - Select pilgrim
  - Select package
  - Set status
  - Assign ticket number
- [ ] Edit booking
  - Update status
  - Change room assignment
  - Modify ticket number
- [ ] Bulk actions
  - Convert EOI to BOOKED
  - Cancel bookings
  - Assign rooms
  - Export CSV

### 6. **Pilgrim Management**
- [ ] List all pilgrims
  - Filters: nationality, booking status
  - Search by name, phone, passport
- [ ] View pilgrim profile
  - Personal information
  - Contact details
  - Emergency contacts
  - Document status
- [ ] Create pilgrim
  - Personal details form
  - Profile picture upload
  - Emergency contact
- [ ] Edit pilgrim
  - Update all fields
  - Medical conditions
- [ ] View pilgrim bookings
- [ ] View pilgrim documents
- [ ] Export pilgrims CSV

### 7. **Passport Management**
- [ ] List all passports
  - Filters: expiry date, country
  - Search by number (if permitted)
  - Expiry warnings
- [ ] View passport details
  - Encrypted number display (masked)
  - Expiry date
  - Scanned copy
- [ ] Create/upload passport
  - Passport details form
  - Document upload (Cloudinary)
- [ ] Edit passport
- [ ] Delete passport
- [ ] Export passports CSV

### 8. **Visa Management**
- [ ] List all visas
  - Filters: status, trip, submission date
  - Search by pilgrim
  - Status badges
- [ ] View visa details
  - Application status
  - Submission date
  - Approval date
  - Visa copy
- [ ] Create visa application
  - Link to pilgrim & trip
  - Initial status
- [ ] Bulk actions
  - Mark as submitted
  - Approve visas
  - Reject visas
  - Export visa status CSV
- [ ] Upload visa documents

### 9. **Content Management (Duas)**
- [ ] List all duas
  - Filters: category
  - Search by text
- [ ] View dua details
  - Arabic text
  - English translation
  - Transliteration
  - Source reference
- [ ] Create dua
  - Multi-language form
  - Category selection
  - Source input
- [ ] Edit dua
- [ ] Delete dua
- [ ] Reorder duas

### 10. **Itinerary Builder**
- [ ] Drag-and-drop interface
- [ ] Add itinerary items
  - Day index
  - Title & location
  - Time range
  - Description
- [ ] Edit items inline
- [ ] Delete items
- [ ] Reorder items
- [ ] Preview itinerary

### 11. **Travel Guide Editor**
- [ ] Markdown editor with preview
- [ ] Section management
  - Add/remove sections
  - Reorder sections
  - Collapsible sections
- [ ] Rich text formatting
- [ ] Image embedding
- [ ] Template library

### 12. **Essentials Management**
- [ ] Checklist items
  - Add/edit/delete
  - Category assignment
  - Required flag
- [ ] Emergency contacts
  - Add/edit/delete
  - Contact details
  - Availability hours
- [ ] FAQs
  - Add/edit/delete
  - Reorder
  - Category grouping

### 13. **Trip Updates/Notifications**
- [ ] Create trip update
  - Title & body (markdown)
  - Urgency level
  - Pin to top
  - Schedule publish
- [ ] Edit update
- [ ] Delete update
- [ ] View update history

### 14. **File/Image Management**
- [ ] Cloudinary integration
  - Upload images
  - Browse media library
  - Delete files
  - Generate signed URLs
- [ ] Image optimization
- [ ] Drag-and-drop upload
- [ ] Progress indicators

### 15. **Search & Filters**
- [ ] Global search
  - Search across all entities
  - Quick results dropdown
  - Recent searches
- [ ] Advanced filters
  - Date range pickers
  - Multi-select dropdowns
  - Status checkboxes
- [ ] Saved filter presets

### 16. **Reports & Analytics**
- [ ] Trip analytics
  - Booking conversion rates
  - Revenue by package
  - Capacity utilization
- [ ] Pilgrim demographics
  - Age distribution
  - Nationality breakdown
- [ ] Visa processing stats
- [ ] Export reports (PDF, CSV)

### 17. **Settings & Configuration**
- [ ] User profile
  - View/edit own profile
  - Change password
  - Update contact info
- [ ] System settings
  - Default currency
  - Date/time formats
  - Notification preferences
- [ ] API configuration
  - Backend URL
  - Cloudinary settings

### 18. **Staff Management (ADMIN only)**
- [ ] List staff users
- [ ] Create staff account
- [ ] Edit staff details
- [ ] Deactivate staff
- [ ] Role assignment

### 19. **Audit Log (ADMIN only)**
- [ ] View change history
  - Filter by model, user, date
  - Search in changes
- [ ] View historical records
  - Compare versions
  - Restore previous version

### 20. **Data Import/Export**
- [ ] CSV import
  - Pilgrims
  - Bookings
  - Validation & preview
- [ ] Bulk CSV exports
  - All entities
  - Custom field selection
- [ ] Data templates

---

## 🏗️ Implementation Plan

### **Phase 1: Foundation & Authentication** (Week 1)
**Priority:** Critical

#### 1.1 Project Setup
- [ ] Install and configure dependencies
  ```bash
  # Core dependencies
  npm install axios @tanstack/react-query zustand
  npm install react-hook-form @hookform/resolvers zod
  npm install date-fns class-variance-authority clsx tailwind-merge
  npm install lucide-react
  
  # shadcn/ui initialization
  npx shadcn@latest init
  
  # Install initial components
  npx shadcn@latest add button card input label form
  npx shadcn@latest add table dialog alert dropdown-menu
  npx shadcn@latest add select badge avatar separator
  npx shadcn@latest add tabs sheet toast sonner
  ```

- [ ] Configure TypeScript paths
- [ ] Set up ESLint + Prettier
- [ ] Configure TailwindCSS theme
  - Brand colors (from Alhilal)
  - Typography scale
  - Spacing system

#### 1.2 API Client Setup
**Files to create:**
- `lib/api/client.ts` - Axios instance with interceptors
- `lib/api/auth.ts` - Authentication endpoints
- `lib/api/types.ts` - TypeScript types from Django models
- `lib/api/endpoints/` - Organized API calls

**Features:**
- Axios interceptors for JWT
- Auto token refresh logic
- Error handling middleware
- Request/response logging (dev)

#### 1.3 State Management
**Files to create:**
- `store/auth.ts` - Zustand auth store
- `store/ui.ts` - UI state (sidebar, theme)
- `hooks/useAuth.ts` - Auth hook
- `hooks/useApi.ts` - API hook wrapper

#### 1.4 Authentication Flow
**Pages to create:**
- `/login` - Staff login page
- `/auth/callback` - Token handling
- `/logout` - Logout confirmation

**Components:**
- `LoginForm` - Phone + password form
- `ProtectedRoute` - Route guard wrapper

**Features:**
- JWT storage (httpOnly cookies preferred)
- Refresh token rotation
- Session timeout warning
- Remember me functionality

#### 1.5 Layout Foundation
**Components:**
- `AppShell` - Main layout wrapper
- `Sidebar` - Navigation sidebar
- `Header` - Top bar with user menu
- `Breadcrumbs` - Page navigation
- `PageHeader` - Reusable page header

---

### **Phase 2: Dashboard & Core Navigation** (Week 2)
**Priority:** High

#### 2.1 Dashboard Home
**Page:** `/dashboard`

**Components:**
- `StatsCard` - Metric display cards
- `RecentActivity` - Activity feed
- `UpcomingTrips` - Trip widget
- `QuickActions` - Action buttons

**API Integration:**
- GET `/api/v1/dashboard/stats/`
- GET `/api/v1/dashboard/activity/`
- GET `/api/v1/trips/?upcoming=true`

#### 2.2 Navigation Structure
```
/dashboard - Home
/trips - Trip management
  /trips/new - Create trip
  /trips/[id] - Trip details
  /trips/[id]/edit - Edit trip
/bookings - Booking management
  /bookings/[id] - Booking details
/pilgrims - Pilgrim management
  /pilgrims/[id] - Pilgrim profile
  /pilgrims/new - Create pilgrim
/documents - Passport & Visa management
  /documents/passports
  /documents/visas
/content - Content management
  /content/duas
/reports - Reports & analytics
/settings - Settings
/staff - Staff management (ADMIN)
/audit - Audit log (ADMIN)
```

#### 2.3 Reusable Components
- `DataTable` - Sortable, filterable table
- `SearchBar` - Global search component
- `DateRangePicker` - Date filter
- `StatusBadge` - Colored status badges
- `ActionMenu` - Dropdown action menu
- `ConfirmDialog` - Confirmation modal
- `EmptyState` - No data placeholder
- `LoadingState` - Loading skeletons

---

### **Phase 3: Trip Management** (Week 3-4)
**Priority:** High

#### 3.1 Trip List View
**Page:** `/trips`

**Components:**
- `TripTable` - Main trip listing
- `TripFilters` - Filter sidebar
- `TripCard` - Card view option

**Features:**
- Pagination (server-side)
- Sorting (name, date, status)
- Filters (visibility, dates, cities)
- Search (name, code)
- View toggle (table/cards)
- Export to CSV

**API:**
- GET `/api/v1/trips/`
- DELETE `/api/v1/trips/{id}/`

#### 3.2 Create Trip
**Page:** `/trips/new`

**Form Sections:**
1. Basic Information
   - Name, code, cities
   - Start/end dates
   - Cover image upload
   - Visibility
   
2. Packages (dynamic form)
   - Add/remove packages
   - Pricing & capacity
   - Visibility per package

3. Operator Notes
   - Private notes
   - Tags

**Components:**
- `TripForm` - Main form wrapper
- `PackageFormArray` - Dynamic package inputs
- `ImageUpload` - Cloudinary uploader

**Validation:**
- Zod schema matching Django model
- Client-side validation
- Server error display

**API:**
- POST `/api/v1/trips/`
- POST `/cloudinary/upload/` (via helper)

#### 3.3 Trip Details View
**Page:** `/trips/[id]`

**Tabs:**
1. **Overview**
   - Trip summary
   - Image gallery
   - Quick stats
   - Action buttons

2. **Packages**
   - Package cards
   - Capacity indicators
   - Price display
   - Add package button

3. **Bookings**
   - Bookings table
   - Status distribution chart
   - Filter by status
   - Bulk actions

4. **Itinerary**
   - Day-by-day view
   - Timeline visualization
   - Add/edit items
   - Drag-to-reorder

5. **Travel Guide**
   - Section tabs
   - Markdown preview
   - Edit button

6. **Essentials**
   - Checklist items
   - Emergency contacts
   - FAQs
   - Manage buttons

7. **Updates**
   - Update feed
   - Create update button
   - Pin/unpin

**Components:**
- `TripTabs` - Tab navigation
- `PackageCard` - Package display
- `ItineraryTimeline` - Visual itinerary
- `MarkdownPreview` - Rendered markdown

**API:**
- GET `/api/v1/trips/{id}/`
- GET `/api/v1/trips/{id}/packages/`
- GET `/api/v1/trips/{id}/bookings/`
- GET `/api/v1/trips/{id}/itinerary/`

#### 3.4 Edit Trip
**Page:** `/trips/[id]/edit`

**Features:**
- Pre-populated form
- Optimistic updates
- Auto-save drafts (optional)
- Discard changes confirmation

**API:**
- PATCH `/api/v1/trips/{id}/`
- PUT `/api/v1/trips/{id}/` (full update)

#### 3.5 Package Management
**Pages:**
- `/trips/[tripId]/packages/new`
- `/trips/[tripId]/packages/[id]/edit`

**Features:**
- Flight form array
  - Outbound/connecting/return
  - Carrier, flight number
  - Airports, times
  - PNR
- Hotel form array
  - Hotel details
  - Room types
  - Check-in/out dates
  - Confirmation numbers

**Components:**
- `FlightForm` - Single flight input
- `HotelForm` - Single hotel input
- `FormArray` - Dynamic add/remove

**API:**
- POST `/api/v1/packages/`
- PATCH `/api/v1/packages/{id}/`
- POST `/api/v1/packages/{id}/flights/`
- POST `/api/v1/packages/{id}/hotels/`

#### 3.6 Itinerary Builder
**Component:** `ItineraryBuilder`

**Features:**
- Drag-and-drop reordering (dnd-kit)
- Inline editing
- Day grouping
- Time picker
- Rich text description

**Libraries:**
- `@dnd-kit/core` - Drag and drop
- `@dnd-kit/sortable` - Sortable lists

**API:**
- POST `/api/v1/trips/{id}/itinerary/`
- PATCH `/api/v1/itinerary/{id}/`
- DELETE `/api/v1/itinerary/{id}/`
- POST `/api/v1/itinerary/reorder/`

#### 3.7 Travel Guide Editor
**Component:** `TravelGuideEditor`

**Features:**
- Markdown editor with preview
- Live preview toggle
- Section management
- Syntax highlighting
- Image insertion

**Libraries:**
- `react-markdown` - Render markdown
- `react-simplemde-editor` - Markdown editor
- Or `@uiw/react-md-editor`

**API:**
- POST `/api/v1/trips/{id}/guide/`
- PATCH `/api/v1/guide/{id}/`

---

### **Phase 4: Booking & Pilgrim Management** (Week 5-6)
**Priority:** High

#### 4.1 Booking List
**Page:** `/bookings`

**Features:**
- Advanced filters
  - Status multi-select
  - Trip dropdown
  - Package dropdown
  - Date range
- Bulk selection
- Bulk actions dropdown
- Export CSV

**Components:**
- `BookingTable`
- `BookingFilters`
- `BulkActionBar`

**API:**
- GET `/api/v1/bookings/`
- POST `/api/v1/bookings/bulk-action/`

#### 4.2 Booking Details
**Page:** `/bookings/[id]`

**Sections:**
- Booking summary
- Pilgrim info (linked)
- Package details
- Payment status
- Room assignment
- Visa status (linked)
- Activity log

**Actions:**
- Edit booking
- Cancel booking
- Assign room
- Update status
- Generate invoice

**API:**
- GET `/api/v1/bookings/{id}/`
- PATCH `/api/v1/bookings/{id}/`

#### 4.3 Create Booking
**Page:** `/bookings/new`

**Form:**
1. Select pilgrim (searchable dropdown)
2. Select trip (dropdown)
3. Select package (based on trip)
4. Set status
5. Ticket number (auto-generate option)
6. Room assignment (optional)
7. Notes

**Components:**
- `PilgrimSearch` - Autocomplete pilgrim
- `PackageSelector` - Show available packages

**API:**
- POST `/api/v1/bookings/`
- GET `/api/v1/pilgrims/?search=`
- GET `/api/v1/trips/{id}/packages/`

#### 4.4 Bulk Actions
**Dialog:** `BulkActionDialog`

**Actions:**
- Convert EOI → BOOKED
- Cancel bookings
- Assign rooms (batch)
- Export CSV

**Flow:**
1. Select bookings
2. Choose action
3. Confirm with preview
4. Execute
5. Show results toast

**API:**
- POST `/api/v1/bookings/convert-eoi/`
- POST `/api/v1/bookings/cancel/`
- POST `/api/v1/bookings/assign-rooms/`

#### 4.5 Pilgrim List
**Page:** `/pilgrims`

**Features:**
- Search (name, phone, passport)
- Filter by nationality
- Filter by booking status
- Sort options
- Card/table view toggle

**Components:**
- `PilgrimTable`
- `PilgrimCard`
- `NationalityFilter`

**API:**
- GET `/api/v1/pilgrims/`

#### 4.6 Pilgrim Profile
**Page:** `/pilgrims/[id]`

**Tabs:**
1. **Overview**
   - Personal info
   - Profile picture
   - Emergency contact
   
2. **Bookings**
   - All bookings
   - Status timeline
   
3. **Documents**
   - Passport
   - Visas
   - Other documents
   
4. **Activity**
   - Change history
   - Notes

**Actions:**
- Edit profile
- Add booking
- Upload document
- Add note

**API:**
- GET `/api/v1/pilgrims/{id}/`
- GET `/api/v1/pilgrims/{id}/bookings/`
- GET `/api/v1/pilgrims/{id}/documents/`

#### 4.7 Create/Edit Pilgrim
**Pages:**
- `/pilgrims/new`
- `/pilgrims/[id]/edit`

**Form Sections:**
1. Personal Information
   - Name, DOB
   - Nationality
   - Profile picture
   
2. Contact Details
   - Phone, email
   - Address
   
3. Emergency Contact
   - Name, relationship
   - Phone
   
4. Medical Information
   - Conditions
   - Medications
   - Notes

**Components:**
- `PilgrimForm`
- `ProfilePictureUpload`
- `DatePicker`

**API:**
- POST `/api/v1/pilgrims/`
- PATCH `/api/v1/pilgrims/{id}/`

---

### **Phase 5: Document Management** (Week 7)
**Priority:** Medium

#### 5.1 Passport Management
**Page:** `/documents/passports`

**Features:**
- List all passports
- Expiry warnings (red/yellow)
- Filter by country
- Search by pilgrim
- Upload passport scan

**Components:**
- `PassportTable`
- `ExpiryBadge`
- `DocumentUpload`

**Security:**
- Mask passport numbers
- Only show last 4 digits
- Full number on hover (admin only)

**API:**
- GET `/api/v1/passports/`
- POST `/api/v1/passports/`
- GET `/api/v1/passports/export-csv/`

#### 5.2 Visa Management
**Page:** `/documents/visas`

**Features:**
- List all visas
- Filter by status, trip
- Bulk status update
- Upload visa copies
- Export status CSV

**Components:**
- `VisaTable`
- `VisaStatusBadge`
- `BulkVisaActions`

**Bulk Actions:**
- Mark as submitted
- Approve visas
- Reject visas

**API:**
- GET `/api/v1/visas/`
- POST `/api/v1/visas/bulk-submit/`
- POST `/api/v1/visas/bulk-approve/`
- POST `/api/v1/visas/bulk-reject/`

---

### **Phase 6: Content & Reports** (Week 8)
**Priority:** Low-Medium

#### 6.1 Dua Management
**Page:** `/content/duas`

**Features:**
- List duas by category
- Create/edit dua
- Reorder duas
- Preview rendering

**Form Fields:**
- Category dropdown
- Arabic text (RTL input)
- English translation
- Transliteration
- Source reference

**Components:**
- `DuaCard`
- `DuaForm`
- `CategoryTabs`

**API:**
- GET `/api/v1/duas/`
- POST `/api/v1/duas/`
- PATCH `/api/v1/duas/{id}/`
- DELETE `/api/v1/duas/{id}/`

#### 6.2 Reports Dashboard
**Page:** `/reports`

**Reports:**
1. **Trip Analytics**
   - Booking trends (chart)
   - Revenue by package (chart)
   - Capacity utilization (gauge)
   
2. **Pilgrim Demographics**
   - Age distribution (histogram)
   - Nationality breakdown (pie)
   
3. **Visa Statistics**
   - Approval rate
   - Processing time
   - Status distribution

**Libraries:**
- `recharts` - Charts library
- `react-to-pdf` - PDF export

**Components:**
- `ChartCard`
- `StatCard`
- `ReportFilters`

**API:**
- GET `/api/v1/reports/trips/`
- GET `/api/v1/reports/pilgrims/`
- GET `/api/v1/reports/visas/`

---

### **Phase 7: Admin Features** (Week 9)
**Priority:** Low (ADMIN only)

#### 7.1 Staff Management
**Page:** `/staff`

**Features:**
- List staff users
- Create staff account
- Edit staff details
- Role assignment
- Deactivate/activate

**Components:**
- `StaffTable`
- `StaffForm`
- `RoleSelector`

**API:**
- GET `/api/v1/staff/`
- POST `/api/v1/staff/`
- PATCH `/api/v1/staff/{id}/`

#### 7.2 Audit Log
**Page:** `/audit`

**Features:**
- View change history
- Filter by model, user, date
- Search in changes
- View diff viewer

**Components:**
- `AuditTable`
- `DiffViewer`
- `HistoryTimeline`

**API:**
- GET `/api/v1/history/`
- GET `/api/v1/history/{model}/{id}/`

---

### **Phase 8: Polish & Optimization** (Week 10)
**Priority:** Medium

#### 8.1 Performance Optimization
- [ ] Implement React Query caching
- [ ] Add loading skeletons
- [ ] Lazy load components
- [ ] Image optimization (next/image)
- [ ] Bundle analysis
- [ ] Code splitting

#### 8.2 Error Handling
- [ ] Global error boundary
- [ ] API error toasts
- [ ] 404 page
- [ ] 500 page
- [ ] Network error handling
- [ ] Retry logic

#### 8.3 Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus management
- [ ] Screen reader testing
- [ ] Color contrast (WCAG AA)

#### 8.4 Testing
- [ ] Unit tests (Vitest)
- [ ] Component tests (Testing Library)
- [ ] E2E tests (Playwright)
- [ ] API integration tests

#### 8.5 Documentation
- [ ] Component storybook
- [ ] API integration guide
- [ ] Deployment guide
- [ ] User manual

---

## 📁 Recommended File Structure

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── pilgrims/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── documents/
│   │   │   ├── passports/
│   │   │   │   └── page.tsx
│   │   │   └── visas/
│   │   │       └── page.tsx
│   │   ├── content/
│   │   │   └── duas/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── staff/
│   │   │   └── page.tsx
│   │   ├── audit/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumbs.tsx
│   ├── trips/
│   │   ├── trip-table.tsx
│   │   ├── trip-form.tsx
│   │   ├── trip-card.tsx
│   │   ├── package-form.tsx
│   │   ├── itinerary-builder.tsx
│   │   └── travel-guide-editor.tsx
│   ├── bookings/
│   │   ├── booking-table.tsx
│   │   ├── booking-form.tsx
│   │   ├── bulk-action-bar.tsx
│   │   └── booking-details.tsx
│   ├── pilgrims/
│   │   ├── pilgrim-table.tsx
│   │   ├── pilgrim-form.tsx
│   │   ├── pilgrim-card.tsx
│   │   └── profile-picture-upload.tsx
│   ├── documents/
│   │   ├── passport-table.tsx
│   │   ├── visa-table.tsx
│   │   └── document-upload.tsx
│   ├── shared/
│   │   ├── data-table.tsx
│   │   ├── search-bar.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── status-badge.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-state.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── auth-provider.tsx
│       └── theme-provider.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── types.ts
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── trips.ts
│   │   │   ├── bookings.ts
│   │   │   ├── pilgrims.ts
│   │   │   ├── documents.ts
│   │   │   └── content.ts
│   │   └── hooks/
│   │       ├── use-trips.ts
│   │       ├── use-bookings.ts
│   │       └── use-pilgrims.ts
│   ├── cloudinary/
│   │   ├── upload.ts
│   │   └── utils.ts
│   ├── validations/
│   │   ├── trip-schema.ts
│   │   ├── booking-schema.ts
│   │   └── pilgrim-schema.ts
│   └── utils.ts
├── store/
│   ├── auth.ts
│   ├── ui.ts
│   └── filters.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-api.ts
│   ├── use-debounce.ts
│   └── use-pagination.ts
├── types/
│   ├── api.ts
│   ├── models.ts
│   └── forms.ts
├── config/
│   ├── site.ts
│   ├── api.ts
│   └── routes.ts
└── styles/
    └── globals.css
```

---

## 🎨 Design Guidelines

### Color Palette
```typescript
// Based on Islamic/Hajj theme
const colors = {
  primary: {
    50: '#f0fdf4',
    // ... green shades (Islamic color)
    500: '#22c55e',
    900: '#14532d',
  },
  secondary: {
    // ... gold shades (Kaaba theme)
    500: '#f59e0b',
  },
  status: {
    pending: '#f59e0b',    // Amber
    booked: '#3b82f6',     // Blue
    confirmed: '#22c55e',  // Green
    cancelled: '#ef4444',  // Red
  }
}
```

### Typography
- Headings: Inter or system font
- Body: Inter or system font
- Arabic text: Arabic-specific font

### Component Patterns
- Consistent spacing (4px grid)
- Rounded corners (md: 8px)
- Shadow elevation (subtle)
- Smooth animations (200ms ease)

---

## 🔧 Configuration Files

### API Client Example
```typescript
// lib/api/client.ts
import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 and retry with refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## 📊 Success Metrics

- [ ] All 20 functionalities implemented
- [ ] 95%+ test coverage
- [ ] Lighthouse score > 90
- [ ] Load time < 2s
- [ ] Zero critical accessibility issues
- [ ] Mobile responsive
- [ ] Cross-browser compatible

---

## 🚀 Next Steps

1. **Review this plan** with stakeholders
2. **Adjust priorities** based on business needs
3. **Set up development environment**
4. **Start Phase 1** (Foundation)
5. **Weekly check-ins** to track progress

---

## 📚 Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Zod Validation](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Total Estimated Timeline:** 10 weeks
**Team Size:** 1-2 frontend developers
**Complexity:** Medium-High

