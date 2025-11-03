// TypeScript types matching Django models

/** User Roles */
export type UserRole = "STAFF" | "PILGRIM"
export type StaffRole = "ADMIN" | "AGENT" | "AUDITOR"

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

/** User with Staff Profile (for Admin Management) */
export interface User {
  id: string
  phone: string
  name: string
  email?: string
  role: UserRole
  isActive: boolean
  isStaff: boolean
  isSuperuser: boolean
  staffRole?: StaffRole
  createdAt: string
  updatedAt: string
}

/** Create User Data */
export interface CreateUserData {
  phone: string
  name: string
  email?: string
  password: string
  role: UserRole
  isActive?: boolean
  isStaff?: boolean
  isSuperuser?: boolean
  staffRole?: StaffRole
}

/** Update User Data */
export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  isActive?: boolean
  isStaff?: boolean
  isSuperuser?: boolean
  staffRole?: StaffRole
}

/** Change Password Data (Admin) */
export interface ChangeUserPasswordData {
  newPassword: string
}

/** Pilgrim Profile */
export interface PilgrimProfile {
  id: string
  user?: {
    id: string
    name: string
    phone: string
    email?: string
    isActive: boolean
  }
  fullName: string
  passportNumber: string
  phone: string
  dateOfBirth: string
  dob?: string // Deprecated: use dateOfBirth
  gender: "MALE" | "FEMALE" | "OTHER"
  nationality: string
  address?: string
  emergencyName: string
  emergencyPhone: string
  emergencyRelationship?: string
  emergencyContact?: string // Deprecated: use emergencyName + emergencyPhone
  medicalConditions?: string
  medicalInfo?: string // Deprecated: use medicalConditions
  bookingsCount?: number
  createdAt: string
  updatedAt: string
}

/** Create Pilgrim Data (no user account required) */
export interface CreatePilgrimData {
  fullName: string
  passportNumber: string
  phone: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  nationality: string
  address?: string
  emergencyName: string
  emergencyPhone: string
  emergencyRelationship?: string
  medicalConditions?: string
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
  booking: string // Booking ID
  number?: string // Visa number
  visaType: string
  status: VisaStatus
  applicationDate?: string
  submittedAt?: string
  approvalDate?: string
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
  paymentStatus: PaymentStatus
  amountPaidMinorUnits: number
  currency: string
  specialRequests?: string
  ticketNumber?: string
  roomAssignment?: string
  referenceNumber: string
  createdAt: string
  updatedAt: string
}

/** Dua Category */
export type DuaCategory = "GENERAL" | "TRAVEL" | "PRAYER" | "HEALTH" | "FORGIVENESS" | "GUIDANCE" | "GRATITUDE"

/** Dua */
export interface Dua {
  id: string
  title: string
  titleArabic: string
  content: string
  contentArabic: string
  category: DuaCategory
  transliteration?: string
  reference?: string
  orderIndex: number
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
  bookings?: BookingWithDetails[]
  visas?: Visa[]
}

export interface VisaWithDetails extends Visa {
  bookingDetails?: BookingWithDetails
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

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  totalPages: number
  page: number
  pageSize: number
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
  trips: {
    total: number
    active: number
  }
  bookings: {
    total: number
    active: number
    eoi: number
    booked: number
  }
  pilgrims: {
    total: number
  }
  visas: {
    pending: number
    approved: number
  }
  revenue: {
    totalMinorUnits: number
  }
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  relatedId?: string
  status?: string
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
  paymentStatus?: PaymentStatus
  amountPaid?: number
  currency?: string
  specialRequests?: string
  ticketNumber?: string
  roomAssignment?: string
}

export interface CreatePilgrimData {
  user: string
  dateOfBirth: string
  dob?: string
  gender: "MALE" | "FEMALE" | "OTHER"
  nationality: string
  address?: string
  emergencyContact?: string
  emergencyName?: string
  emergencyPhone?: string
  medicalInfo?: string
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

