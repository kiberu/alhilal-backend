"""
Tests for pilgrims models.
"""
import pytest
from django.core.exceptions import ValidationError
from apps.pilgrims.models import Document
from apps.common.encryption import mask_value
from datetime import date, timedelta


@pytest.mark.django_db
class TestDocumentPassportModel:
    """Tests for passport documents."""
    
    def test_create_passport(self, passport):
        """Test creating a passport."""
        assert passport.document_type == "PASSPORT"
        assert passport.document_number == "AB1234567"
        assert passport.issuing_country == "UG"
        assert passport.expiry_date > date.today()
    
    def test_passport_document_number_persists(self, pilgrim_user):
        """Test that document numbers persist correctly."""
        passport = Document.objects.create(
            pilgrim=pilgrim_user.pilgrim_profile,
            document_type="PASSPORT",
            title="Passport - Kenya",
            document_number="CD9876543",
            issuing_country="KE",
            file_public_id="documents/passport_kenya",
            expiry_date=date.today() + timedelta(days=365)
        )
        
        # Retrieve from database
        passport_from_db = Document.objects.get(id=passport.id)
        
        assert passport_from_db.document_number == "CD9876543"
    
    def test_passport_masking(self, passport):
        """Test passport number masking."""
        masked = mask_value(passport.document_number, visible_chars=4)
        assert masked.endswith("4567")
        assert "*" in masked
    
    def test_passport_str(self, passport):
        """Test passport string representation."""
        assert "Test Pilgrim" in str(passport)
        assert "Passport - Uganda" in str(passport)
    
    def test_passport_history(self, passport):
        """Test passport audit trail."""
        # Update passport
        passport.issuing_country = "TZ"
        passport.save()
        
        # Check history
        history = passport.history.all()
        assert history.count() >= 1


@pytest.mark.django_db
class TestVisaDocumentModel:
    """Tests for visa documents."""
    
    def test_create_visa(self, visa):
        """Test creating a visa."""
        assert visa.status == "PENDING"
        assert visa.pilgrim is not None
        assert visa.trip is not None
        assert visa.document_type == "VISA"
    
    def test_visa_status_transitions(self, visa):
        """Test visa status transitions."""
        assert visa.status == "PENDING"
        
        visa.status = "VERIFIED"
        visa.save()
        assert visa.status == "VERIFIED"

    def test_visa_date_validation(self, visa):
        """Test visa date validation."""
        visa.issue_date = date.today()
        visa.issue_date = date.today()
        visa.expiry_date = date.today() - timedelta(days=1)  # Invalid: expiry before issue
        
        with pytest.raises(ValidationError):
            visa.clean()
    
    def test_visa_str(self, visa):
        """Test visa string representation."""
        assert "Test Pilgrim" in str(visa)
        assert "Umrah 2025 - May" in str(visa)
    
    def test_visa_history(self, visa):
        """Test visa audit trail."""
        # Update visa
        visa.status = "REJECTED"
        visa.save()
        
        # Check history
        history = visa.history.all()
        assert history.count() >= 1
