from datetime import timedelta

from django.db import models
from django.utils import timezone
from uuid import uuid4
from simple_history.models import HistoricalRecords


class Document(models.Model):
    """Unified document storage for pilgrims (passports, visas, vaccinations, etc.)."""

    REQUIRED_FOR_TRAVEL_TYPES = {'PASSPORT', 'VISA'}
    EXPIRING_SOON_DAYS = 45

    DOCUMENT_TYPE_CHOICES = [
        ('PASSPORT', 'Passport'),
        ('VISA', 'Visa'),
        ('VACCINATION', 'Vaccination Certificate'),
        ('ID_CARD', 'ID Card'),
        ('BIRTH_CERTIFICATE', 'Birth Certificate'),
        ('TRAVEL_PERMIT', 'Travel Permit'),
        ('OTHER', 'Other Document'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='documents')
    
    # Optional relationship to trip/booking
    trip = models.ForeignKey('trips.Trip', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents', 
                            help_text="Optional: Link document to a specific trip (e.g., for visas)")
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents',
                                help_text="Optional: Link document to a specific booking")
    
    # Document details
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200, help_text="e.g., 'Passport - Uganda', 'Visa - Umrah 2025'")
    document_number = models.CharField(max_length=100, null=True, blank=True, help_text="Passport number, visa number, etc.")
    issuing_country = models.CharField(max_length=2, null=True, blank=True, help_text="ISO 2-letter country code")
    
    # File storage (Cloudinary)
    file_public_id = models.CharField(max_length=160, help_text="Cloudinary public ID")
    file_format = models.CharField(max_length=10, null=True, blank=True, help_text="File format/extension (jpg, pdf, png, etc.)")
    file_url = models.URLField(null=True, blank=True, help_text="Optional: Direct URL (auto-generated from public_id)")
    
    # Document dates
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Status and review
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True, help_text="Internal staff notes")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Audit fields
    uploaded_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='uploaded_documents', help_text="Staff member who uploaded (if admin upload)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'documents'
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['pilgrim', 'document_type']),
            models.Index(fields=['trip']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.pilgrim.user.name} - {self.title}"
    
    def clean(self):
        """Validate document data."""
        from django.core.exceptions import ValidationError
        
        if self.expiry_date and self.issue_date and self.issue_date > self.expiry_date:
            raise ValidationError("Issue date must be before expiry date")
        
        # Ensure file_public_id is provided
        if not self.file_public_id:
            raise ValidationError("Document file is required")

    @property
    def is_required_for_travel(self) -> bool:
        """Return whether this document type blocks travel readiness."""
        return self.document_type in self.REQUIRED_FOR_TRAVEL_TYPES

    @property
    def is_expired(self) -> bool:
        """Return whether the document has already expired."""
        return bool(self.expiry_date and self.expiry_date < timezone.now().date())

    @property
    def is_expiring_soon(self) -> bool:
        """Return whether the document expires within the support warning window."""
        if not self.expiry_date:
            return False
        return self.expiry_date <= timezone.now().date() + timedelta(days=self.EXPIRING_SOON_DAYS)

    @property
    def is_missing_for_travel(self) -> bool:
        """Return whether this document still blocks travel readiness."""
        if not self.is_required_for_travel:
            return False
        return self.status != 'VERIFIED' or self.is_expired

    def get_support_next_step(self) -> str:
        """Return the support-guided next step instead of an in-app upload action."""
        label = self.get_document_type_display().lower()

        if self.status == 'REJECTED':
            return f"Contact Al Hilal support with a replacement {label} so staff can review it again."
        if self.status == 'PENDING':
            return f"Al Hilal support is reviewing this {label}. Keep the original ready in case staff asks for another copy."
        if self.is_expired:
            return f"This {label} has expired. Contact Al Hilal support to arrange a renewed replacement before travel."
        if self.is_expiring_soon:
            return f"This {label} is expiring soon. Confirm with Al Hilal support whether a renewed copy is required before departure."
        if self.status == 'VERIFIED':
            return f"This {label} is on file and verified. Keep the original available for travel-day checks."
        return f"Contact Al Hilal support for help resolving the current {label} status."

    def save(self, *args, **kwargs):
        """Persist the document and refresh any linked readiness state."""
        previous_status = None
        if self.pk:
            previous_status = (
                type(self).objects.filter(pk=self.pk).values_list('status', flat=True).first()
            )

        if self.status != 'PENDING' and (self.reviewed_at is None or previous_status != self.status):
            self.reviewed_at = timezone.now()

        super().save(*args, **kwargs)
        self.sync_readiness_records()

    def delete(self, *args, **kwargs):
        """Refresh readiness after a document is removed."""
        pilgrim = self.pilgrim
        trip_id = self.trip_id
        booking_id = self.booking_id
        super().delete(*args, **kwargs)

        queryset = PilgrimReadiness.objects.filter(pilgrim=pilgrim)
        if booking_id:
            queryset = queryset.filter(booking_id=booking_id)
        elif trip_id:
            queryset = queryset.filter(trip_id=trip_id)

        for readiness in queryset.select_related('booking__package', 'pilgrim__user'):
            readiness.refresh_status(save=True)

    def sync_readiness_records(self):
        """Refresh readiness records affected by this document."""
        queryset = PilgrimReadiness.objects.filter(pilgrim=self.pilgrim)
        if self.booking_id:
            queryset = queryset.filter(booking_id=self.booking_id)
        elif self.trip_id:
            queryset = queryset.filter(trip_id=self.trip_id)

        for readiness in queryset.select_related('booking__package', 'pilgrim__user'):
            readiness.refresh_status(save=True)


