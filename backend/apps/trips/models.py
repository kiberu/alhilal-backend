from uuid import uuid4

from django.db import models
from django.utils.text import slugify
from simple_history.models import HistoricalRecords


class Trip(models.Model):
    """Trip model."""
    
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PLANNING', 'Planning'),
        ('OPEN_FOR_SALES', 'Open For Sales'),
        ('PREPARATION', 'Preparation'),
        ('VISA_IN_PROGRESS', 'Visa In Progress'),
        ('TICKETING', 'Ticketing'),
        ('READY_TO_TRAVEL', 'Ready To Travel'),
        ('IN_JOURNEY', 'In Journey'),
        ('RETURNED', 'Returned'),
        ('POST_TRIP', 'Post Trip'),
        ('ARCHIVED', 'Archived'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=24, unique=True)
    family_code = models.CharField(max_length=40, blank=True, default="")
    commercial_month_label = models.CharField(max_length=80, blank=True, default="")
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=180, unique=True, blank=True, null=True)
    excerpt = models.CharField(max_length=280, blank=True, default="")
    seo_title = models.CharField(max_length=120, blank=True, default="")
    seo_description = models.CharField(max_length=180, blank=True, default="")
    cities = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    sales_open_date = models.DateField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    default_nights = models.PositiveIntegerField(null=True, blank=True)
    cover_image = models.URLField(max_length=500, null=True, blank=True, help_text='URL to cover image (Cloudinary)')
    visibility = models.CharField(max_length=7, choices=VISIBILITY_CHOICES, default='PUBLIC')
    featured = models.BooleanField(default=False, help_text='Display trip prominently on app homepage')
    operator_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'trips'
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def computed_nights(self):
        """Return marketed nights or derive from the trip date window."""
        if self.default_nights is not None:
            return self.default_nights
        return max((self.end_date - self.start_date).days, 0)

    def save(self, *args, **kwargs):
        """Normalize a stable public slug before saving."""
        self.slug = self._build_unique_slug()
        super().save(*args, **kwargs)

    def _build_unique_slug(self) -> str:
        """Generate a unique slug from the explicit slug, name, or code."""
        base_value = self.slug or self.name or self.code or str(self.id)
        base_slug = slugify(base_value) or slugify(self.code) or str(self.id)
        candidate = base_slug[:180]
        index = 2

        while Trip.objects.exclude(pk=self.pk).filter(slug=candidate).exists():
            suffix = f"-{index}"
            candidate = f"{base_slug[: 180 - len(suffix)]}{suffix}"
            index += 1

        return candidate


