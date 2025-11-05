// Use internal Docker network for server-side requests, external URL for client-side
export const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.API_URL_INTERNAL || "http://backend:8000/api/v1/")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1/")

/**
 * All API endpoints grouped by feature.
 */
export const API_ENDPOINTS = {
  /** Authentication (Staff Only) */
  AUTH: {
    /** POST /auth/staff/login – Authenticate staff and receive JWT tokens. */
    LOGIN: API_BASE_URL + "auth/staff/login/",
    /** POST /auth/staff/refresh – Refresh access token using refresh token. */
    REFRESH: API_BASE_URL + "auth/staff/refresh",
    /** POST /auth/staff/logout – Logout and invalidate refresh token. */
    LOGOUT: API_BASE_URL + "auth/staff/logout",
    /** GET /auth/staff/profile – Get authenticated staff profile. */
    PROFILE: API_BASE_URL + "auth/staff/profile",
    /** PATCH /auth/staff/profile – Update authenticated staff profile. */
    UPDATE_PROFILE: API_BASE_URL + "auth/staff/profile",
    /** POST /auth/staff/change-password – Change staff password. */
    CHANGE_PASSWORD: API_BASE_URL + "auth/staff/change-password",
  },

  /** Trips Management */
  TRIPS: {
    /** GET /trips – List all trips with filtering and pagination. */
    LIST: API_BASE_URL + "trips",
    /** GET /trips/:id – Get trip details. */
    GET: (id: string) => API_BASE_URL + `trips/${id}`,
    /** POST /trips – Create a new trip. */
    CREATE: API_BASE_URL + "trips",
    /** PATCH /trips/:id – Update trip details. */
    UPDATE: (id: string) => API_BASE_URL + `trips/${id}`,
    /** DELETE /trips/:id – Delete a trip. */
    DELETE: (id: string) => API_BASE_URL + `trips/${id}`,
    /** GET /trips/:id/packages – Get packages for a trip. */
    PACKAGES: (id: string) => API_BASE_URL + `trips/${id}/packages`,
    /** GET /trips/:id/bookings – Get bookings for a trip. */
    BOOKINGS: (id: string) => API_BASE_URL + `trips/${id}/bookings`,
    /** GET /trips/:id/itinerary – Get itinerary for a trip. */
    ITINERARY: (id: string) => API_BASE_URL + `trips/${id}/itinerary`,
    /** POST /trips/:id/duplicate – Duplicate a trip. */
    DUPLICATE: (id: string) => API_BASE_URL + `trips/${id}/duplicate`,
    /** GET /trips/:id/roster – Export trip roster. */
    EXPORT_ROSTER: (id: string) => API_BASE_URL + `trips/${id}/roster`,
  },

  /** Trip Packages */
  PACKAGES: {
    /** GET /packages – List all packages. */
    LIST: API_BASE_URL + "packages",
    /** GET /packages/:id – Get package details. */
    GET: (id: string) => API_BASE_URL + `packages/${id}`,
    /** POST /packages – Create a package. */
    CREATE: API_BASE_URL + "packages",
    /** PATCH /packages/:id – Update package. */
    UPDATE: (id: string) => API_BASE_URL + `packages/${id}`,
    /** DELETE /packages/:id – Delete package. */
    DELETE: (id: string) => API_BASE_URL + `packages/${id}`,
    /** GET /packages/:id/flights – Get flights for package. */
    FLIGHTS: (id: string) => API_BASE_URL + `packages/${id}/flights`,
    /** GET /packages/:id/hotels – Get hotels for package. */
    HOTELS: (id: string) => API_BASE_URL + `packages/${id}/hotels`,
    /** GET /packages/:id/flight-manifest – Export flight manifest. */
    EXPORT_FLIGHT_MANIFEST: (id: string) => API_BASE_URL + `packages/${id}/flight-manifest`,
    /** GET /packages/:id/hotel-rooming – Export hotel rooming list. */
    EXPORT_HOTEL_ROOMING: (id: string) => API_BASE_URL + `packages/${id}/hotel-rooming`,
  },

  /** Flights */
  FLIGHTS: {
    /** POST /flights – Add flight to package. */
    CREATE: API_BASE_URL + "flights",
    /** PATCH /flights/:id – Update flight. */
    UPDATE: (id: string) => API_BASE_URL + `flights/${id}`,
    /** DELETE /flights/:id – Remove flight. */
    DELETE: (id: string) => API_BASE_URL + `flights/${id}`,
  },

  /** Hotels */
  HOTELS: {
    /** POST /hotels – Add hotel to package. */
    CREATE: API_BASE_URL + "hotels",
    /** PATCH /hotels/:id – Update hotel. */
    UPDATE: (id: string) => API_BASE_URL + `hotels/${id}`,
    /** DELETE /hotels/:id – Remove hotel. */
    DELETE: (id: string) => API_BASE_URL + `hotels/${id}`,
  },

  /** Itinerary */
  ITINERARY: {
    /** POST /itinerary – Add itinerary item. */
    CREATE: API_BASE_URL + "itinerary",
    /** PATCH /itinerary/:id – Update itinerary item. */
    UPDATE: (id: string) => API_BASE_URL + `itinerary/${id}`,
    /** DELETE /itinerary/:id – Delete itinerary item. */
    DELETE: (id: string) => API_BASE_URL + `itinerary/${id}`,
    /** POST /itinerary/reorder – Reorder itinerary items. */
    REORDER: API_BASE_URL + "itinerary/reorder",
  },

  /** Travel Guide */
  GUIDE: {
    /** POST /trips/:tripId/guide – Add guide section. */
    CREATE: (tripId: string) => API_BASE_URL + `trips/${tripId}/guide`,
    /** PATCH /guide/:id – Update guide section. */
    UPDATE: (id: string) => API_BASE_URL + `guide/${id}`,
    /** DELETE /guide/:id – Delete guide section. */
    DELETE: (id: string) => API_BASE_URL + `guide/${id}`,
    /** POST /guide/reorder – Reorder guide sections. */
    REORDER: API_BASE_URL + "guide/reorder",
  },

  /** Trip Essentials */
  ESSENTIALS: {
    /** Checklist Items */
    CHECKLIST: {
      CREATE: (tripId: string) => API_BASE_URL + `trips/${tripId}/checklist`,
      UPDATE: (id: string) => API_BASE_URL + `checklist/${id}`,
      DELETE: (id: string) => API_BASE_URL + `checklist/${id}`,
    },
    /** Emergency Contacts */
    CONTACTS: {
      CREATE: (tripId: string) => API_BASE_URL + `trips/${tripId}/contacts`,
      UPDATE: (id: string) => API_BASE_URL + `contacts/${id}`,
      DELETE: (id: string) => API_BASE_URL + `contacts/${id}`,
    },
    /** FAQs */
    FAQS: {
      CREATE: (tripId: string) => API_BASE_URL + `trips/${tripId}/faqs`,
      UPDATE: (id: string) => API_BASE_URL + `faqs/${id}`,
      DELETE: (id: string) => API_BASE_URL + `faqs/${id}`,
      REORDER: API_BASE_URL + "faqs/reorder",
    },
  },

  /** Trip Updates/Notifications */
  UPDATES: {
    /** POST /trips/:tripId/updates – Create trip update. */
    CREATE: (tripId: string) => API_BASE_URL + `trips/${tripId}/updates`,
    /** PATCH /updates/:id – Update trip update. */
    UPDATE: (id: string) => API_BASE_URL + `updates/${id}`,
    /** DELETE /updates/:id – Delete trip update. */
    DELETE: (id: string) => API_BASE_URL + `updates/${id}`,
    /** PATCH /updates/:id/pin – Toggle pin status. */
    TOGGLE_PIN: (id: string) => API_BASE_URL + `updates/${id}/pin`,
  },

  /** Bookings Management */
  BOOKINGS: {
    /** GET /bookings – List all bookings with filtering. */
    LIST: API_BASE_URL + "bookings",
    /** GET /bookings/:id – Get booking details. */
    GET: (id: string) => API_BASE_URL + `bookings/${id}`,
    /** POST /bookings – Create booking. */
    CREATE: API_BASE_URL + "bookings",
    /** PATCH /bookings/:id – Update booking. */
    UPDATE: (id: string) => API_BASE_URL + `bookings/${id}`,
    /** DELETE /bookings/:id – Cancel booking. */
    DELETE: (id: string) => API_BASE_URL + `bookings/${id}`,
    /** POST /bookings/bulk/convert-eoi – Convert EOI to BOOKED. */
    BULK_CONVERT_EOI: API_BASE_URL + "bookings/bulk/convert-eoi",
    /** POST /bookings/bulk/cancel – Bulk cancel bookings. */
    BULK_CANCEL: API_BASE_URL + "bookings/bulk/cancel",
    /** POST /bookings/bulk/assign-rooms – Bulk assign rooms. */
    BULK_ASSIGN_ROOMS: API_BASE_URL + "bookings/bulk/assign-rooms",
    /** GET /bookings/export – Export bookings to CSV. */
    EXPORT_CSV: API_BASE_URL + "bookings/export",
  },

  /** Pilgrims Management */
  PILGRIMS: {
    /** GET /pilgrims – List all pilgrims. */
    LIST: API_BASE_URL + "pilgrims",
    /** GET /pilgrims/:id – Get pilgrim profile. */
    GET: (id: string) => API_BASE_URL + `pilgrims/${id}`,
    /** POST /pilgrims – Create pilgrim. */
    CREATE: API_BASE_URL + "pilgrims",
    /** PATCH /pilgrims/:id – Update pilgrim profile. */
    UPDATE: (id: string) => API_BASE_URL + `pilgrims/${id}`,
    /** DELETE /pilgrims/:id – Delete pilgrim. */
    DELETE: (id: string) => API_BASE_URL + `pilgrims/${id}`,
    /** GET /pilgrims/:id/bookings – Get pilgrim bookings. */
    BOOKINGS: (id: string) => API_BASE_URL + `pilgrims/${id}/bookings`,
    /** GET /pilgrims/:id/documents – Get pilgrim documents. */
    DOCUMENTS: (id: string) => API_BASE_URL + `pilgrims/${id}/documents`,
    /** GET /pilgrims/export – Export pilgrims to CSV. */
    EXPORT_CSV: API_BASE_URL + "pilgrims/export",
    /** GET /pilgrims/import/template/ – Download import template. */
    IMPORT_TEMPLATE: API_BASE_URL + "pilgrims/import/template/",
    /** POST /pilgrims/import/validate/ – Validate import file and check for duplicates. */
    IMPORT_VALIDATE: API_BASE_URL + "pilgrims/import/validate/",
    /** POST /pilgrims/import/ – Import pilgrims from Excel. */
    IMPORT: API_BASE_URL + "pilgrims/import/",
    /** POST /pilgrims/import – Import pilgrims from CSV (legacy). */
    IMPORT_CSV: API_BASE_URL + "pilgrims/import",
  },

  /** Passports Management */
  PASSPORTS: {
    /** GET /passports – List all passports. */
    LIST: API_BASE_URL + "passports",
    /** GET /passports/:id – Get passport details. */
    GET: (id: string) => API_BASE_URL + `passports/${id}`,
    /** POST /passports – Create passport. */
    CREATE: API_BASE_URL + "passports",
    /** PATCH /passports/:id – Update passport. */
    UPDATE: (id: string) => API_BASE_URL + `passports/${id}`,
    /** DELETE /passports/:id – Delete passport. */
    DELETE: (id: string) => API_BASE_URL + `passports/${id}`,
    /** GET /passports/export – Export passports to CSV. */
    EXPORT_CSV: API_BASE_URL + "passports/export",
  },

  /** Visas Management */
  VISAS: {
    /** GET /visas – List all visas. */
    LIST: API_BASE_URL + "visas",
    /** GET /visas/:id – Get visa details. */
    GET: (id: string) => API_BASE_URL + `visas/${id}`,
    /** POST /visas – Create visa application. */
    CREATE: API_BASE_URL + "visas",
    /** PATCH /visas/:id – Update visa. */
    UPDATE: (id: string) => API_BASE_URL + `visas/${id}`,
    /** DELETE /visas/:id – Delete visa. */
    DELETE: (id: string) => API_BASE_URL + `visas/${id}`,
    /** POST /visas/bulk/submit – Mark visas as submitted. */
    BULK_SUBMIT: API_BASE_URL + "visas/bulk/submit",
    /** POST /visas/bulk/approve – Approve visas. */
    BULK_APPROVE: API_BASE_URL + "visas/bulk/approve",
    /** POST /visas/bulk/reject – Reject visas. */
    BULK_REJECT: API_BASE_URL + "visas/bulk/reject",
    /** GET /visas/export – Export visa status to CSV. */
    EXPORT_CSV: API_BASE_URL + "visas/export",
  },

  /** Content Management (Duas) */
  DUAS: {
    /** GET /duas – List all duas. */
    LIST: API_BASE_URL + "duas",
    /** GET /duas/:id – Get dua details. */
    GET: (id: string) => API_BASE_URL + `duas/${id}`,
    /** POST /duas – Create dua. */
    CREATE: API_BASE_URL + "duas",
    /** PATCH /duas/:id – Update dua. */
    UPDATE: (id: string) => API_BASE_URL + `duas/${id}`,
    /** DELETE /duas/:id – Delete dua. */
    DELETE: (id: string) => API_BASE_URL + `duas/${id}`,
    /** POST /duas/reorder – Reorder duas. */
    REORDER: API_BASE_URL + "duas/reorder",
  },

  /** User Management (ADMIN only) */
  USERS: {
    /** GET /users/ – List all users. */
    LIST: API_BASE_URL + "users/",
    /** GET /users/:id/ – Get user details. */
    DETAIL: (id: string) => API_BASE_URL + `users/${id}/`,
    /** POST /users/ – Create user account. */
    CREATE: API_BASE_URL + "users/",
    /** PATCH /users/:id/ – Update user. */
    UPDATE: (id: string) => API_BASE_URL + `users/${id}/`,
    /** DELETE /users/:id/ – Delete user. */
    DELETE: (id: string) => API_BASE_URL + `users/${id}/`,
    /** POST /users/:id/change-password/ – Change user password. */
    CHANGE_PASSWORD: (id: string) => API_BASE_URL + `users/${id}/change-password/`,
  },

  /** Staff Management (ADMIN only) */
  STAFF: {
    /** GET /staff – List all staff. */
    LIST: API_BASE_URL + "staff",
    /** GET /staff/:id – Get staff details. */
    GET: (id: string) => API_BASE_URL + `staff/${id}`,
    /** POST /staff – Create staff account. */
    CREATE: API_BASE_URL + "staff",
    /** PATCH /staff/:id – Update staff. */
    UPDATE: (id: string) => API_BASE_URL + `staff/${id}`,
    /** DELETE /staff/:id – Delete staff. */
    DELETE: (id: string) => API_BASE_URL + `staff/${id}`,
  },

  /** Audit Log (ADMIN only) */
  AUDIT: {
    /** GET /history – List audit logs. */
    LIST: API_BASE_URL + "history",
    /** GET /history/:model/:id – Get entity history. */
    ENTITY_HISTORY: (model: string, id: string) => API_BASE_URL + `history/${model}/${id}`,
  },

  /** Reports & Analytics */
  REPORTS: {
    /** GET /reports/trips – Trip analytics. */
    TRIPS: API_BASE_URL + "reports/trips",
    /** GET /reports/pilgrims – Pilgrim demographics. */
    PILGRIMS: API_BASE_URL + "reports/pilgrims",
    /** GET /reports/visas – Visa statistics. */
    VISAS: API_BASE_URL + "reports/visas",
    /** GET /reports/finance – Financial reports. */
    FINANCE: API_BASE_URL + "reports/finance",
  },

  /** Dashboard */
  DASHBOARD: {
    /** GET /dashboard/stats – Dashboard statistics. */
    STATS: API_BASE_URL + "dashboard/stats/",
    /** GET /dashboard/activity – Recent activity feed. */
    ACTIVITY: API_BASE_URL + "dashboard/activity/",
    /** GET /dashboard/upcoming-trips – Upcoming trips widget. */
    UPCOMING_TRIPS: API_BASE_URL + "dashboard/upcoming-trips/",
  },

  /** Common Utilities */
  COMMON: {
    /** POST /common/upload – Upload file to Cloudinary. */
    UPLOAD: API_BASE_URL + "common/upload",
  },

  /** File Upload - Cloudinary Integration */
  UPLOAD: {
    /** POST /cloudinary/upload/single – Upload single file. */
    SINGLE: API_BASE_URL + "cloudinary/upload/single",
    /** POST /cloudinary/upload/multiple – Upload multiple files. */
    MULTIPLE: API_BASE_URL + "cloudinary/upload/multiple",
    /** POST /cloudinary/upload/images – Upload images. */
    IMAGES: API_BASE_URL + "cloudinary/upload/images",
    /** POST /cloudinary/upload/documents – Upload documents. */
    DOCUMENTS: API_BASE_URL + "cloudinary/upload/documents",
    /** DELETE /cloudinary/file/:publicId – Delete file from Cloudinary. */
    DELETE_FILE: (publicId: string) => API_BASE_URL + `cloudinary/file/${encodeURIComponent(publicId)}`,
  },
} as const

/** Standard HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/** Request retry and timeout configuration */
export const REQUEST_TIMEOUT = 30000 // 30 seconds
export const MAX_RETRIES = 3
export const RETRY_DELAY = 1000 // 1 second

/** Token lifespan settings */
export const TOKEN_EXPIRY_TIME = 60 * 60 * 1000 // 60 minutes
export const REFRESH_TOKEN_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