class PilgrimReadiness(models.Model):
    """Travel-readiness tracking for a pilgrim's booking."""

    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('READY_FOR_REVIEW', 'Ready For Review'),
        ('READY_FOR_TRAVEL', 'Ready For Travel'),
        ('BLOCKED', 'Blocked'),
    ]

    PAYMENT_TARGET_PERCENT = 90

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='travel_readiness')
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='readiness')
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE, related_name='pilgrim_readiness')
    package = models.ForeignKey('trips.TripPackage', on_delete=models.CASCADE, related_name='pilgrim_readiness')
    profile_complete = models.BooleanField(default=False)
    passport_valid = models.BooleanField(default=False)
    visa_verified = models.BooleanField(default=False)
    documents_complete = models.BooleanField(default=False)
    payment_target_met = models.BooleanField(default=False)
    payment_progress_percent = models.PositiveSmallIntegerField(default=0)
    ticket_issued = models.BooleanField(default=False)
    darasa_one_completed = models.BooleanField(default=False)
    darasa_two_completed = models.BooleanField(default=False)
    send_off_completed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    ready_for_travel = models.BooleanField(default=False)
    requires_follow_up = models.BooleanField(default=False)
    blocking_reason = models.TextField(blank=True, default="")
    validation_notes = models.TextField(blank=True, default="")
    validated_by = models.ForeignKey(
        'accounts.Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_pilgrim_readiness',
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    class Meta:
        db_table = 'pilgrim_readiness'
        verbose_name = 'Pilgrim Readiness'
        verbose_name_plural = 'Pilgrim Readiness'
        ordering = ['trip__start_date', 'pilgrim__full_name', 'created_at']
        indexes = [
            models.Index(fields=['trip', 'status']),
            models.Index(fields=['pilgrim', 'status']),
            models.Index(fields=['package']),
            models.Index(fields=['ready_for_travel']),
        ]

    def __str__(self):
        return f"{self.booking.reference_number} - {self.get_status_display()}"

    @property
    def training_complete(self):
        """Return whether the required darasas and send-off have been completed."""
        return self.darasa_one_completed and self.darasa_two_completed and self.send_off_completed

    @property
    def is_ready_for_review(self):
        """Return whether automated and training prerequisites are complete."""
        return (
            self.profile_complete
            and self.documents_complete
            and self.payment_target_met
            and self.ticket_issued
            and self.training_complete
        )

    def clean(self):
        """Keep readiness aligned to the booking it represents."""
        from django.core.exceptions import ValidationError

        if self.booking_id:
            booking = self.booking
            if self.pilgrim_id and self.pilgrim_id != booking.pilgrim_id:
                raise ValidationError("Readiness pilgrim must match the selected booking")
            if self.trip_id and self.trip_id != booking.package.trip_id:
                raise ValidationError("Readiness trip must match the selected booking")
            if self.package_id and self.package_id != booking.package_id:
                raise ValidationError("Readiness package must match the selected booking")

    def save(self, *args, **kwargs):
        """Normalize booking-linked relations before saving."""
        if self.booking_id:
            self.pilgrim = self.booking.pilgrim
            self.package = self.booking.package
            self.trip = self.booking.package.trip
        super().save(*args, **kwargs)

    def get_primary_document(self, document_type: str):
        """Return the most relevant document for the booking."""
        base_queryset = self.pilgrim.documents.filter(document_type=document_type)

        if self.booking_id:
            booking_document = base_queryset.filter(booking_id=self.booking_id).order_by('-updated_at', '-created_at').first()
            if booking_document:
                return booking_document

        trip_document = base_queryset.filter(
            booking__isnull=True,
            trip_id=self.trip_id,
        ).order_by('-updated_at', '-created_at').first()
        if trip_document:
            return trip_document

        return base_queryset.filter(
            booking__isnull=True,
            trip__isnull=True,
        ).order_by('-updated_at', '-created_at').first()

    def compute_profile_complete(self):
        """Check whether the pilgrim profile has the minimum travel fields."""
        full_name = self.pilgrim.full_name or self.pilgrim.user.name
        phone = self.pilgrim.phone or self.pilgrim.user.phone
        required_values = [
            full_name,
            phone,
            self.pilgrim.dob,
            self.pilgrim.gender,
            self.pilgrim.nationality,
            self.pilgrim.emergency_name,
            self.pilgrim.emergency_phone,
        ]
        return all(bool(value) for value in required_values)

    def compute_passport_valid(self):
        """Check whether a verified passport covers the trip window."""
        passport = self.get_primary_document('PASSPORT')
        if not passport or passport.status != 'VERIFIED':
            return False

        if not passport.expiry_date:
            return False

        return passport.expiry_date >= self.package.effective_end_date

    def compute_visa_verified(self):
        """Check whether a verified visa exists for this trip."""
        visa = self.get_primary_document('VISA')
        return bool(visa and visa.status == 'VERIFIED')

    def compute_payment_progress_percent(self):
        """Return payment progress against the package price."""
        package_price = self.booking.package.price_minor_units or 0
        if package_price <= 0:
            return 0

        paid = max(self.booking.amount_paid_minor_units or 0, 0)
        percent = round((paid / package_price) * 100)
        return min(percent, 100)

    def get_blockers(self):
        """Return explicit blocker messages based on the current data."""
        blockers = []

        passport = self.get_primary_document('PASSPORT')
        visa = self.get_primary_document('VISA')

        if passport and passport.status == 'REJECTED':
            blockers.append("Passport was rejected and needs support-guided replacement follow-up")
        elif passport and passport.expiry_date and passport.expiry_date < self.package.effective_end_date:
            blockers.append("Passport expires before the trip ends")

        if visa and visa.status == 'REJECTED':
            blockers.append("Visa was rejected and needs support follow-up")

        return blockers

    def get_missing_requirements(self):
        """Return outstanding readiness items in business language."""
        missing = []

        if not self.profile_complete:
            missing.append("Complete pilgrim profile details")
        if not self.passport_valid:
            missing.append("Verified passport with a valid travel window")
        if not self.visa_verified:
            missing.append("Verified visa for this trip")
        if not self.payment_target_met:
            missing.append(f"Reach the {self.PAYMENT_TARGET_PERCENT}% payment milestone")
        if not self.ticket_issued:
            missing.append("Issue pilgrim ticket")
        if not self.darasa_one_completed:
            missing.append("Complete Umrah Darasa 1")
        if not self.darasa_two_completed:
            missing.append("Complete Umrah Darasa 2")
        if not self.send_off_completed:
            missing.append("Complete send-off dinner or darasa")
        if self.is_ready_for_review and not (self.validated_at and self.validated_by_id):
            missing.append("Staff validation for travel-ready pass")

        return missing

    def refresh_status(self, save=True):
        """Recompute readiness flags from bookings, documents, and staff validation."""
        self.pilgrim = self.booking.pilgrim
        self.package = self.booking.package
        self.trip = self.booking.package.trip

        self.profile_complete = self.compute_profile_complete()
        self.passport_valid = self.compute_passport_valid()
        self.visa_verified = self.compute_visa_verified()
        self.documents_complete = self.passport_valid and self.visa_verified
        self.payment_progress_percent = self.compute_payment_progress_percent()
        self.payment_target_met = self.payment_progress_percent >= self.PAYMENT_TARGET_PERCENT
        self.ticket_issued = bool(self.booking.ticket_number)

        blockers = self.get_blockers()
        has_progress = any([
            self.profile_complete,
            self.passport_valid,
            self.visa_verified,
            self.payment_progress_percent > 0,
            self.ticket_issued,
            self.darasa_one_completed,
            self.darasa_two_completed,
            self.send_off_completed,
            bool(self.validated_at),
        ])

        self.requires_follow_up = bool(blockers)
        self.blocking_reason = "\n".join(blockers)
        self.ready_for_travel = False

        if self.booking.status == 'CANCELLED':
            self.status = 'BLOCKED'
            self.blocking_reason = "Booking is cancelled"
            self.requires_follow_up = True
        elif blockers and not self.is_ready_for_review:
            self.status = 'BLOCKED'
        elif self.is_ready_for_review and self.validated_at and self.validated_by_id:
            self.status = 'READY_FOR_TRAVEL'
            self.ready_for_travel = True
        elif self.is_ready_for_review:
            self.status = 'READY_FOR_REVIEW'
        elif has_progress:
            self.status = 'IN_PROGRESS'
        else:
            self.status = 'NOT_STARTED'

        if save:
            if self._state.adding:
                super(PilgrimReadiness, self).save()
            else:
                super(PilgrimReadiness, self).save(
                    update_fields=[
                        'pilgrim',
                        'trip',
                        'package',
                        'profile_complete',
                        'passport_valid',
                        'visa_verified',
                        'documents_complete',
                        'payment_target_met',
                        'payment_progress_percent',
                        'ticket_issued',
                        'darasa_one_completed',
                        'darasa_two_completed',
                        'send_off_completed',
                        'status',
                        'ready_for_travel',
                        'requires_follow_up',
                        'blocking_reason',
                        'validation_notes',
                        'validated_by',
                        'validated_at',
                        'updated_at',
                    ]
                )

        return self


class NotificationPreference(models.Model):
    """Pilgrim-level notification preferences for support communications."""

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.OneToOneField(
        'accounts.PilgrimProfile',
        on_delete=models.CASCADE,
        related_name='notification_preferences',
    )
    push_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    trip_updates = models.BooleanField(default=True)
    document_updates = models.BooleanField(default=True)
    readiness_updates = models.BooleanField(default=True)
    daily_program_updates = models.BooleanField(default=True)
    support_updates = models.BooleanField(default=True)
    marketing_updates = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f"Notification preferences for {self.pilgrim.full_name or self.pilgrim.user.name}"

    @classmethod
    def get_for_pilgrim(cls, pilgrim):
        """Return a stable preference row for a pilgrim."""
        return cls.objects.get_or_create(pilgrim=pilgrim)[0]


class DeviceInstallation(models.Model):
    """Provider-agnostic record of a pilgrim device installation."""

    PLATFORM_CHOICES = [
        ('IOS', 'iOS'),
        ('ANDROID', 'Android'),
        ('WEB', 'Web'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey(
        'accounts.PilgrimProfile',
        on_delete=models.CASCADE,
        related_name='device_installations',
    )
    installation_id = models.CharField(max_length=120, unique=True)
    platform = models.CharField(max_length=12, choices=PLATFORM_CHOICES)
    device_name = models.CharField(max_length=120, blank=True, default='')
    device_model = models.CharField(max_length=120, blank=True, default='')
    os_version = models.CharField(max_length=64, blank=True, default='')
    app_version = models.CharField(max_length=32, blank=True, default='')
    locale = models.CharField(max_length=32, blank=True, default='')
    timezone = models.CharField(max_length=64, blank=True, default='')
    notifications_enabled = models.BooleanField(default=True)
    capability_flags = models.JSONField(default=dict, blank=True)
    preference_state = models.JSONField(default=dict, blank=True)
    provider_token_fields = models.JSONField(default=dict, blank=True)
    last_seen_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'device_installations'
        verbose_name = 'Device Installation'
        verbose_name_plural = 'Device Installations'
        ordering = ['-last_seen_at', '-updated_at']
        indexes = [
            models.Index(fields=['pilgrim', 'platform']),
            models.Index(fields=['last_seen_at']),
        ]

    def __str__(self):
        return f"{self.pilgrim.user.name} - {self.platform} - {self.installation_id}"


class TripFeedback(models.Model):
    """Post-trip feedback from a pilgrim for a specific booking."""

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey(
        'accounts.PilgrimProfile',
        on_delete=models.CASCADE,
        related_name='trip_feedback',
    )
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='feedback',
    )
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.CASCADE,
        related_name='pilgrim_feedback',
    )
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='DRAFT')
    overall_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    support_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    accommodation_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    transport_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    highlights = models.TextField(blank=True, default='')
    improvements = models.TextField(blank=True, default='')
    testimonial_opt_in = models.BooleanField(default=False)
    follow_up_requested = models.BooleanField(default=False)
    review_notes = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        'accounts.Account',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_trip_feedback',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trip_feedback'
        verbose_name = 'Trip Feedback'
        verbose_name_plural = 'Trip Feedback'
        ordering = ['-submitted_at', '-updated_at']
        indexes = [
            models.Index(fields=['trip', 'status']),
            models.Index(fields=['pilgrim', 'status']),
        ]

    def __str__(self):
        return f"{self.booking.reference_number} - {self.status}"

    def clean(self):
        """Keep feedback aligned to the booking it represents."""
        from django.core.exceptions import ValidationError

        if self.booking_id:
            booking = self.booking
            if self.pilgrim_id and self.pilgrim_id != booking.pilgrim_id:
                raise ValidationError("Feedback pilgrim must match the selected booking")
            if self.trip_id and self.trip_id != booking.package.trip_id:
                raise ValidationError("Feedback trip must match the selected booking")

    def save(self, *args, **kwargs):
        """Normalize booking-linked relations before saving."""
        if self.booking_id:
            self.pilgrim = self.booking.pilgrim
            self.trip = self.booking.package.trip
        super().save(*args, **kwargs)
