from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.profile import MeView, MyBookingsView, MyBookingDetailView, UpdateProfileView, CreateBookingView
from .views.trips import (
    TripListView, TripDetailView, TripItineraryView,
    TripUpdatesView, TripEssentialsView, TripMilestonesView, TripResourcesView, TripReadinessView,
    PublicTripListView, PublicTripDetailView, PublicTripDetailBySlugView
)
from .views.packages import (
    PackageDetailView, PackageFlightsView, PackageHotelsView
)
from .views.content import DuaListView
from .views.dashboard import (
    DashboardStatsView, DashboardActivityView, DashboardUpcomingTripsView
)
from .views.reports import (
    LeadFunnelReportExportView,
    LeadFunnelReportView,
    PaymentTargetReportExportView,
    PaymentTargetReportView,
    ReadinessCompletionReportExportView,
    ReadinessCompletionReportView,
    SummaryReportExportView,
    SummaryReportView,
    TripPackagePerformanceReportExportView,
    TripPackagePerformanceReportView,
    VisaTicketProgressReportExportView,
    VisaTicketProgressReportView,
)
from .views.admin import (
    AdminTripViewSet, AdminBookingViewSet, AdminPilgrimViewSet, AdminPilgrimReadinessViewSet, AdminTripFeedbackViewSet, AdminWebsiteLeadViewSet,
    AdminDuaViewSet,
    AdminPackageViewSet, AdminPackageFlightViewSet, AdminPackageHotelViewSet,
    AdminItineraryItemViewSet, AdminTripUpdateViewSet, AdminTripGuideSectionViewSet,
    AdminChecklistItemViewSet, AdminEmergencyContactViewSet, AdminTripFAQViewSet,
    AdminTripMilestoneViewSet, AdminTripResourceViewSet,
    AdminUserListView, AdminUserDetailView, AdminUserChangePasswordView
)
from .views.documents import DocumentViewSet, MyDocumentsListView, MyDocumentDetailView
from .views.admin.pilgrim_import import download_template, validate_import, import_pilgrims
from .views.platform import PlatformSettingsView, PublicVideoFeedView
from .views.leads import PublicWebsiteLeadCreateView
from .views.support import (
    DeviceInstallationDetailView,
    DeviceInstallationListView,
    NotificationPreferenceView,
    TripDailyProgramView,
    TripFeedbackView,
)

app_name = 'api'

# Router for admin ViewSets (with trailing slash disabled to match frontend)
router = DefaultRouter(trailing_slash=False)
router.register(r'trips', AdminTripViewSet, basename='admin-trip')
router.register(r'bookings', AdminBookingViewSet, basename='admin-booking')
router.register(r'pilgrims', AdminPilgrimViewSet, basename='admin-pilgrim')
router.register(r'readiness', AdminPilgrimReadinessViewSet, basename='admin-readiness')
router.register(r'feedback', AdminTripFeedbackViewSet, basename='admin-feedback')
router.register(r'leads', AdminWebsiteLeadViewSet, basename='admin-website-lead')
router.register(r'duas', AdminDuaViewSet, basename='admin-dua')
router.register(r'documents', DocumentViewSet, basename='admin-document')
router.register(r'packages', AdminPackageViewSet, basename='admin-package')
router.register(r'flights', AdminPackageFlightViewSet, basename='admin-flight')
router.register(r'hotels', AdminPackageHotelViewSet, basename='admin-hotel')
router.register(r'itinerary', AdminItineraryItemViewSet, basename='admin-itinerary')
router.register(r'updates', AdminTripUpdateViewSet, basename='admin-update')
router.register(r'guides', AdminTripGuideSectionViewSet, basename='admin-guide')
router.register(r'checklists', AdminChecklistItemViewSet, basename='admin-checklist')
router.register(r'contacts', AdminEmergencyContactViewSet, basename='admin-contact')
router.register(r'faqs', AdminTripFAQViewSet, basename='admin-faq')
router.register(r'milestones', AdminTripMilestoneViewSet, basename='admin-milestone')
router.register(r'resources', AdminTripResourceViewSet, basename='admin-resource')

