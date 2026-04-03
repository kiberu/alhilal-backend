"""Phase 4 admin/backend contract tests."""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from apps.api.auth.tokens import RoleBasedRefreshToken
from apps.common.models import WebsiteLead
from apps.pilgrims.models import Document, PilgrimReadiness
from apps.trips.models import Trip, TripPackage, TripResource


def authenticate(client, user):
    """Attach a bearer token for the given user."""
    refresh = RoleBasedRefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestStaffSelfServicePasswordChange:
    def test_staff_can_change_own_password(self, api_client, staff_user):
        """Staff self-service password changes should validate current password and persist the new one."""
        staff_client = authenticate(api_client, staff_user)

        response = staff_client.post(
            "/api/v1/auth/staff/change-password/",
            {
                "current_password": "staffpass123",
                "new_password": "NewStaffPass456!",
                "confirm_password": "NewStaffPass456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Password changed successfully."

        staff_user.refresh_from_db()
        assert staff_user.check_password("NewStaffPass456!")

    def test_staff_password_change_rejects_wrong_current_password(self, api_client, staff_user):
        """The endpoint should reject password changes when the current password is wrong."""
        staff_client = authenticate(api_client, staff_user)

        response = staff_client.post(
            "/api/v1/auth/staff/change-password/",
            {
                "current_password": "wrong-pass",
                "new_password": "NewStaffPass456!",
                "confirm_password": "NewStaffPass456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "current_password" in response.data["error"]["fields"]

    def test_pilgrims_cannot_use_staff_change_password_endpoint(self, api_client, pilgrim_user):
        """Non-staff users should be denied access to the staff self-service endpoint."""
        pilgrim_client = authenticate(api_client, pilgrim_user)

        response = pilgrim_client.post(
            "/api/v1/auth/staff/change-password/",
            {
                "current_password": "testpass123",
                "new_password": "NewPilgrimPass456!",
                "confirm_password": "NewPilgrimPass456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestPhase4Reports:
    def test_auditors_can_access_reports_summary(self, api_client, auditor_user):
        """Auditors should retain read access to the reports family."""
        auditor_client = authenticate(api_client, auditor_user)

        response = auditor_client.get("/api/v1/dashboard/reports/summary/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["report_type"] == "summary"
        assert response.data["cards"]

    def test_payment_target_report_filters_by_trip_and_exports_csv(
        self,
        api_client,
        staff_user,
        trip,
        trip_package,
        booking,
        currency_usd,
    ):
        """Payment-target reporting should filter to the selected trip and support CSV export."""
        trip_package.price_minor_units = 100000
        trip_package.currency = currency_usd
        trip_package.sales_target = 20
        trip_package.status = "SELLING"
        trip_package.save()

        booking.amount_paid_minor_units = 95000
        booking.status = "BOOKED"
        booking.save()

        readiness = PilgrimReadiness.objects.get(booking=booking)
        readiness.refresh_status(save=True)

        other_trip = Trip.objects.create(
            code="OTHER-TRIP",
            family_code="OTHER",
            commercial_month_label="Other Trip",
            name="Other Trip",
            cities=["Makkah"],
            status="OPEN_FOR_SALES",
            start_date=trip.start_date + timedelta(days=90),
            end_date=trip.end_date + timedelta(days=90),
            visibility="PUBLIC",
        )
        other_package = TripPackage.objects.create(
            trip=other_trip,
            name="Other Package",
            price_minor_units=200000,
            currency=currency_usd,
            capacity=15,
            sales_target=10,
            status="SELLING",
            visibility="PUBLIC",
        )

        staff_client = authenticate(api_client, staff_user)
        response = staff_client.get(f"/api/v1/dashboard/reports/payment-target/?trip={trip.id}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["rows"]) == 1
        assert response.data["rows"][0]["package_id"] == str(trip_package.id)
        assert response.data["rows"][0]["pilgrims_at_target"] == 1
        assert response.data["rows"][0]["sales_target"] == 20

        export_response = staff_client.get(f"/api/v1/dashboard/reports/payment-target/export/?trip={trip.id}")

        assert export_response.status_code == status.HTTP_200_OK
        assert export_response["Content-Type"] == "text/csv"
        assert str(trip_package.id) in export_response.content.decode()
        assert str(other_package.id) not in export_response.content.decode()

    def test_lead_funnel_report_counts_statuses(self, api_client, staff_user, trip):
        """Lead-funnel reporting should group website leads by status and interest type."""
        WebsiteLead.objects.create(
            name="Amina",
            phone="+256700100100",
            interest_type="CONSULTATION",
            source="homepage",
            page_path="/",
            context_label="homepage",
            cta_label="consultation_form_submit",
            trip=trip,
            status="NEW",
        )
        WebsiteLead.objects.create(
            name="Maryam",
            phone="+256700100101",
            interest_type="GUIDE_REQUEST",
            source="homepage",
            page_path="/",
            context_label="homepage",
            cta_label="guide_request_form_submit",
            trip=trip,
            status="CONTACTED",
        )
        WebsiteLead.objects.create(
            name="Fatuma",
            phone="+256700100102",
            interest_type="CONSULTATION",
            source="campaign",
            page_path="/july-umrah",
            context_label="campaign",
            cta_label="consultation_form_submit",
            trip=trip,
            status="CONTACTED",
        )

        staff_client = authenticate(api_client, staff_user)
        response = staff_client.get("/api/v1/dashboard/reports/lead-funnel/")

        assert response.status_code == status.HTTP_200_OK
        contacted_row = next(row for row in response.data["rows"] if row["status"] == "CONTACTED")
        assert contacted_row["total"] == 2
        assert contacted_row["consultation"] == 1
        assert contacted_row["guide_request"] == 1

    def test_readiness_completion_report_filters_by_trip_and_exports_csv(
        self,
        api_client,
        staff_user,
        booking,
        passport,
    ):
        """Readiness completion reporting should reflect the canonical package truth and export cleanly."""
        trip = booking.package.trip
        booking.pilgrim.gender = "MALE"
        booking.pilgrim.save(update_fields=["gender"])

        passport.status = "VERIFIED"
        passport.booking = booking
        passport.trip = trip
        passport.save()

        Document.objects.create(
            pilgrim=booking.pilgrim,
            trip=trip,
            booking=booking,
            document_type="VISA",
            title=f"Visa - {trip.name}",
            document_number="VISA-READY",
            file_public_id="documents/visa-ready",
            status="VERIFIED",
        )

        booking.ticket_number = "ET-1234567890"
        booking.amount_paid_minor_units = int((booking.package.price_minor_units or 0) * 0.9)
        booking.save()

        readiness = PilgrimReadiness.objects.get(booking=booking)
        readiness.darasa_one_completed = True
        readiness.darasa_two_completed = True
        readiness.send_off_completed = True
        readiness.save()
        readiness.refresh_status(save=True)

        staff_client = authenticate(api_client, staff_user)
        response = staff_client.get(f"/api/v1/dashboard/reports/readiness/?trip={trip.id}")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["rows"]) == 1
        assert response.data["rows"][0]["trip_id"] == str(trip.id)
        assert response.data["rows"][0]["ready_for_review"] == 1
        assert response.data["rows"][0]["ready_for_travel"] == 0
        assert response.data["rows"][0]["completion_rate"] == 0.0

        export_response = staff_client.get(f"/api/v1/dashboard/reports/readiness/export/?trip={trip.id}")

        assert export_response.status_code == status.HTTP_200_OK
        assert export_response["Content-Type"] == "text/csv"
        assert "ready_for_review" in export_response.content.decode()
        assert str(trip.id) in export_response.content.decode()

    def test_pilgrims_cannot_access_phase4_staff_reports(self, api_client, pilgrim_user):
        """Phase 4 staff-reporting endpoints must remain unavailable to pilgrim accounts."""
        pilgrim_client = authenticate(api_client, pilgrim_user)

        response = pilgrim_client.get("/api/v1/dashboard/reports/readiness/")

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestTripResourcePublishWorkflow:
    def test_staff_can_publish_and_unpublish_resources(self, api_client, staff_user, trip):
        """Resource publish/unpublish actions should drive the published filter used by admin and mobile reads."""
        resource = TripResource.objects.create(
            trip=trip,
            title="Operational Guide",
            resource_type="UMRAH_GUIDE",
            file_public_id="guides/operational-guide",
            file_format="pdf",
        )

        staff_client = authenticate(api_client, staff_user)

        publish_response = staff_client.post(f"/api/v1/resources/{resource.id}/publish", {}, format="json")

        assert publish_response.status_code == status.HTTP_200_OK
        resource.refresh_from_db()
        assert resource.published_at is not None

        published_list = staff_client.get("/api/v1/resources?published=true")
        assert published_list.status_code == status.HTTP_200_OK
        published_ids = [item["id"] for item in published_list.data["results"]]
        assert str(resource.id) in published_ids

        unpublish_response = staff_client.post(f"/api/v1/resources/{resource.id}/unpublish", {}, format="json")

        assert unpublish_response.status_code == status.HTTP_200_OK
        resource.refresh_from_db()
        assert resource.published_at is None

        unpublished_list = staff_client.get("/api/v1/resources?published=false")
        assert unpublished_list.status_code == status.HTTP_200_OK
        unpublished_ids = [item["id"] for item in unpublished_list.data["results"]]
        assert str(resource.id) in unpublished_ids
