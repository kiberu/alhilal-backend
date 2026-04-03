"""
Tests for the calendar and pilgrim-support trip contract extensions.
"""
from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from apps.bookings.models import Payment
from apps.pilgrims.models import PilgrimReadiness
from apps.trips.models import TripPackage, TripMilestone, TripResource


@pytest.mark.django_db
class TestPublicTripContractExtensions:
    """Tests for public trip fields and package truth."""

    def test_public_trip_detail_includes_status_and_package_date_overrides(self, api_client, trip, currency_usd):
        """Public trip detail should expose the new calendar-truth fields."""
        trip.family_code = "UMRAH-2027"
        trip.commercial_month_label = "January Umrah 2027"
        trip.status = "OPEN_FOR_SALES"
        trip.default_nights = 8
        trip.save()

        package = TripPackage.objects.create(
            trip=trip,
            package_code="JAN27-PREMIUM",
            name="Premium",
            start_date_override=trip.start_date + timedelta(days=1),
            end_date_override=trip.end_date - timedelta(days=2),
            nights=12,
            price_minor_units=330000,
            currency=currency_usd,
            capacity=20,
            sales_target=25,
            hotel_booking_month="JUNE",
            airline_booking_month="APRIL",
            status="SELLING",
            visibility="PUBLIC",
        )

        response = api_client.get(f"/api/v1/public/trips/{trip.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["family_code"] == "UMRAH-2027"
        assert response.data["commercial_month_label"] == "January Umrah 2027"
        assert response.data["status"] == "OPEN_FOR_SALES"
        assert response.data["default_nights"] == 8
        assert len(response.data["packages"]) == 1
        assert response.data["packages"][0]["package_code"] == "JAN27-PREMIUM"
        assert response.data["packages"][0]["start_date"] == str(package.start_date_override)
        assert response.data["packages"][0]["end_date"] == str(package.end_date_override)
        assert response.data["packages"][0]["nights"] == 12
        assert response.data["packages"][0]["sales_target"] == 25
        assert response.data["packages"][0]["hotel_booking_month"] == "JUNE"
        assert response.data["packages"][0]["airline_booking_month"] == "APRIL"
        assert response.data["packages"][0]["status"] == "SELLING"


@pytest.mark.django_db
class TestPilgrimTripContractExtensions:
    """Tests for pilgrim-visible milestones and resources."""

    def test_trip_essentials_include_public_milestones_and_published_resources(
        self,
        authenticated_client,
        booking,
    ):
        """Booked pilgrims should only receive the visible trip and package content."""
        trip = booking.package.trip
        other_package = TripPackage.objects.create(
            trip=trip,
            name="Other Package",
            visibility="PUBLIC",
        )

        now = timezone.now()

        TripMilestone.objects.create(
            trip=trip,
            milestone_type="DARASA_ONE",
            title="First Darasa",
            status="SCHEDULED",
            target_date=timezone.now().date() + timedelta(days=10),
            is_public=True,
        )
        TripMilestone.objects.create(
            trip=trip,
            package=booking.package,
            milestone_type="TICKETS_ISSUED",
            title="Tickets Ready",
            status="ON_TRACK",
            target_date=timezone.now().date() + timedelta(days=7),
            is_public=True,
        )
        TripMilestone.objects.create(
            trip=trip,
            package=other_package,
            milestone_type="SEND_OFF_DINNER",
            title="Other Package Event",
            status="SCHEDULED",
            target_date=timezone.now().date() + timedelta(days=5),
            is_public=True,
        )
        TripMilestone.objects.create(
            trip=trip,
            milestone_type="VISA_SUBMISSION",
            title="Private Milestone",
            status="AT_RISK",
            target_date=timezone.now().date() + timedelta(days=3),
            is_public=False,
        )

        TripResource.objects.create(
            trip=trip,
            title="Main Guide",
            resource_type="UMRAH_GUIDE",
            file_public_id="guides/main-guide",
            file_format="pdf",
            published_at=now - timedelta(hours=1),
        )
        TripResource.objects.create(
            trip=trip,
            package=booking.package,
            title="Daily Program",
            resource_type="DAILY_PROGRAM",
            file_public_id="guides/daily-program",
            file_format="pdf",
            published_at=now - timedelta(hours=1),
            is_pinned=True,
        )
        TripResource.objects.create(
            trip=trip,
            package=other_package,
            title="Other Package Guide",
            resource_type="CHECKLIST",
            file_public_id="guides/other-package",
            file_format="pdf",
            published_at=now - timedelta(hours=1),
        )
        TripResource.objects.create(
            trip=trip,
            title="Draft Guide",
            resource_type="OTHER",
            file_public_id="guides/draft-guide",
            file_format="pdf",
            published_at=now + timedelta(days=1),
        )

        essentials_response = authenticated_client.get(f"/api/v1/me/trips/{trip.id}/essentials/")
        milestones_response = authenticated_client.get(f"/api/v1/me/trips/{trip.id}/milestones/")
        resources_response = authenticated_client.get(f"/api/v1/me/trips/{trip.id}/resources/")

        assert essentials_response.status_code == status.HTTP_200_OK
        assert "milestones" in essentials_response.data
        assert "resources" in essentials_response.data
        assert len(essentials_response.data["milestones"]) == 2
        assert len(essentials_response.data["resources"]) == 2

        assert milestones_response.status_code == status.HTTP_200_OK
        assert len(milestones_response.data) == 2
        assert {item["title"] for item in milestones_response.data} == {"First Darasa", "Tickets Ready"}

        assert resources_response.status_code == status.HTTP_200_OK
        assert len(resources_response.data) == 2
        assert resources_response.data[0]["title"] == "Daily Program"
        assert {item["title"] for item in resources_response.data} == {"Main Guide", "Daily Program"}

    def test_trip_readiness_endpoint_and_admin_validation_flow(
        self,
        api_client,
        authenticated_client,
        staff_user,
        booking,
        passport,
    ):
        """Pilgrims and staff should see the same readiness state for travel validation."""
        trip = booking.package.trip
        booking.pilgrim.gender = "MALE"
        booking.pilgrim.save(update_fields=["gender"])
        passport.status = "VERIFIED"
        passport.save()

        booking.ticket_number = "ET-1234567890"
        booking.save()

        from apps.pilgrims.models import Document
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

        Payment.objects.create(
            booking=booking,
            amount_minor_units=int((booking.package.price_minor_units or 0) * 0.9),
            currency=booking.currency,
            payment_method="CASH",
            payment_date=timezone.now().date(),
            recorded_by=staff_user,
        )

        readiness = PilgrimReadiness.objects.get(booking=booking)
        readiness.darasa_one_completed = True
        readiness.darasa_two_completed = True
        readiness.send_off_completed = True
        readiness.save()
        readiness.refresh_status(save=True)

        pilgrim_response = authenticated_client.get(f"/api/v1/me/trips/{trip.id}/readiness/")

        assert pilgrim_response.status_code == status.HTTP_200_OK
        assert pilgrim_response.data["status"] == "READY_FOR_REVIEW"
        assert pilgrim_response.data["ready_for_travel"] is False
        assert pilgrim_response.data["payment_progress_percent"] == 90
        assert pilgrim_response.data["checks"]["ticket_issued"] is True
        assert pilgrim_response.data["checks"]["darasa_two_completed"] is True
        assert pilgrim_response.data["missing_items"] == ["Staff validation for travel-ready pass"]

        api_client.force_authenticate(user=staff_user)
        validation_response = api_client.post(
            f"/api/v1/readiness/{readiness.id}/validate-ready",
            {"validation_notes": "Validated after final document and darasa review."},
            format="json",
        )

        assert validation_response.status_code == status.HTTP_200_OK
        assert validation_response.data["status"] == "READY_FOR_TRAVEL"
        assert validation_response.data["ready_for_travel"] is True
        assert validation_response.data["validated_by_name"] == staff_user.name

        authenticated_client.force_authenticate(user=booking.pilgrim.user)
        refreshed_pilgrim_response = authenticated_client.get(f"/api/v1/me/trips/{trip.id}/readiness/")

        assert refreshed_pilgrim_response.status_code == status.HTTP_200_OK
        assert refreshed_pilgrim_response.data["status"] == "READY_FOR_TRAVEL"
        assert refreshed_pilgrim_response.data["ready_for_travel"] is True

    def test_confirmed_booking_keeps_trip_support_access(self, authenticated_client, booking):
        """Confirmed pilgrims should retain access to their trip support endpoints."""
        booking.status = "CONFIRMED"
        booking.save()

        response = authenticated_client.get(f"/api/v1/me/trips/{booking.package.trip.id}/readiness/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["booking_reference"] == booking.reference_number


@pytest.mark.django_db
class TestAdminTripContractExtensions:
    """Tests for staff management of milestones and resources."""

    def test_staff_can_create_milestone_and_resource(self, api_client, staff_user, trip, trip_package):
        """Staff should be able to create milestones and resources through the admin API."""
        api_client.force_authenticate(user=staff_user)

        milestone_payload = {
            "trip": str(trip.id),
            "package": str(trip_package.id),
            "milestone_type": "PAYMENT_TARGET_90",
            "title": "Reach 90 percent",
            "status": "ON_TRACK",
            "target_date": str(timezone.now().date() + timedelta(days=14)),
            "is_public": True,
        }
        milestone_response = api_client.post("/api/v1/milestones", milestone_payload, format="json")

        assert milestone_response.status_code == status.HTTP_201_CREATED
        assert TripMilestone.objects.count() == 1

        resource_payload = {
            "trip": str(trip.id),
            "package": str(trip_package.id),
            "title": "View Guide",
            "resource_type": "UMRAH_GUIDE",
            "file_public_id": "guides/view-guide",
            "file_format": "pdf",
            "viewer_mode": "VIEW_ONLY",
            "published_at": (timezone.now() + timedelta(hours=1)).isoformat(),
        }
        resource_response = api_client.post("/api/v1/resources", resource_payload, format="json")

        assert resource_response.status_code == status.HTTP_201_CREATED
        assert TripResource.objects.count() == 1

    def test_milestone_and_resource_reject_package_trip_mismatch(self, api_client, staff_user, trip, trip_package):
        """Admin API should reject package and trip combinations that do not match."""
        api_client.force_authenticate(user=staff_user)

        other_trip = trip.__class__.objects.create(
            code="OTHER2027",
            name="Other Trip",
            cities=["Makkah"],
            start_date=trip.start_date + timedelta(days=60),
            end_date=trip.end_date + timedelta(days=60),
            visibility="PUBLIC",
        )

        milestone_response = api_client.post(
            "/api/v1/milestones",
            {
                "trip": str(other_trip.id),
                "package": str(trip_package.id),
                "milestone_type": "DARASA_TWO",
                "status": "SCHEDULED",
            },
            format="json",
        )

        resource_response = api_client.post(
            "/api/v1/resources",
            {
                "trip": str(other_trip.id),
                "package": str(trip_package.id),
                "title": "Bad Resource",
                "resource_type": "OTHER",
                "file_public_id": "guides/bad-resource",
            },
            format="json",
        )

        assert milestone_response.status_code == status.HTTP_400_BAD_REQUEST
        assert resource_response.status_code == status.HTTP_400_BAD_REQUEST

    def test_staff_cannot_validate_incomplete_readiness(self, api_client, staff_user, booking):
        """The travel-ready pass should not be issued while prerequisites are missing."""
        api_client.force_authenticate(user=staff_user)
        readiness = PilgrimReadiness.objects.get(booking=booking)

        response = api_client.post(f"/api/v1/readiness/{readiness.id}/validate-ready", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "missingItems" in response.data
