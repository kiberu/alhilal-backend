from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords


class Booking(models.Model):
    """Booking model linking pilgrims to trip packages."""
    
    STATUS_CHOICES = [
        ('EOI', 'Expression of Interest'),
        ('BOOKED', 'Booked'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='bookings')
    package = models.ForeignKey('trips.TripPackage', on_delete=models.PROTECT, related_name='bookings')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='EOI')
    payment_note = models.TextField(null=True, blank=True)
    ticket_number = models.CharField(max_length=32, null=True, blank=True)
    room_assignment = models.CharField(max_length=64, null=True, blank=True)
    special_needs = models.TextField(null=True, blank=True)
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
    
    def __str__(self):
        return f"{self.pilgrim.user.name} - {self.package.trip.code} - {self.status}"
    
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

