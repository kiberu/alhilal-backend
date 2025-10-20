"""
Tests for pilgrims models.
"""
import pytest
from django.core.exceptions import ValidationError
from apps.pilgrims.models import Passport, Visa
from apps.common.encryption import mask_value
from datetime import date, timedelta


@pytest.mark.django_db
class TestPassportModel:
    """Tests for Passport model."""
    
    def test_create_passport(self, passport):
        """Test creating a passport."""
        assert passport.number == "AB1234567"
        assert passport.country == "UG"
        assert passport.expiry_date > date.today()
    
    def test_passport_encryption(self, pilgrim_user):
        """Test that passport numbers are encrypted."""
        from apps.pilgrims.models import Passport
        
        # Create passport with plain number
        passport = Passport.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            number="CD9876543",
            country="KE",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        # Retrieve from database
        passport_from_db = Passport.objects.get(id=passport.id)
        
        # Should decrypt automatically
        assert passport_from_db.number == "CD9876543"
    
    def test_passport_masking(self, passport):
        """Test passport number masking."""
        masked = mask_value(passport.number, visible_chars=4)
        assert masked.endswith("4567")
        assert "*" in masked
    
    def test_passport_str(self, passport):
        """Test passport string representation."""
        assert "Test Pilgrim" in str(passport)
        assert "UG" in str(passport)
    
    def test_passport_history(self, passport):
        """Test passport audit trail."""
        # Update passport
        passport.country = "TZ"
        passport.save()
        
        # Check history
        history = passport.history.all()
        assert history.count() >= 1


@pytest.mark.django_db
class TestVisaModel:
    """Tests for Visa model."""
    
    def test_create_visa(self, visa):
        """Test creating a visa."""
        assert visa.status == "PENDING"
        assert visa.pilgrim is not None
        assert visa.trip is not None
    
    def test_visa_status_transitions(self, visa):
        """Test visa status transitions."""
        assert visa.status == "PENDING"
        
        visa.status = "SUBMITTED"
        visa.save()
        assert visa.status == "SUBMITTED"
        
        visa.status = "APPROVED"
        visa.issue_date = date.today()
        visa.expiry_date = date.today() + timedelta(days=90)
        visa.doc_public_id = "visas/test123"
        visa.save()
        assert visa.status == "APPROVED"
    
    def test_visa_approval_validation(self, visa):
        """Test that APPROVED visa requires doc and dates."""
        visa.status = "APPROVED"
        
        # Should fail without doc and dates
        with pytest.raises(ValidationError) as exc_info:
            visa.clean()
        
        assert "document" in str(exc_info.value).lower()
    
    def test_visa_date_validation(self, visa):
        """Test visa date validation."""
        visa.status = "APPROVED"
        visa.doc_public_id = "visas/test"
        visa.issue_date = date.today()
        visa.expiry_date = date.today() - timedelta(days=1)  # Invalid: expiry before issue
        
        with pytest.raises(ValidationError):
            visa.clean()
    
    def test_visa_str(self, visa):
        """Test visa string representation."""
        assert "Test Pilgrim" in str(visa)
        assert "UMRAH2025" in str(visa)
        assert "PENDING" in str(visa)
    
    def test_visa_history(self, visa):
        """Test visa audit trail."""
        # Update visa
        visa.status = "SUBMITTED"
        visa.save()
        
        # Check history
        history = visa.history.all()
        assert history.count() >= 1