urlpatterns = [
    # Authentication
    path('auth/', include('apps.api.auth.urls')),
    
    # Common utilities
    path('common/', include('apps.common.urls')),
    
    # Public endpoints (no authentication required)
    path('public/trips/', PublicTripListView.as_view(), name='public-trips'),
    path('public/trips/slug/<slug:slug>/', PublicTripDetailBySlugView.as_view(), name='public-trip-detail-by-slug'),
    path('public/trips/<uuid:id>/', PublicTripDetailView.as_view(), name='public-trip-detail'),
    path('public/leads/', PublicWebsiteLeadCreateView.as_view(), name='public-website-leads'),
    path('public/videos/', PublicVideoFeedView.as_view(), name='public-videos'),
    
    # Dashboard endpoints (staff only)
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/activity/', DashboardActivityView.as_view(), name='dashboard-activity'),
    path('dashboard/upcoming-trips/', DashboardUpcomingTripsView.as_view(), name='dashboard-upcoming-trips'),
    path('dashboard/reports/summary/', SummaryReportView.as_view(), name='dashboard-report-summary'),
    path('dashboard/reports/summary/export/', SummaryReportExportView.as_view(), name='dashboard-report-summary-export'),
    path('dashboard/reports/payment-target/', PaymentTargetReportView.as_view(), name='dashboard-report-payment-target'),
    path('dashboard/reports/payment-target/export/', PaymentTargetReportExportView.as_view(), name='dashboard-report-payment-target-export'),
    path('dashboard/reports/readiness/', ReadinessCompletionReportView.as_view(), name='dashboard-report-readiness'),
    path('dashboard/reports/readiness/export/', ReadinessCompletionReportExportView.as_view(), name='dashboard-report-readiness-export'),
    path('dashboard/reports/visa-ticket-progress/', VisaTicketProgressReportView.as_view(), name='dashboard-report-visa-ticket-progress'),
    path('dashboard/reports/visa-ticket-progress/export/', VisaTicketProgressReportExportView.as_view(), name='dashboard-report-visa-ticket-progress-export'),
    path('dashboard/reports/trip-package-performance/', TripPackagePerformanceReportView.as_view(), name='dashboard-report-trip-package-performance'),
    path('dashboard/reports/trip-package-performance/export/', TripPackagePerformanceReportExportView.as_view(), name='dashboard-report-trip-package-performance-export'),
    path('dashboard/reports/lead-funnel/', LeadFunnelReportView.as_view(), name='dashboard-report-lead-funnel'),
    path('dashboard/reports/lead-funnel/export/', LeadFunnelReportExportView.as_view(), name='dashboard-report-lead-funnel-export'),
    
    # Profile endpoints (pilgrim-facing)
    path('me/', MeView.as_view(), name='me'),
    path('me/bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('me/bookings/<uuid:id>/', MyBookingDetailView.as_view(), name='my-booking-detail'),
    path('me/documents/', MyDocumentsListView.as_view(), name='my-documents'),
    path('me/documents/<uuid:id>/', MyDocumentDetailView.as_view(), name='my-document-detail'),
    path('me/notification-preferences/', NotificationPreferenceView.as_view(), name='my-notification-preferences'),
    path('me/devices/', DeviceInstallationListView.as_view(), name='my-devices'),
    path('me/devices/<uuid:id>/', DeviceInstallationDetailView.as_view(), name='my-device-detail'),
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('me/trips/', TripListView.as_view(), name='my-trips'),
    path('me/trips/<uuid:pk>/', TripDetailView.as_view(), name='my-trip-detail'),
    path('me/trips/<uuid:trip_id>/itinerary/', TripItineraryView.as_view(), name='my-trip-itinerary'),
    path('me/trips/<uuid:trip_id>/updates/', TripUpdatesView.as_view(), name='my-trip-updates'),
    path('me/trips/<uuid:trip_id>/essentials/', TripEssentialsView.as_view(), name='my-trip-essentials'),
    path('me/trips/<uuid:trip_id>/milestones/', TripMilestonesView.as_view(), name='my-trip-milestones'),
    path('me/trips/<uuid:trip_id>/resources/', TripResourcesView.as_view(), name='my-trip-resources'),
    path('me/trips/<uuid:trip_id>/readiness/', TripReadinessView.as_view(), name='my-trip-readiness'),
    path('me/trips/<uuid:trip_id>/daily-program/', TripDailyProgramView.as_view(), name='my-trip-daily-program'),
    path('me/trips/<uuid:trip_id>/feedback/', TripFeedbackView.as_view(), name='my-trip-feedback'),
    
    # Package endpoints (pilgrim-facing)
    path('me/packages/<uuid:pk>/', PackageDetailView.as_view(), name='my-package-detail'),
    path('me/packages/<uuid:package_id>/flights/', PackageFlightsView.as_view(), name='my-package-flights'),
    path('me/packages/<uuid:package_id>/hotels/', PackageHotelsView.as_view(), name='my-package-hotels'),
    
    # Content endpoints (pilgrim-facing)
    path('me/duas/', DuaListView.as_view(), name='my-dua-list'),
    
    # Admin User Management (staff only)
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<uuid:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<uuid:user_id>/change-password/', AdminUserChangePasswordView.as_view(), name='admin-user-change-password'),
    path('platform/settings/', PlatformSettingsView.as_view(), name='platform-settings'),
    
    # Admin Pilgrim Import (staff only)
    path('pilgrims/import/template/', download_template, name='pilgrim-import-template'),
    path('pilgrims/import/validate/', validate_import, name='pilgrim-import-validate'),
    path('pilgrims/import/', import_pilgrims, name='pilgrim-import'),
    
    # Admin ViewSets (staff only) - registered via router
    path('', include(router.urls)),
]
