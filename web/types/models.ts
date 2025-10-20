// TypeScript types matching Django models

/** User Roles */
export type UserRole = "STAFF" | "PILGRIM"
export type StaffRole = "ADMIN" | "AGENT"

/** Account/User Model */
export interface Account {
  id: string
  phone: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  isStaff: boolean
  isSuperuser: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

/** Staff Profile */
export interface StaffProfile {
  id: string
  user: string // Account ID
  role: StaffRole
  createdAt: string
  updatedAt: string
}

/** Pilgrim Profile */
export interface PilgrimProfile {
  id: string
  user: string // Account ID
  dob: string
  nationality: string
  emergencyName: string
  emergencyPhone: string
  medicalConditions?: string
  createdAt: string
  updatedAt: string
}

/** Passport */
export interface Passport {
  id: string
  pilgrim: string // PilgrimProfile ID
  number: string // Encrypted
  country: string
  expiryDate: string
  scannedCopy?: string // Cloudinary URL
  createdAt: string
  updatedAt: string
}

/** Visa Status */
export type VisaStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED"

/** Visa */
export interface Visa {
  id: string
  pilgrim: string // PilgrimProfile ID
  trip: string // Trip ID
  status: VisaStatus
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  visaCopy?: string // Cloudinary URL
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Trip Visibility */
export type TripVisibility = "PUBLIC" | "PRIVATE" | "ARCHIVED"

/** Trip */
export interface Trip {
  id: string
  code: string
  name: string
  cities: string[]
  startDate: string
  endDate: string
  coverImage?: string // Cloudinary URL
  visibility: TripVisibility
  operatorNotes?: string
  createdAt: string
  updatedAt: string
}

/** Package Visibility */
export type PackageVisibility = "PUBLIC" | "PRIVATE"

/** Trip Package */
export interface TripPackage {
  id: string
  trip: string // Trip ID
  name: string
  priceMinorUnits: number
  currency: string
  capacity: number
  visibility: PackageVisibility
  createdAt: string
  updatedAt: string
}

/** Flight Leg Type */
export type FlightLeg = "OUTBOUND" | "CONNECTING" | "RETURN"

/** Package Flight */
export interface PackageFlight {
  id: string
  package: string // TripPackage ID
  leg: FlightLeg
  carrier: string
  flightNo: string
  depAirport: string
  depDt: string
  arrAirport: string
  arrDt: string
  groupPnr?: string
  createdAt: string
  updatedAt: string
}

/** Package Hotel */
export interface PackageHotel {
  id: string
  package: string // TripPackage ID
  name: string
  address?: string
  roomType?: string
  checkIn: string
  checkOut: string
  groupConfirmationNo?: string
  createdAt: string
  updatedAt: string
}

/** Itinerary Item */
export interface ItineraryItem {
  id: string
  trip: string // Trip ID
  dayIndex: number
  title: string
  location?: string
  startTime?: string
  endTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Trip Guide Section */
export interface TripGuideSection {
  id: string
  trip: string // Trip ID
  order: number
  title: string
  contentMd: string
  createdAt: string
  updatedAt: string
}

/** Checklist Category */
export type ChecklistCategory = "DOCS" | "HEALTH" | "PERSONAL" | "OTHER"

/** Checklist Item */
export interface ChecklistItem {
  id: string
  trip: string // Trip ID
  label: string
  category: ChecklistCategory
  isRequired: boolean
  createdAt: string
  updatedAt: string
}

/** Emergency Contact */
export interface EmergencyContact {
  id: string
  trip: string // Trip ID
  label: string
  phone: string
  hours?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/** Trip FAQ */
export interface TripFAQ {
  id: string
  trip: string // Trip ID
  question: string
  answer: string
  order: number
  createdAt: string
  updatedAt: string
}

/** Update Urgency */
export type UpdateUrgency = "LOW" | "NORMAL" | "IMPORTANT" | "URGENT"

/** Trip Update */
export interface TripUpdate {
  id: string
  trip: string // Trip ID
  title: string
  bodyMd: string
  urgency: UpdateUrgency
  pinned: boolean
  publishAt: string
  createdAt: string
  updatedAt: string
}

/** Booking Status */
export type BookingStatus = "EOI" | "BOOKED" | "CONFIRMED" | "CANCELLED"

/** Booking */
export interface Booking {
  id: string
  pilgrim: string // PilgrimProfile ID
  package: string // TripPackage ID
  status: BookingStatus
  ticketNumber?: string
  roomAssignment?: string
  createdAt: string
  updatedAt: string
}

/** Dua Category */
export type DuaCategory = "TAWAF" | "SAI" | "ARAFAT" | "GENERAL"

/** Dua */
export interface Dua {
  id: string
  category: DuaCategory
  textAr: string
  textEn: string
  transliteration?: string
  source?: string
  createdAt: string
  updatedAt: string
}

/** Notification Log */
export interface NotificationLog {
  id: string
  recipient: string // Account ID
  subject: string
  body: string
  channel: string
  sentAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

// Extended types with relations (for API responses)
export interface TripWithPackages extends Trip {
  packages?: TripPackage[]
  bookingCount?: number
}

export interface PackageWithDetails extends TripPackage {
  flights?: PackageFlight[]
  hotels?: PackageHotel[]
  bookingCount?: number
  bookedCapacity?: number
}

export interface BookingWithDetails extends Booking {
  pilgrimDetails?: PilgrimProfile & { user: Account }
  packageDetails?: TripPackage & { trip: Trip }
  visaStatus?: Visa
}

export interface PilgrimWithDetails extends PilgrimProfile {
  userDetails: Account
  passport?: Passport
  bookings?: Booking[]
  visas?: Visa[]
}

export interface TripFullDetails extends Trip {
  packages: PackageWithDetails[]
  itinerary: ItineraryItem[]
  guideSections: TripGuideSection[]
  checklist: ChecklistItem[]
  emergencyContacts: EmergencyContact[]
  faqs: TripFAQ[]
  updates: TripUpdate[]
  bookingStats: {
    total: number
    eoiCount: number
    bookedCount: number
    confirmedCount: number
  }
}

// Filter/Query types
export interface PaginationParams {
  page?: number
  size?: number
}

export interface TripFilters extends PaginationParams {
  visibility?: TripVisibility
  startDate?: string
  endDate?: string
  search?: string
}

export interface BookingFilters extends PaginationParams {
  status?: BookingStatus
  tripId?: string
  packageId?: string
  pilgrimId?: string
  search?: string
}

export interface PilgrimFilters extends PaginationParams {
  nationality?: string
  search?: string
}

export interface VisaFilters extends PaginationParams {
  status?: VisaStatus
  tripId?: string
  search?: string
}

// Dashboard types
export interface DashboardStats {
  totalTrips: number
  activeTrips: number
  totalBookings: number
  activeBookings: number
  pendingVisas: number
  totalPilgrims: number
}

export interface RecentActivity {
  id: string
  type: "booking" | "visa" | "payment" | "update"
  title: string
  description: string
  timestamp: string
  relatedId?: string
}

// Form data types (for create/update)
export interface CreateTripData {
  code: string
  name: string
  cities: string[]
  startDate: string
  endDate: string
  coverImage?: string
  visibility: TripVisibility
  operatorNotes?: string
}

export interface CreatePackageData {
  trip: string
  name: string
  priceMinorUnits: number
  currency: string
  capacity: number
  visibility: PackageVisibility
}

export interface CreateBookingData {
  pilgrim: string
  package: string
  status: BookingStatus
  ticketNumber?: string
  roomAssignment?: string
}

export interface CreatePilgrimData {
  phone: string
  name: string
  email?: string
  dob: string
  nationality: string
  emergencyName: string
  emergencyPhone: string
  medicalConditions?: string
}

export interface BulkActionRequest {
  ids: string[]
}

export interface BulkAssignRoomsRequest {
  assignments: Array<{
    bookingId: string
    roomAssignment: string
  }>
}

// Report types
export interface TripAnalytics {
  tripId: string
  tripName: string
  bookingConversionRate: number
  revenueByPackage: Array<{
    packageId: string
    packageName: string
    revenue: number
    bookings: number
  }>
  capacityUtilization: number
}

export interface PilgrimDemographics {
  totalPilgrims: number
  byNationality: Record<string, number>
  byAgeGroup: Record<string, number>
}

export interface VisaStatistics {
  total: number
  pending: number
  submitted: number
  approved: number
  rejected: number
  approvalRate: number
  averageProcessingDays: number
}

