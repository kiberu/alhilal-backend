export { AuthService } from './auth';
export type { RequestOTPData, VerifyOTPData, CompleteProfileData } from './auth';

export { BookingsService } from './bookings';
export type { Booking, BookingDetail } from './bookings';

export { DocumentsService } from './documents';
export type { Document, DocumentUploadData } from './documents';

export { TripsService } from './trips';
export type {
  Trip,
  TripDetail,
  PublicTrip,
  PublicTripDetail,
  TripPackage,
  PackageFlight,
  PackageHotel,
  ItineraryItem,
  TripFAQ,
  TripGuideSection,
  EmergencyContact,
  TripMilestone,
  TripResource,
  TripReadiness,
  TripReadinessChecks,
  PaginatedResponse,
} from './trips';
export { normalizePublicTrip, normalizePublicTripDetail } from './trips';

export { SupportService } from './support';
export type {
  NotificationPreferences,
  DeviceInstallation,
  TripSupportUpdate,
  DailyProgram,
  DailyProgramDay,
  DailyProgramItem,
  TripFeedback,
  TripFeedbackState,
  TripFeedbackPayload,
} from './support';

export { ContentService } from './content';
export type {
  PublicVideoFeed,
  PublicVideoItem,
  GuidanceArticleSummary,
  GuidanceArticleDetail,
  GuidanceSection,
  GuidanceSource,
} from './content';
export { normalizeGuidanceSummary, normalizeGuidanceDetail } from './content';

export { LeadsService } from './leads';
export type { PublicLeadRequest, PublicLeadResponse } from './leads';
