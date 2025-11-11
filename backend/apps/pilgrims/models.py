from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords


class Document(models.Model):
    """Unified document storage for pilgrims (passports, visas, vaccinations, etc.)."""
    
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

