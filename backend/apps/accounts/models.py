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
    """Profile for pilgrims."""
    
    user = models.OneToOneField(Account, on_delete=models.CASCADE, primary_key=True, related_name='pilgrim_profile')
    dob = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=2, null=True, blank=True)
    emergency_name = models.CharField(max_length=120, null=True, blank=True)
    emergency_phone = models.CharField(max_length=24, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Audit trail
    history = HistoricalRecords()
    
    class Meta:
        db_table = 'pilgrim_profiles'
        verbose_name = 'Pilgrim Profile'
        verbose_name_plural = 'Pilgrim Profiles'
    
    def __str__(self):
        return f"{self.user.name}"


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

