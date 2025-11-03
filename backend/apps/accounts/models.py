from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from uuid import uuid4
from simple_history.models import HistoricalRecords


class AccountManager(BaseUserManager):
    """Manager for custom Account model."""
    
    def create_user(self, phone, name, password=None, **extra_fields):
        """Create and return a regular user."""
        if not phone:
            raise ValueError('Phone number is required')
        
        user = self.model(phone=phone, name=name, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, phone, name, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'STAFF')
        
        return self.create_user(phone, name, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin):
    """Custom user model for the system."""
    
    ROLE_CHOICES = [
        ('STAFF', 'Staff'),
        ('PILGRIM', 'Pilgrim'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=24, unique=True)
    email = models.EmailField(blank=True, null=True)
    name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = AccountManager()
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'accounts'
        verbose_name = 'Account'
        verbose_name_plural = 'Accounts'
    
    def __str__(self):
        return f"{self.name} ({self.phone})"


class StaffProfile(models.Model):
    """Profile for staff members."""
    
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('AGENT', 'Agent'),
        ('AUDITOR', 'Auditor'),
    ]
    
    user = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True, related_name='staff_profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    totp_secret = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'staff_profiles'
        verbose_name = 'Staff Profile'
        verbose_name_plural = 'Staff Profiles'
    
    def __str__(self):
        return f"{self.user.name} - {self.role}"


class PilgrimProfile(models.Model):
    """
    Pilgrim profile - can exist independently or be linked to a user account.
    
    Primary identifiers for pilgrims:
    - passport_number: Used for verification and future app login
    - phone: Used for OTP verification
    
    Pilgrims are created by staff manually and can later get app access.
    """
    
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    
    # Keep user as primary key for now (will be transitioned in next phase)
    user = models.OneToOneField(
        Account, 
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='pilgrim_profile'
    )
    
    # Identity (Primary identifiers for future independent pilgrim records)
    full_name = models.CharField(max_length=200, null=True, blank=True, help_text='Full name as on passport')
    passport_number = models.CharField(max_length=128, unique=True, null=True, blank=True, db_index=True, help_text='Encrypted passport number')
    phone = models.CharField(max_length=24, unique=True, null=True, blank=True, db_index=True, help_text='Phone number for OTP verification')
    
    # Bio Data
    dob = models.DateField(null=True, blank=True, help_text='Date of birth')
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, null=True, blank=True)
    nationality = models.CharField(max_length=2, null=True, blank=True, help_text='ISO 3166-1 alpha-2 country code')
    address = models.TextField(null=True, blank=True)
    
    # Emergency Contact
    emergency_name = models.CharField(max_length=120, null=True, blank=True)
    emergency_phone = models.CharField(max_length=24, null=True, blank=True)
    emergency_relationship = models.CharField(max_length=50, null=True, blank=True, help_text='Relationship to pilgrim')
    
    # Medical Information
    medical_conditions = models.TextField(null=True, blank=True, help_text='Medical conditions or special needs')
    
    # Audit
    created_by = models.ForeignKey(
        Account, 
        on_delete=models.PROTECT, 
        null=True,
        blank=True,
        related_name='created_pilgrims',
        help_text='Staff member who created this pilgrim'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'pilgrim_profiles'
        verbose_name = 'Pilgrim Profile'
        verbose_name_plural = 'Pilgrim Profiles'
        indexes = [
            models.Index(fields=['passport_number']),
            models.Index(fields=['phone']),
            models.Index(fields=['full_name']),
        ]
    
    def __str__(self):
        if self.full_name:
            return f"{self.full_name} ({self.passport_number or 'N/A'})"
        return f"{self.user.name}"
    
    def get_active_bookings(self):
        """Get all active bookings for this pilgrim."""
        return self.bookings.exclude(status='CANCELLED')


class OTPCode(models.Model):
    """OTP codes for authentication."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    phone = models.CharField(max_length=24, db_index=True)
    code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otp_codes'
        verbose_name = 'OTP Code'
        verbose_name_plural = 'OTP Codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.phone} - {self.code}"

