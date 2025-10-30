from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords
from apps.common.encryption import EncryptedCharField


class Passport(models.Model):
    """Passport information for pilgrims."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='passports')
    passport_no = EncryptedCharField(max_length=256, null=True, blank=True)  # Encrypted field
    number = EncryptedCharField(max_length=256)  # Primary field for backward compatibility
    issue_country = models.CharField(max_length=2, null=True, blank=True)
    country = models.CharField(max_length=2)  # Primary field for backward compatibility
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField()
    scanned_copy_public_id = models.CharField(max_length=160, null=True, blank=True)
    photo_public_id = models.CharField(max_length=160, null=True, blank=True)  # Alias
    photo_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'passports'
        verbose_name = 'Passport'
        verbose_name_plural = 'Passports'
    
    def __str__(self):
        return f"{self.pilgrim.user.name} - {self.country}"


class Visa(models.Model):
    """Visa information for pilgrims."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    pilgrim = models.ForeignKey('accounts.PilgrimProfile', on_delete=models.CASCADE, related_name='visas')
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE, related_name='visas')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    visa_no = models.CharField(max_length=40, null=True, blank=True)
    ref_no = models.CharField(max_length=40, null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    scanned_copy_public_id = models.CharField(max_length=160, null=True, blank=True)
    doc_public_id = models.CharField(max_length=160, null=True, blank=True)  # Alias
    doc_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'visas'
        verbose_name = 'Visa'
        verbose_name_plural = 'Visas'
    
    def __str__(self):
        return f"{self.pilgrim.user.name} - {self.trip.code} - {self.status}"
    
    def clean(self):
        """Validate visa approval requirements."""
        from django.core.exceptions import ValidationError
        
        if self.status == 'APPROVED':
            if not self.doc_public_id:
                raise ValidationError("Approved visa requires document upload")
            if not self.issue_date or not self.expiry_date:
                raise ValidationError("Approved visa requires issue and expiry dates")
            if self.issue_date and self.expiry_date and self.issue_date > self.expiry_date:
                raise ValidationError("Issue date must be before expiry date")

