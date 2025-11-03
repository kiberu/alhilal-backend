"""
Common models shared across the application.
"""
from django.db import models
from uuid import uuid4


class Currency(models.Model):
    """Currency model to manage different currencies in the system."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=3, unique=True, help_text='ISO 4217 currency code (e.g., USD, UGX)')
    name = models.CharField(max_length=50, help_text='Full currency name (e.g., US Dollar, Ugandan Shilling)')
    symbol = models.CharField(max_length=10, help_text='Currency symbol (e.g., $, USh)')
    is_active = models.BooleanField(default=True, help_text='Whether this currency is currently in use')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'currencies'
        verbose_name = 'Currency'
        verbose_name_plural = 'Currencies'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    def __repr__(self):
        return f"<Currency: {self.code}>"

