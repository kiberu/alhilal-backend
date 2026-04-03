// TypeScript types matching Django models

/** Currency */
export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  is_active: boolean
}

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
  created_at: string
  updated_at: string
  lastLogin?: string
}

/** Staff Profile */
export interface StaffProfile {
  id: string
  user: string // Account ID
  role: StaffRole
  created_at: string
  updated_at: string
}

/** Platform-wide operational settings */
export interface PlatformSettings {
  otpSupportPhone: string
  otpSupportWhatsApp: string
  otpFallbackMessage: string
  mobileSupportPhone: string
  mobileSupportWhatsApp: string
  mobileSupportEmail: string
  mobileSupportMessage: string
  notificationProviderEnabled: boolean
  notificationProviderName: string
  notificationProviderNotes: string
  leadNotificationToEmail: string
  leadNotificationCcEmail: string
  youtubeChannelId: string
  youtubePlaylistId: string
  youtubeCacheSyncedAt?: string | null
  updatedAt: string
}

export type FeedbackStatus = "DRAFT" | "SUBMITTED"

export interface TripFeedback {
  id: string
  pilgrim: string
  pilgrimName: string
  booking: string
  bookingReference: string
  trip: string
  tripCode: string
  tripName: string
  status: FeedbackStatus
  overallRating?: number | null
  supportRating?: number | null
  accommodationRating?: number | null
  transportRating?: number | null
  highlights?: string
  improvements?: string
  testimonialOptIn: boolean
  followUpRequested: boolean
  reviewNotes?: string
  reviewedBy?: string | null
  reviewedByName?: string | null
  reviewedAt?: string | null
  submittedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface TripFeedbackFilters extends PaginationParams {
  status?: FeedbackStatus
  trip?: string
  follow_up_requested?: boolean
  testimonial_opt_in?: boolean
  search?: string
}

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED"
export type LeadInterestType = "CONSULTATION" | "GUIDE_REQUEST"

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string | null
  interestType: LeadInterestType
  travelWindow?: string
  notes?: string
  trip?: string | null
  tripCode?: string | null
  tripName?: string | null
  source: string
  pagePath: string
  contextLabel: string
  ctaLabel: string
  campaign?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  status: LeadStatus
  assignedTo?: string | null
  assignedToName?: string | null
  followUpNotes?: string
  contactedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface LeadFilters extends PaginationParams {
  status?: LeadStatus
  interest_type?: LeadInterestType
  source?: string
  trip?: string
  search?: string
  created_after?: string
  created_before?: string
}

export interface UpdateLeadData {
  status?: LeadStatus
  assignedTo?: string | null
  followUpNotes?: string
  contactedAt?: string | null
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
  created_at: string
  updated_at: string
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

export interface StaffChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface StaffChangePasswordResponse {
  message: string
  changedAt: string
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
  userDetails?: {
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
  bookings?: Array<{
    id: string
    status: string
    referenceNumber: string
    packageDetails?: {
      trip?: {
        id: string
        name: string
        code: string
      }
    }
  }>
  passport?: {
    id: string
    number: string
    country: string
    expiryDate: string
  }
  visas?: Array<{
    id: string
    status: string
    visaType: string
    number?: string
  }>
  created_at: string
  updated_at: string
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

/** Pilgrim Travel Readiness */
export type ReadinessStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "READY_FOR_TRAVEL"
  | "BLOCKED"

export interface PilgrimReadiness {
  id: string
  pilgrim: string
  pilgrim_name: string
  booking: string
  booking_reference: string
  trip: string
  trip_code: string
  trip_name?: string
  trip_start_date?: string
  trip_end_date?: string
  package: string
  package_name: string
  booking_status?: string
  package_status?: string
  status: ReadinessStatus
  ready_for_travel: boolean
  profile_complete: boolean
  passport_valid: boolean
  visa_verified: boolean
  documents_complete: boolean
  payment_target_met: boolean
  payment_progress_percent: number
  ticket_issued: boolean
  darasa_one_completed: boolean
  darasa_two_completed: boolean
  send_off_completed: boolean
  requires_follow_up: boolean
  blocking_reason?: string
  validation_notes?: string
  validated_by?: string | null
  validated_by_name?: string | null
  validated_at?: string | null
  missing_items: string[]
  blockers: string[]
  created_at: string
  updated_at: string
}

/** Passport */
export interface Passport {
  id: string
  pilgrim: string // PilgrimProfile ID
  number: string // Encrypted
  country: string
  expiryDate: string
  scannedCopy?: string // Cloudinary URL
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

/** Trip Visibility */
export type TripVisibility = "PUBLIC" | "PRIVATE" | "ARCHIVED"
export type TripOperationalStatus =
  | "DRAFT"
  | "PLANNING"
  | "OPEN_FOR_SALES"
  | "PREPARATION"
  | "VISA_IN_PROGRESS"
  | "TICKETING"
  | "READY_TO_TRAVEL"
  | "IN_JOURNEY"
  | "RETURNED"
  | "POST_TRIP"
  | "ARCHIVED"
  | "CANCELLED"

/** Trip */
export interface Trip {
  id: string
  code: string
  familyCode?: string
  commercialMonthLabel?: string
  status?: TripOperationalStatus
  salesOpenDate?: string
  defaultNights?: number | null
  name: string
  slug?: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  cities: string[]
  startDate: string
  endDate: string
  coverImage?: string // Cloudinary URL
  featured?: boolean
  visibility: TripVisibility
  operatorNotes?: string
  created_at: string
  updated_at: string
}

/** Package Visibility */
export type PackageVisibility = "PUBLIC" | "PRIVATE"
export type PackageOperationalStatus =
  | "DRAFT"
  | "SELLING"
  | "WAITLIST"
  | "CLOSED"
  | "IN_OPERATION"
  | "COMPLETED"
  | "CANCELLED"

/** Trip Package */
export interface TripPackage {
  id: string
  trip: string // Trip ID
  package_code?: string
  name: string
  start_date_override?: string | null
  end_date_override?: string | null
  nights?: number | null
  price_minor_units: number
  currency: Currency | null
  capacity: number
  sales_target?: number | null
  hotel_booking_month?: string
  airline_booking_month?: string
  status?: PackageOperationalStatus
  visibility: PackageVisibility
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

/** Trip Guide Section */
export interface TripGuideSection {
  id: string
  trip: string // Trip ID
  order: number
  title: string
  contentMd: string
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

/** Emergency Contact */
export interface EmergencyContact {
  id: string
  trip: string // Trip ID
  label: string
  phone: string
  hours?: string
  notes?: string
  created_at: string
  updated_at: string
}

/** Trip FAQ */
export interface TripFAQ {
  id: string
  trip: string // Trip ID
  question: string
  answer: string
  order: number
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export type TripMilestoneStatus =
  | "NOT_STARTED"
  | "SCHEDULED"
  | "ON_TRACK"
  | "AT_RISK"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED"

export interface TripMilestone {
  id: string
  trip: string
  package?: string | null
  milestoneType: string
  title: string
  status: TripMilestoneStatus
  targetDate?: string | null
  actualDate?: string | null
  notes?: string
  owner?: string | null
  ownerName?: string | null
  isPublic: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTripMilestoneData {
  trip: string
  package?: string | null
  milestoneType: string
  title: string
  status: TripMilestoneStatus
  targetDate?: string | null
  actualDate?: string | null
  notes?: string
  owner?: string | null
  isPublic?: boolean
  order?: number
}

export type TripResourceType =
  | "UMRAH_GUIDE"
  | "DUA_BOOKLET"
  | "DAILY_PROGRAM"
  | "CHECKLIST"
  | "POST_TRIP_MODULE"
  | "OTHER"

export type TripResourceViewerMode = "VIEW_ONLY" | "DOWNLOADABLE"

export interface TripResource {
  id: string
  trip: string
  package?: string | null
  title: string
  description?: string
  resourceType: TripResourceType
  order: number
  filePublicId: string
  fileFormat?: string | null
  fileUrl?: string | null
  viewerMode: TripResourceViewerMode
  metadata?: Record<string, unknown>
  isPinned: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTripResourceData {
  trip: string
  package?: string | null
  title: string
  description?: string
  resourceType: TripResourceType
  order?: number
  filePublicId: string
  fileFormat?: string | null
  fileUrl?: string | null
  viewerMode?: TripResourceViewerMode
  metadata?: Record<string, unknown>
  isPinned?: boolean
  publishedAt?: string | null
}

/** Booking Status */
export type BookingStatus = "EOI" | "BOOKED" | "CONFIRMED" | "CANCELLED"

/** Payment Status */
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED"

/** Payment Method */
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "DEBIT_CARD" | "MOBILE_MONEY" | "CHECK" | "OTHER"

/** Payment */
export interface Payment {
  id: string
  booking: string
  amount_minor_units: number
  currency: Currency | null
  payment_method: PaymentMethod
  payment_date: string
  reference_number?: string
  notes?: string
  recorded_by: string
  recorded_by_name?: string
  created_at: string
  updated_at: string
}

/** Booking */
export interface Booking {
  id: string
  pilgrim: string // PilgrimProfile ID
  package: string // TripPackage ID
  status: BookingStatus
  payment_status: PaymentStatus
  amount_paid_minor_units: number
  currency: Currency | null
  payment_note?: string
  ticket_number?: string
  room_assignment?: string
  special_needs?: string
  notes?: string
  reference_number: string
  created_at: string
  updated_at: string
  payments?: Payment[]
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
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  milestones: TripMilestone[]
  resources: TripResource[]
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
  status?: TripOperationalStatus
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

export interface ReportFilters {
  trip?: string
  package?: string
  days?: number
  status?: string
}

export interface ReportMetricCard {
  id: string
  label: string
  value: number
  unit: string
  description: string
  created_at: string
  updated_at: string
}

export interface SummaryReport {
  id: string
  report_type: "summary"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  cards: ReportMetricCard[]
  rows: ReportMetricCard[]
}

export interface PaymentTargetReportRow {
  id: string
  trip_id: string
  trip_code: string
  trip_name: string
  package_id: string
  package_name: string
  package_status: string
  active_bookings: number
  pilgrims_at_target: number
  attainment_rate: number
  sales_target: number
  sales_target_attainment_rate: number
  created_at: string
  updated_at: string
}

export interface PaymentTargetReport {
  id: string
  report_type: "payment_target"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  rows: PaymentTargetReportRow[]
}

export interface ReadinessCompletionReportRow {
  id: string
  trip_id: string
  trip_code: string
  trip_name: string
  package_id: string
  package_name: string
  readiness_records: number
  ready_for_travel: number
  ready_for_review: number
  blocked: number
  requires_follow_up: number
  completion_rate: number
  created_at: string
  updated_at: string
}

export interface ReadinessCompletionReport {
  id: string
  report_type: "readiness_completion"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  rows: ReadinessCompletionReportRow[]
}

export interface VisaTicketProgressReportRow {
  id: string
  trip_id: string
  trip_code: string
  trip_name: string
  package_id: string
  package_name: string
  readiness_records: number
  visa_verified: number
  ticket_issued: number
  documents_complete: number
  visa_verification_rate: number
  ticket_issue_rate: number
  visa_and_ticket_complete: number
  visa_and_ticket_complete_rate: number
  created_at: string
  updated_at: string
}

export interface VisaTicketProgressReport {
  id: string
  report_type: "visa_ticket_progress"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  rows: VisaTicketProgressReportRow[]
}

export interface TripPackagePerformanceReportRow {
  id: string
  trip_id: string
  trip_code: string
  trip_name: string
  trip_status: string
  trip_family_code?: string
  commercial_month_label?: string
  package_id: string
  package_name: string
  package_status: string
  capacity: number
  active_bookings: number
  confirmed_bookings: number
  occupancy_rate: number
  sales_target: number
  sales_target_attainment_rate: number
  total_paid_minor_units: number
  average_payment_progress_percent: number
  hotel_booking_month?: string
  airline_booking_month?: string
  created_at: string
  updated_at: string
}

export interface TripPackagePerformanceReport {
  id: string
  report_type: "trip_package_performance"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  rows: TripPackagePerformanceReportRow[]
}

export interface LeadFunnelReportRow {
  id: string
  status?: string
  source?: string
  total: number
  consultation?: number
  guide_request?: number
  conversion_rate?: number
  share_rate?: number
  created_at: string
  updated_at: string
}

export interface LeadFunnelTotals {
  id: string
  total: number
  contacted: number
  qualified: number
  closed: number
  created_at: string
  updated_at: string
}

export interface LeadFunnelReport {
  id: string
  report_type: "lead_funnel"
  created_at: string
  updated_at: string
  generated_at: string
  filters: ReportFilters
  totals: LeadFunnelTotals
  rows: LeadFunnelReportRow[]
  sources: LeadFunnelReportRow[]
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
  familyCode?: string
  commercialMonthLabel?: string
  name: string
  slug?: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  cities: string[]
  status?: TripOperationalStatus
  salesOpenDate?: string
  startDate: string
  endDate: string
  defaultNights?: number | null
  coverImage?: string
  featured?: boolean
  visibility: TripVisibility
  operatorNotes?: string
}

export interface CreatePackageData {
  trip: string
  packageCode?: string
  name: string
  startDateOverride?: string | null
  endDateOverride?: string | null
  nights?: number | null
  priceMinorUnits: number
  currency: string
  capacity: number
  salesTarget?: number | null
  hotelBookingMonth?: string
  airlineBookingMonth?: string
  status?: PackageOperationalStatus
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
