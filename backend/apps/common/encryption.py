"""
Field-level encryption utilities using Fernet (symmetric encryption).
"""
from django.conf import settings
from cryptography.fernet import Fernet
from django.db import models


class EncryptedCharField(models.CharField):
    """
    CharField that automatically encrypts/decrypts data.
    
    Usage:
        number = EncryptedCharField(max_length=64)
    
    The encryption key should be set in settings.FIELD_ENCRYPTION_KEY.
    Generate a key with: Fernet.generate_key().decode()
    """
    
    description = "Encrypted CharField"
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Validate encryption key exists
        if not hasattr(settings, 'FIELD_ENCRYPTION_KEY') or not settings.FIELD_ENCRYPTION_KEY:
            raise ValueError(
                "FIELD_ENCRYPTION_KEY must be set in settings. "
                "Generate with: from cryptography.fernet import Fernet; Fernet.generate_key().decode()"
            )
    
    def get_cipher(self):
        """Get Fernet cipher instance."""
        key = settings.FIELD_ENCRYPTION_KEY
        if isinstance(key, str):
            key = key.encode()
        return Fernet(key)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt value when loading from database."""
        if value is None:
            return value
        
        try:
            cipher = self.get_cipher()
            decrypted = cipher.decrypt(value.encode())
            return decrypted.decode()
        except Exception as e:
            # Log error but don't expose sensitive data
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to decrypt field: {type(e).__name__}")
            return "***DECRYPTION_ERROR***"
    
    def to_python(self, value):
        """Convert value to Python string."""
        if isinstance(value, str) or value is None:
            return value
        return str(value)
    
    def get_prep_value(self, value):
        """Encrypt value before saving to database."""
        if value is None:
            return value
        
        # If already encrypted (starts with gAAAAA which is Fernet token prefix)
        # don't re-encrypt
        if isinstance(value, str) and value.startswith('gAAAAA'):
            return value
        
        try:
            cipher = self.get_cipher()
            encrypted = cipher.encrypt(str(value).encode())
            return encrypted.decode()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to encrypt field: {type(e).__name__}")
            raise


def encrypt_value(value: str) -> str:
    """
    Manually encrypt a value.
    
    Args:
        value: Plain text string to encrypt
        
    Returns:
        Encrypted string
    """
    if not value:
        return value
    
    key = settings.FIELD_ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()
    
    cipher = Fernet(key)
    encrypted = cipher.encrypt(value.encode())
    return encrypted.decode()


def decrypt_value(encrypted_value: str) -> str:
    """
    Manually decrypt a value.
    
    Args:
        encrypted_value: Encrypted string
        
    Returns:
        Decrypted plain text string
    """
    if not encrypted_value:
        return encrypted_value
    
    key = settings.FIELD_ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()
    
    cipher = Fernet(key)
    decrypted = cipher.decrypt(encrypted_value.encode())
    return decrypted.decode()


def mask_value(value: str, visible_chars: int = 4) -> str:
    """
    Mask a value for display purposes.
    
    Args:
        value: Value to mask
        visible_chars: Number of characters to show at end
        
    Returns:
        Masked string (e.g., "****1234")
    """
    if not value or len(value) <= visible_chars:
        return '*' * len(value) if value else ''
    
    mask_length = len(value) - visible_chars
    return '*' * mask_length + value[-visible_chars:]

