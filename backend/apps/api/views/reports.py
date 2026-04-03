"""Operational reports for staff users and CSV exports."""

from collections import defaultdict
from datetime import timedelta
import csv

from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.common.models import WebsiteLead
from apps.common.permissions import STAFF_READ_ROLES, StaffActionRolePermission, StaffRoleAccessMixin
from apps.pilgrims.models import Document, PilgrimReadiness
from apps.trips.models import TripPackage

ACTIVE_BOOKING_STATUSES = ("BOOKED", "CONFIRMED")


def _rate(numerator: int, denominator: int) -> float:
    """Return a rounded percentage rate."""
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 2)


class ReportQueryMixin:
    """Shared query helpers for report endpoints."""

    def get_days_filter(self) -> int | None:
        """Return an optional relative day-window filter."""
        raw_value = self.request.query_params.get("days")
        if not raw_value:
            return None

        try:
            days = int(raw_value)
        except (TypeError, ValueError):
            return None

        return days if days > 0 else None

    def get_cutoff_date(self):
        """Return the date cutoff implied by the days filter."""
        days = self.get_days_filter()
        if not days:
            return None
        return timezone.now().date() - timedelta(days=days)

    def get_filters_payload(self):
        """Return the normalized filter summary echoed in every report."""
        return {
            "trip": self.request.query_params.get("trip"),
            "package": self.request.query_params.get("package"),
            "days": self.get_days_filter(),
        }

    def get_generated_at(self):
        """Return a single generation timestamp for the report payload."""
        return timezone.now()

    def build_row(self, row_id: str, generated_at, **values):
        """Attach the standard metadata required for report rows."""
        return {
            "id": row_id,
            "created_at": generated_at,
            "updated_at": generated_at,
            **values,
        }

    def filter_packages(self, queryset=None):
        """Return report-scoped packages."""
        queryset = queryset or TripPackage.objects.all()
        queryset = queryset.select_related("trip", "currency")

        trip_id = self.request.query_params.get("trip")
        package_id = self.request.query_params.get("package")
        status_value = self.request.query_params.get("status")
        cutoff = self.get_cutoff_date()

        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if package_id:
            queryset = queryset.filter(id=package_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if cutoff:
            queryset = queryset.filter(trip__start_date__gte=cutoff)

        return queryset.order_by("trip__start_date", "trip__code", "name")

    def filter_bookings(self, queryset=None):
        """Return report-scoped bookings."""
        queryset = queryset or Booking.objects.all()
        queryset = queryset.select_related("package__trip", "pilgrim__user", "currency")

        trip_id = self.request.query_params.get("trip")
        package_id = self.request.query_params.get("package")
        status_value = self.request.query_params.get("status")
        cutoff = self.get_cutoff_date()

        if trip_id:
            queryset = queryset.filter(package__trip_id=trip_id)
        if package_id:
            queryset = queryset.filter(package_id=package_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if cutoff:
            queryset = queryset.filter(created_at__date__gte=cutoff)

        return queryset.order_by("package__trip__start_date", "package__name", "created_at")

    def filter_readiness(self, queryset=None):
        """Return report-scoped readiness records."""
        queryset = queryset or PilgrimReadiness.objects.all()
        queryset = queryset.select_related("trip", "package", "booking", "pilgrim__user")

        trip_id = self.request.query_params.get("trip")
        package_id = self.request.query_params.get("package")
        status_value = self.request.query_params.get("status")
        cutoff = self.get_cutoff_date()

        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if package_id:
            queryset = queryset.filter(package_id=package_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if cutoff:
            queryset = queryset.filter(updated_at__date__gte=cutoff)

        return queryset.order_by("trip__start_date", "package__name", "updated_at")

    def filter_documents(self, queryset=None):
        """Return report-scoped documents."""
        queryset = queryset or Document.objects.all()
        queryset = queryset.select_related("trip", "booking__package__trip", "pilgrim__user")

        trip_id = self.request.query_params.get("trip")
        package_id = self.request.query_params.get("package")
        status_value = self.request.query_params.get("status")
        cutoff = self.get_cutoff_date()

        if trip_id:
            queryset = queryset.filter(
                Q(trip_id=trip_id) | Q(booking__package__trip_id=trip_id)
            )
        if package_id:
            queryset = queryset.filter(
                Q(booking__package_id=package_id) | Q(booking__isnull=True, trip__packages__id=package_id)
            ).distinct()
        if status_value:
            queryset = queryset.filter(status=status_value)
        if cutoff:
            queryset = queryset.filter(updated_at__date__gte=cutoff)

        return queryset.order_by("updated_at")

    def filter_leads(self, queryset=None):
        """Return report-scoped website leads."""
        queryset = queryset or WebsiteLead.objects.all()
        queryset = queryset.select_related("trip", "assigned_to")

        trip_id = self.request.query_params.get("trip")
        status_value = self.request.query_params.get("status")
        cutoff = self.get_cutoff_date()

        if trip_id:
            queryset = queryset.filter(trip_id=trip_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if cutoff:
            queryset = queryset.filter(created_at__date__gte=cutoff)

        return queryset.order_by("created_at")

    def render_csv_response(self, filename: str, rows: list[dict]):
        """Return the supplied rows as a CSV download."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        fieldnames = list(rows[0].keys()) if rows else ["id", "created_at", "updated_at"]
        writer = csv.DictWriter(response, fieldnames=fieldnames)
        writer.writeheader()

        for row in rows:
            writer.writerow(
                {
                    key: value.isoformat() if hasattr(value, "isoformat") else value
                    for key, value in row.items()
                }
            )

        return response


class BaseReportView(ReportQueryMixin, StaffRoleAccessMixin, APIView):
    """Base class for JSON and CSV report views."""

    permission_classes = [IsAuthenticated, StaffActionRolePermission]
    method_staff_roles = {"GET": STAFF_READ_ROLES}
    export_filename = "report.csv"

    def get_payload(self):
        """Return the report payload."""
        raise NotImplementedError

    def get_export_rows(self, payload):
        """Return the rows to export for the current payload."""
        return payload.get("rows", [])

    def get(self, request):
        return Response(self.get_payload())


class BaseReportExportView(BaseReportView):
    """CSV export companion for a report view."""

    def get(self, request):
        payload = self.get_payload()
        return self.render_csv_response(self.export_filename, self.get_export_rows(payload))


class SummaryReportView(BaseReportView):
    """High-level operational summary cards for the admin reports page."""

    export_filename = "summary-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        bookings = list(self.filter_bookings())
        readiness_records = list(self.filter_readiness())
        leads = list(self.filter_leads())

        active_bookings = [booking for booking in bookings if booking.status in ACTIVE_BOOKING_STATUSES]
        ready_for_travel = [item for item in readiness_records if item.ready_for_travel]
        payment_target_met = [item for item in readiness_records if item.payment_target_met]
        visa_verified = [item for item in readiness_records if item.visa_verified]
        tickets_issued = [item for item in readiness_records if item.ticket_issued]

        cards = [
            self.build_row(
                "summary-active-bookings",
                generated_at,
                label="Active bookings",
                value=len(active_bookings),
                unit="bookings",
                description="Bookings currently in BOOKED or CONFIRMED status.",
            ),
            self.build_row(
                "summary-payment-target-met",
                generated_at,
                label="Payment target met",
                value=len(payment_target_met),
                unit="pilgrims",
                description="Pilgrims who have crossed the 90% readiness payment threshold.",
            ),
            self.build_row(
                "summary-ready-for-travel",
                generated_at,
                label="Ready for travel",
                value=len(ready_for_travel),
                unit="pilgrims",
                description="Pilgrims with a validated travel-ready pass.",
            ),
            self.build_row(
                "summary-visa-verified",
                generated_at,
                label="Visa verified",
                value=len(visa_verified),
                unit="pilgrims",
                description="Readiness records with verified visa state.",
            ),
            self.build_row(
                "summary-ticket-issued",
                generated_at,
                label="Tickets issued",
                value=len(tickets_issued),
                unit="pilgrims",
                description="Readiness records with an issued ticket number.",
            ),
            self.build_row(
                "summary-website-leads",
                generated_at,
                label="Website leads",
                value=len(leads),
                unit="leads",
                description="Captured website leads in the selected report scope.",
            ),
        ]

        return {
            "id": "report-summary",
            "report_type": "summary",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "cards": cards,
            "rows": cards,
        }


class PaymentTargetReportView(BaseReportView):
    """Report on readiness payment-target attainment by trip package."""

    export_filename = "payment-target-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        packages = list(self.filter_packages())
        bookings = list(self.filter_bookings())
        readiness_records = list(self.filter_readiness())

        bookings_by_package = defaultdict(list)
        for booking in bookings:
            bookings_by_package[str(booking.package_id)].append(booking)

        readiness_by_package = defaultdict(list)
        for readiness in readiness_records:
            readiness_by_package[str(readiness.package_id)].append(readiness)

        rows = []
        for package in packages:
            package_bookings = [
                booking for booking in bookings_by_package[str(package.id)]
                if booking.status in ACTIVE_BOOKING_STATUSES
            ]
            package_readiness = [
                readiness for readiness in readiness_by_package[str(package.id)]
                if readiness.booking.status in ACTIVE_BOOKING_STATUSES
            ]
            at_target = sum(1 for readiness in package_readiness if readiness.payment_target_met)
            active_count = len(package_bookings)
            sales_target = package.sales_target or 0

            rows.append(
                self.build_row(
                    f"payment-target:{package.id}",
                    generated_at,
                    trip_id=str(package.trip_id),
                    trip_code=package.trip.code,
                    trip_name=package.trip.name,
                    package_id=str(package.id),
                    package_name=package.name,
                    package_status=package.status,
                    active_bookings=active_count,
                    pilgrims_at_target=at_target,
                    attainment_rate=_rate(at_target, active_count),
                    sales_target=sales_target,
                    sales_target_attainment_rate=_rate(active_count, sales_target) if sales_target else 0.0,
                )
            )

        return {
            "id": "report-payment-target",
            "report_type": "payment_target",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "rows": rows,
        }


class ReadinessCompletionReportView(BaseReportView):
    """Report on readiness completion and blockers by trip package."""

    export_filename = "readiness-completion-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        packages = list(self.filter_packages())
        readiness_records = list(self.filter_readiness())

        readiness_by_package = defaultdict(list)
        for readiness in readiness_records:
            readiness_by_package[str(readiness.package_id)].append(readiness)

        rows = []
        for package in packages:
            package_readiness = [
                readiness for readiness in readiness_by_package[str(package.id)]
                if readiness.booking.status in ACTIVE_BOOKING_STATUSES
            ]
            total = len(package_readiness)
            ready = sum(1 for readiness in package_readiness if readiness.ready_for_travel)
            review = sum(1 for readiness in package_readiness if readiness.status == "READY_FOR_REVIEW")
            blocked = sum(1 for readiness in package_readiness if readiness.status == "BLOCKED")
            follow_up = sum(1 for readiness in package_readiness if readiness.requires_follow_up)

            rows.append(
                self.build_row(
                    f"readiness:{package.id}",
                    generated_at,
                    trip_id=str(package.trip_id),
                    trip_code=package.trip.code,
                    trip_name=package.trip.name,
                    package_id=str(package.id),
                    package_name=package.name,
                    readiness_records=total,
                    ready_for_travel=ready,
                    ready_for_review=review,
                    blocked=blocked,
                    requires_follow_up=follow_up,
                    completion_rate=_rate(ready, total),
                )
            )

        return {
            "id": "report-readiness-completion",
            "report_type": "readiness_completion",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "rows": rows,
        }


class VisaTicketProgressReportView(BaseReportView):
    """Report on visa verification and ticket issue progress."""

    export_filename = "visa-ticket-progress-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        packages = list(self.filter_packages())
        readiness_records = list(self.filter_readiness())

        readiness_by_package = defaultdict(list)
        for readiness in readiness_records:
            readiness_by_package[str(readiness.package_id)].append(readiness)

        rows = []
        for package in packages:
            package_readiness = [
                readiness for readiness in readiness_by_package[str(package.id)]
                if readiness.booking.status in ACTIVE_BOOKING_STATUSES
            ]
            total = len(package_readiness)
            visa_verified = sum(1 for readiness in package_readiness if readiness.visa_verified)
            ticket_issued = sum(1 for readiness in package_readiness if readiness.ticket_issued)
            documents_complete = sum(1 for readiness in package_readiness if readiness.documents_complete)
            both_complete = sum(
                1 for readiness in package_readiness
                if readiness.visa_verified and readiness.ticket_issued
            )

            rows.append(
                self.build_row(
                    f"visa-ticket:{package.id}",
                    generated_at,
                    trip_id=str(package.trip_id),
                    trip_code=package.trip.code,
                    trip_name=package.trip.name,
                    package_id=str(package.id),
                    package_name=package.name,
                    readiness_records=total,
                    visa_verified=visa_verified,
                    ticket_issued=ticket_issued,
                    documents_complete=documents_complete,
                    visa_verification_rate=_rate(visa_verified, total),
                    ticket_issue_rate=_rate(ticket_issued, total),
                    visa_and_ticket_complete=both_complete,
                    visa_and_ticket_complete_rate=_rate(both_complete, total),
                )
            )

        return {
            "id": "report-visa-ticket-progress",
            "report_type": "visa_ticket_progress",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "rows": rows,
        }


class TripPackagePerformanceReportView(BaseReportView):
    """Report on package truth, occupancy, and commercial performance."""

    export_filename = "trip-package-performance-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        packages = list(self.filter_packages())
        bookings = list(self.filter_bookings())
        readiness_records = list(self.filter_readiness())

        bookings_by_package = defaultdict(list)
        for booking in bookings:
            bookings_by_package[str(booking.package_id)].append(booking)

        readiness_by_package = defaultdict(list)
        for readiness in readiness_records:
            readiness_by_package[str(readiness.package_id)].append(readiness)

        rows = []
        for package in packages:
            package_bookings = bookings_by_package[str(package.id)]
            active_bookings = [booking for booking in package_bookings if booking.status in ACTIVE_BOOKING_STATUSES]
            confirmed = [booking for booking in active_bookings if booking.status == "CONFIRMED"]
            package_readiness = [
                readiness for readiness in readiness_by_package[str(package.id)]
                if readiness.booking.status in ACTIVE_BOOKING_STATUSES
            ]
            payment_progress_values = [readiness.payment_progress_percent for readiness in package_readiness]
            average_payment_progress = round(sum(payment_progress_values) / len(payment_progress_values), 2) if payment_progress_values else 0.0
            total_paid_minor_units = sum(booking.amount_paid_minor_units or 0 for booking in active_bookings)

            rows.append(
                self.build_row(
                    f"trip-package-performance:{package.id}",
                    generated_at,
                    trip_id=str(package.trip_id),
                    trip_code=package.trip.code,
                    trip_name=package.trip.name,
                    trip_status=package.trip.status,
                    trip_family_code=package.trip.family_code,
                    commercial_month_label=package.trip.commercial_month_label,
                    package_id=str(package.id),
                    package_name=package.name,
                    package_status=package.status,
                    capacity=package.capacity or 0,
                    active_bookings=len(active_bookings),
                    confirmed_bookings=len(confirmed),
                    occupancy_rate=_rate(len(active_bookings), package.capacity or 0) if package.capacity else 0.0,
                    sales_target=package.sales_target or 0,
                    sales_target_attainment_rate=_rate(len(active_bookings), package.sales_target or 0) if package.sales_target else 0.0,
                    total_paid_minor_units=total_paid_minor_units,
                    average_payment_progress_percent=average_payment_progress,
                    hotel_booking_month=package.hotel_booking_month,
                    airline_booking_month=package.airline_booking_month,
                )
            )

        return {
            "id": "report-trip-package-performance",
            "report_type": "trip_package_performance",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "rows": rows,
        }


class LeadFunnelReportView(BaseReportView):
    """Report on website lead status and source funnel progress."""

    export_filename = "lead-funnel-report.csv"

    def get_payload(self):
        generated_at = self.get_generated_at()
        leads = list(self.filter_leads())

        status_counts = defaultdict(lambda: {"CONSULTATION": 0, "GUIDE_REQUEST": 0})
        source_counts = defaultdict(int)

        for lead in leads:
            status_counts[lead.status][lead.interest_type] += 1
            source_counts[lead.source] += 1

        rows = []
        total_leads = len(leads)
        for status_value in ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]:
            counts = status_counts[status_value]
            total_for_status = counts["CONSULTATION"] + counts["GUIDE_REQUEST"]
            rows.append(
                self.build_row(
                    f"lead-funnel:{status_value}",
                    generated_at,
                    status=status_value,
                    total=total_for_status,
                    consultation=counts["CONSULTATION"],
                    guide_request=counts["GUIDE_REQUEST"],
                    conversion_rate=_rate(total_for_status, total_leads),
                )
            )

        sources = [
            self.build_row(
                f"lead-source:{source}",
                generated_at,
                source=source,
                total=count,
                share_rate=_rate(count, total_leads),
            )
            for source, count in sorted(source_counts.items(), key=lambda item: (-item[1], item[0]))
        ]

        return {
            "id": "report-lead-funnel",
            "report_type": "lead_funnel",
            "created_at": generated_at,
            "updated_at": generated_at,
            "generated_at": generated_at,
            "filters": self.get_filters_payload(),
            "totals": self.build_row(
                "lead-funnel:totals",
                generated_at,
                total=total_leads,
                contacted=status_counts["CONTACTED"]["CONSULTATION"] + status_counts["CONTACTED"]["GUIDE_REQUEST"],
                qualified=status_counts["QUALIFIED"]["CONSULTATION"] + status_counts["QUALIFIED"]["GUIDE_REQUEST"],
                closed=status_counts["CLOSED"]["CONSULTATION"] + status_counts["CLOSED"]["GUIDE_REQUEST"],
            ),
            "rows": rows,
            "sources": sources,
        }

    def get_export_rows(self, payload):
        """Export the main funnel rows and append the source breakdown."""
        return payload.get("rows", []) + payload.get("sources", [])


class SummaryReportExportView(BaseReportExportView, SummaryReportView):
    """CSV export for the summary report."""


class PaymentTargetReportExportView(BaseReportExportView, PaymentTargetReportView):
    """CSV export for the payment-target report."""


class ReadinessCompletionReportExportView(BaseReportExportView, ReadinessCompletionReportView):
    """CSV export for the readiness completion report."""


class VisaTicketProgressReportExportView(BaseReportExportView, VisaTicketProgressReportView):
    """CSV export for the visa/ticket report."""


class TripPackagePerformanceReportExportView(BaseReportExportView, TripPackagePerformanceReportView):
    """CSV export for the trip/package performance report."""


class LeadFunnelReportExportView(BaseReportExportView, LeadFunnelReportView):
    """CSV export for the lead funnel report."""
