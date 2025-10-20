from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords


class Trip(models.Model):
    """Trip model."""
    
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=24, unique=True)
    name = models.CharField(max_length=120)
    cities = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField()
    visibility = models.CharField(max_length=7, choices=VISIBILITY_CHOICES, default='PUBLIC')
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


class TripPackage(models.Model):
    """Package for a trip (e.g., Gold, Premium)."""
    
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='packages')
    name = models.CharField(max_length=40)
    price_minor_units = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=3, null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
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
        
        trip = self.package.trip
        if self.dep_dt.date() < trip.start_date or self.dep_dt.date() > trip.end_date:
            raise ValidationError(f"Flight departure must be within trip dates ({trip.start_date} to {trip.end_date})")
        if self.arr_dt.date() < trip.start_date or self.arr_dt.date() > trip.end_date:
            raise ValidationError(f"Flight arrival must be within trip dates ({trip.start_date} to {trip.end_date})")
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
        
        trip = self.package.trip
        if self.check_in < trip.start_date or self.check_in > trip.end_date:
            raise ValidationError(f"Check-in must be within trip dates ({trip.start_date} to {trip.end_date})")
        if self.check_out < trip.start_date or self.check_out > trip.end_date:
            raise ValidationError(f"Check-out must be within trip dates ({trip.start_date} to {trip.end_date})")
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