class TripPackage(models.Model):
    """Package for a trip (e.g., Gold, Premium)."""
    
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SELLING', 'Selling'),
        ('WAITLIST', 'Waitlist'),
        ('CLOSED', 'Closed'),
        ('IN_OPERATION', 'In Operation'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='packages')
    package_code = models.CharField(max_length=32, blank=True, default="")
    name = models.CharField(max_length=40)
    start_date_override = models.DateField(null=True, blank=True)
    end_date_override = models.DateField(null=True, blank=True)
    nights = models.PositiveIntegerField(null=True, blank=True)
    price_minor_units = models.IntegerField(null=True, blank=True)
    currency = models.ForeignKey('common.Currency', on_delete=models.PROTECT, related_name='packages', null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    sales_target = models.PositiveIntegerField(null=True, blank=True)
    hotel_booking_month = models.CharField(max_length=20, blank=True, default="")
    airline_booking_month = models.CharField(max_length=20, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    visibility = models.CharField(max_length=7, choices=VISIBILITY_CHOICES, default='PUBLIC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'trip_packages'
        verbose_name = 'Trip Package'
        verbose_name_plural = 'Trip Packages'
    
    def __str__(self):
        return f"{self.trip.code} - {self.name}"

    @property
    def effective_start_date(self):
        """Return the package start date, falling back to the parent trip."""
        return self.start_date_override or self.trip.start_date

    @property
    def effective_end_date(self):
        """Return the package end date, falling back to the parent trip."""
        return self.end_date_override or self.trip.end_date

    @property
    def effective_nights(self):
        """Return marketed nights or derive from the effective date window."""
        if self.nights is not None:
            return self.nights
        return max((self.effective_end_date - self.effective_start_date).days, 0)

    def clean(self):
        """Validate package-specific travel dates."""
        from django.core.exceptions import ValidationError

        if bool(self.start_date_override) != bool(self.end_date_override):
            raise ValidationError("Both package start and end date overrides must be set together")

        if self.start_date_override and self.end_date_override and self.end_date_override <= self.start_date_override:
            raise ValidationError("Package end date override must be after the start date override")


class PackageFlight(models.Model):
    """Flight details for a package."""
    
    LEG_CHOICES = [
        ('OUTBOUND', 'Outbound'),
        ('RETURN', 'Return'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='flights')
    leg = models.CharField(max_length=10, choices=LEG_CHOICES)
    carrier = models.CharField(max_length=8)
    flight_no = models.CharField(max_length=12)
    dep_airport = models.CharField(max_length=3, help_text='IATA code')
    dep_dt = models.DateTimeField()
    arr_airport = models.CharField(max_length=3, help_text='IATA code')
    arr_dt = models.DateTimeField()
    group_pnr = models.CharField(max_length=16, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'package_flights'
        verbose_name = 'Package Flight'
        verbose_name_plural = 'Package Flights'
        ordering = ['dep_dt']
    
    def __str__(self):
        return f"{self.carrier}{self.flight_no} - {self.dep_airport}→{self.arr_airport}"
    
    def clean(self):
        """Validate flight dates are within trip dates."""
        from django.core.exceptions import ValidationError
        
        package_start = self.package.effective_start_date
        package_end = self.package.effective_end_date

        if self.dep_dt.date() < package_start or self.dep_dt.date() > package_end:
            raise ValidationError(f"Flight departure must be within package dates ({package_start} to {package_end})")
        if self.arr_dt.date() < package_start or self.arr_dt.date() > package_end:
            raise ValidationError(f"Flight arrival must be within package dates ({package_start} to {package_end})")
        if self.arr_dt <= self.dep_dt:
            raise ValidationError("Arrival time must be after departure time")


class PackageHotel(models.Model):
    """Hotel accommodation for a package."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='hotels')
    name = models.CharField(max_length=160)
    address = models.TextField()
    room_type = models.CharField(max_length=60, null=True, blank=True)
    check_in = models.DateField()
    check_out = models.DateField()
    group_confirmation_no = models.CharField(max_length=32, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'package_hotels'
        verbose_name = 'Package Hotel'
        verbose_name_plural = 'Package Hotels'
        ordering = ['check_in']
    
    def __str__(self):
        return f"{self.name} ({self.check_in} - {self.check_out})"
    
    def clean(self):
        """Validate hotel dates are within trip dates."""
        from django.core.exceptions import ValidationError
        
        package_start = self.package.effective_start_date
        package_end = self.package.effective_end_date

        if self.check_in < package_start or self.check_in > package_end:
            raise ValidationError(f"Check-in must be within package dates ({package_start} to {package_end})")
        if self.check_out < package_start or self.check_out > package_end:
            raise ValidationError(f"Check-out must be within package dates ({package_start} to {package_end})")
        if self.check_out <= self.check_in:
            raise ValidationError("Check-out must be after check-in")


class ItineraryItem(models.Model):
    """Day-by-day itinerary for a trip."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='itinerary_items')
    day_index = models.IntegerField(help_text='Day number (1-indexed)')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    title = models.CharField(max_length=160)
    location = models.CharField(max_length=160, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    attach_public_id = models.CharField(max_length=160, null=True, blank=True)
    attach_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'itinerary_items'
        verbose_name = 'Itinerary Item'
        verbose_name_plural = 'Itinerary Items'
        ordering = ['day_index', 'start_time']
    
    def __str__(self):
        return f"Day {self.day_index}: {self.title}"
    
    def clean(self):
        """Validate times are within trip window."""
        from django.core.exceptions import ValidationError
        from datetime import timedelta
        
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError("End time must be after start time")
            
            trip_duration = (self.trip.end_date - self.trip.start_date).days + 1
            if self.day_index < 1 or self.day_index > trip_duration:
                raise ValidationError(f"Day index must be between 1 and {trip_duration}")


class TripUpdate(models.Model):
    """News and announcements for trips."""
    
    URGENCY_CHOICES = [
        ('INFO', 'Info'),
        ('IMPORTANT', 'Important'),
        ('CRITICAL', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='updates')
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='updates', null=True, blank=True)
    title = models.CharField(max_length=200)
    body_md = models.TextField(help_text='Markdown content')
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='INFO')
    pinned = models.BooleanField(default=False)
    publish_at = models.DateTimeField()
    attach_public_id = models.CharField(max_length=160, null=True, blank=True)
    attach_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trip_updates'
        verbose_name = 'Trip Update'
        verbose_name_plural = 'Trip Updates'
        ordering = ['-pinned', '-publish_at']
    
    def __str__(self):
        return f"{self.trip.code} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Create notification log on publish."""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Create notification log (MVP stub)
            from apps.content.models import NotificationLog
            scope = 'PACKAGE' if self.package else 'TRIP'
            scope_id = self.package_id if self.package else self.trip_id
            
            NotificationLog.objects.create(
                scope=scope,
                scope_id=scope_id,
                title=self.title,
                message=self.body_md[:500],
                scheduled_at=self.publish_at,
            )


class TripGuideSection(models.Model):
    """Travel essentials and guide sections."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='guide_sections')
    order = models.IntegerField(default=0)
    title = models.CharField(max_length=200)
    content_md = models.TextField(help_text='Markdown content')
    attach_public_id = models.CharField(max_length=160, null=True, blank=True)
    attach_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trip_guide_sections'
        verbose_name = 'Trip Guide Section'
        verbose_name_plural = 'Trip Guide Sections'
        ordering = ['order', 'title']
    
    def __str__(self):
        return f"{self.trip.code} - {self.title}"


class ChecklistItem(models.Model):
    """Pre-trip checklist items."""
    
    CATEGORY_CHOICES = [
        ('DOCS', 'Documents'),
        ('HEALTH', 'Health'),
        ('MONEY', 'Money'),
        ('PACKING', 'Packing'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='checklist_items')
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='checklist_items', null=True, blank=True)
    label = models.CharField(max_length=200)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    is_required = models.BooleanField(default=True)
    link_url = models.URLField(null=True, blank=True)
    attach_public_id = models.CharField(max_length=160, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'checklist_items'
        verbose_name = 'Checklist Item'
        verbose_name_plural = 'Checklist Items'
        ordering = ['category', 'label']
    
    def __str__(self):
        scope = f"{self.package.name}" if self.package else "All packages"
        return f"{self.trip.code} ({scope}) - {self.label}"


class EmergencyContact(models.Model):
    """Emergency contact information for trips."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='emergency_contacts')
    label = models.CharField(max_length=120)
    phone = models.CharField(max_length=24)
    hours = models.CharField(max_length=100, null=True, blank=True, help_text='e.g., 24/7, 9AM-5PM')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'emergency_contacts'
        verbose_name = 'Emergency Contact'
        verbose_name_plural = 'Emergency Contacts'
    
    def __str__(self):
        return f"{self.trip.code} - {self.label}: {self.phone}"


class TripFAQ(models.Model):
    """Frequently asked questions for trips."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='faqs')
    question = models.TextField()
    answer = models.TextField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trip_faqs'
        verbose_name = 'Trip FAQ'
        verbose_name_plural = 'Trip FAQs'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.trip.code} - {self.question[:50]}"


class TripMilestone(models.Model):
    """Operational milestones for trips and packages."""

    MILESTONE_TYPE_CHOICES = [
        ('HOTEL_CONTRACTED', 'Hotel Contracted'),
        ('AIRLINE_BLOCKED', 'Airline Blocked'),
        ('DOC_COLLECTION_OPEN', 'Document Collection Open'),
        ('DOC_VALIDATION_COMPLETE', 'Document Validation Complete'),
        ('DARASA_ONE', 'Darasa One'),
        ('DARASA_TWO', 'Darasa Two'),
        ('VISA_SUBMISSION', 'Visa Submission'),
        ('VISA_ISSUING', 'Visa Issuing'),
        ('PAYMENT_TARGET_90', 'Payment Target 90'),
        ('TICKETS_BOOKED', 'Tickets Booked'),
        ('TICKETS_ISSUED', 'Tickets Issued'),
        ('SEND_OFF_DINNER', 'Send Off Dinner'),
        ('TRAVEL_READY_PASS', 'Travel Ready Pass'),
        ('DEPARTURE_ASSEMBLY', 'Departure Assembly'),
        ('ARRIVAL_MADINAH', 'Arrival Madinah'),
        ('TRANSFER_MAKKAH', 'Transfer Makkah'),
        ('SECOND_UMRAH', 'Second Umrah'),
        ('RETURN_TRANSFER', 'Return Transfer'),
        ('ARRIVAL_HOME', 'Arrival Home'),
        ('POST_TRIP_SURVEY', 'Post Trip Survey'),
        ('POST_TRIP_CURRICULUM_START', 'Post Trip Curriculum Start'),
    ]

    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('SCHEDULED', 'Scheduled'),
        ('ON_TRACK', 'On Track'),
        ('AT_RISK', 'At Risk'),
        ('BLOCKED', 'Blocked'),
        ('DONE', 'Done'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='milestones')
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='milestones', null=True, blank=True)
    milestone_type = models.CharField(max_length=32, choices=MILESTONE_TYPE_CHOICES)
    title = models.CharField(max_length=160, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    target_date = models.DateField(null=True, blank=True)
    actual_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    owner = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_trip_milestones')
    is_public = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trip_milestones'
        verbose_name = 'Trip Milestone'
        verbose_name_plural = 'Trip Milestones'
        ordering = ['target_date', 'order', 'created_at']
        indexes = [
            models.Index(fields=['trip', 'status']),
            models.Index(fields=['trip', 'milestone_type']),
            models.Index(fields=['package']),
        ]

    def __str__(self):
        label = self.title or self.get_milestone_type_display()
        return f"{self.trip.code} - {label}"

    def clean(self):
        """Ensure package milestones stay attached to the selected trip."""
        from django.core.exceptions import ValidationError

        if self.package and self.package.trip_id != self.trip_id:
            raise ValidationError("Milestone package must belong to the selected trip")


class TripResource(models.Model):
    """Pilgrim-facing resources such as guides, checklists, and daily programs."""

    RESOURCE_TYPE_CHOICES = [
        ('UMRAH_GUIDE', 'Umrah Guide'),
        ('DUA_BOOKLET', 'Dua Booklet'),
        ('DAILY_PROGRAM', 'Daily Program'),
        ('CHECKLIST', 'Checklist'),
        ('POST_TRIP_MODULE', 'Post Trip Module'),
        ('OTHER', 'Other'),
    ]

    VIEWER_MODE_CHOICES = [
        ('VIEW_ONLY', 'View Only'),
        ('DOWNLOADABLE', 'Downloadable'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='resources')
    package = models.ForeignKey(TripPackage, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    order = models.PositiveIntegerField(default=0)
    file_public_id = models.CharField(max_length=160)
    file_format = models.CharField(max_length=10, null=True, blank=True)
    file_url = models.URLField(null=True, blank=True)
    viewer_mode = models.CharField(max_length=20, choices=VIEWER_MODE_CHOICES, default='VIEW_ONLY')
    metadata = models.JSONField(default=dict, blank=True)
    is_pinned = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trip_resources'
        verbose_name = 'Trip Resource'
        verbose_name_plural = 'Trip Resources'
        ordering = ['-is_pinned', 'order', 'title']
        indexes = [
            models.Index(fields=['trip', 'resource_type']),
            models.Index(fields=['package']),
            models.Index(fields=['published_at']),
        ]

    def __str__(self):
        return f"{self.trip.code} - {self.title}"

    @property
    def is_published(self):
        """Return whether the resource should be visible to pilgrims."""
        from django.utils import timezone

        return bool(self.published_at and self.published_at <= timezone.now())

    def clean(self):
        """Ensure package-scoped resources stay within the selected trip."""
        from django.core.exceptions import ValidationError

        if self.package and self.package.trip_id != self.trip_id:
            raise ValidationError("Resource package must belong to the selected trip")
