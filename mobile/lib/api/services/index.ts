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
export type { PublicVideoFeed, PublicVideoItem } from './content';
