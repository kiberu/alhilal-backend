from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords


class Booking(models.Model):
    """Booking model linking pilgrims to trip packages."""
    
    STATUS_CHOICES = [
        ('EOI', 'Expression of Interest'),
        ('BOOKED', 'Booked'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partial Payment'),
        ('PAID', 'Fully Paid'),
        ('REFUNDED', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    reference_number = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='bookings')
    package = models.ForeignKey('trips.TripPackage', on_delete=models.PROTECT, related_name='bookings')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='EOI')
    
    # Payment information
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    amount_paid_minor_units = models.IntegerField(default=0, help_text='Amount in smallest currency unit (e.g., cents)')
    currency = models.CharField(max_length=3, default='USD')
    payment_note = models.TextField(null=True, blank=True)
    
    # Travel details
    ticket_number = models.CharField(max_length=32, null=True, blank=True)
    room_assignment = models.CharField(max_length=64, null=True, blank=True)
    special_needs = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True, help_text='Internal staff notes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        constraints = [
            models.UniqueConstraint(
                fields=['pilgrim', 'package'],
                condition=~models.Q(status='CANCELLED'),
                name='unique_active_booking_per_package'
            )
        ]
    
    def save(self, *args, **kwargs):
        """Generate reference number on creation."""
        if not self.reference_number:
            # Generate reference number: BK-YYYYMMDD-XXXX
            from django.utils import timezone
            import random
            date_str = timezone.now().strftime('%Y%m%d')
            random_suffix = ''.join([str(random.randint(0, 9)) for _ in range(4)])
            self.reference_number = f"BK-{date_str}-{random_suffix}"
            
            # Ensure uniqueness
            while Booking.objects.filter(reference_number=self.reference_number).exists():
                random_suffix = ''.join([str(random.randint(0, 9)) for _ in range(4)])
                self.reference_number = f"BK-{date_str}-{random_suffix}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference_number} - {self.pilgrim.user.name} - {self.package.trip.code}"
    
    def clean(self):
        """Validate booking requirements."""
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        
        if self.status == 'BOOKED':
            # Check passport exists and is valid
            passports = self.pilgrim.passports.all()
            if not passports.exists():
                raise ValidationError("Pilgrim must have a passport before booking")
            
            passport = passports.first()
            trip_end = self.package.trip.end_date
            if passport.expiry_date < trip_end:
                raise ValidationError(f"Passport expires before trip ends ({trip_end})")
            
            # Check capacity
            if self.package.capacity:
                booked_count = Booking.objects.filter(
                    package=self.package,
                    status='BOOKED'
                ).exclude(id=self.id).count()
                
                if booked_count >= self.package.capacity:
                    raise ValidationError(f"Package capacity ({self.package.capacity}) reached")

