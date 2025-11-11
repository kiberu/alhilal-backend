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
    currency = models.ForeignKey('common.Currency', on_delete=models.PROTECT, related_name='bookings', null=True, blank=True)
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
        """Generate reference number and set currency on creation."""
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
        
        # Always inherit currency from package
        if self.package and self.package.currency:
            self.currency = self.package.currency
        elif self.package and not self.package.currency:
            # If package doesn't have a currency, log warning
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Package {self.package.id} does not have a currency set. Booking {self.reference_number} may have currency issues.")
        
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

    def update_payment_status(self):
        """Update payment status and booking status based on total payments."""
        total_paid = self.payments.aggregate(
            total=models.Sum('amount_minor_units')
        )['total'] or 0
        
        self.amount_paid_minor_units = total_paid
        
        # Get package price
        package_price = self.package.price_minor_units or 0
        
        if total_paid == 0:
            self.payment_status = 'PENDING'
        elif total_paid >= package_price:
            self.payment_status = 'PAID'
        else:
            self.payment_status = 'PARTIAL'
        
        # Auto-upgrade booking status from EOI to BOOKED when payment is made
        if self.status == 'EOI' and total_paid > 0:
            self.status = 'BOOKED'
        
        self.save()


class Payment(models.Model):
    """Payment transaction model for tracking individual payments."""
    
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CREDIT_CARD', 'Credit Card'),
        ('DEBIT_CARD', 'Debit Card'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CHECK', 'Check'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount_minor_units = models.IntegerField(help_text='Amount in smallest currency unit (e.g., cents)')
    currency = models.ForeignKey('common.Currency', on_delete=models.PROTECT, related_name='payments', null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateField(help_text='Date payment was received')
    reference_number = models.CharField(max_length=100, blank=True, help_text='Transaction/Receipt reference')
    notes = models.TextField(blank=True, help_text='Additional payment notes')
    recorded_by = models.ForeignKey('accounts.Account', on_delete=models.PROTECT, related_name='recorded_payments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        amount = self.amount_minor_units / 100
        currency_code = self.currency.code if self.currency else 'N/A'
        return f"{self.booking.reference_number} - {currency_code} {amount:.2f} on {self.payment_date}"
    
    def save(self, *args, **kwargs):
        """Inherit currency from booking and update payment status."""
        # Always inherit currency from booking
        if self.booking and self.booking.currency and not self.currency:
            self.currency = self.booking.currency
        
        super().save(*args, **kwargs)
        self.booking.update_payment_status()
    
    def delete(self, *args, **kwargs):
        """Update booking payment status after deleting payment."""
        booking = self.booking
        super().delete(*args, **kwargs)
        booking.update_payment_status()
