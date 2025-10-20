from django.db import models
from uuid import uuid4


class Dua(models.Model):
    """Duas for pilgrims."""
    
    CATEGORY_CHOICES = [
        ('TAWAF', 'Tawaf'),
        ('SAI', 'Sai'),
        ('ARAFAT', 'Arafat'),
        ('GENERAL', 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    category = models.CharField(max_length=12, choices=CATEGORY_CHOICES)
    text_ar = models.TextField()
    text_en = models.TextField(null=True, blank=True)
    transliteration = models.TextField(null=True, blank=True)
    source = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'duas'
        verbose_name = 'Dua'
        verbose_name_plural = 'Duas'
    
    def __str__(self):
        return f"{self.category} - {self.text_ar[:50]}"


class NotificationLog(models.Model):
    """Log of notifications (MVP - no actual sending)."""
    
    SCOPE_CHOICES = [
        ('TRIP', 'Trip'),
        ('PACKAGE', 'Package'),
        ('USER', 'User'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    scope = models.CharField(max_length=10, choices=SCOPE_CHOICES)
    scope_id = models.UUIDField()
    title = models.CharField(max_length=200)
    message = models.TextField()
    scheduled_at = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    count_sent = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_logs'
        verbose_name = 'Notification Log'
        verbose_name_plural = 'Notification Logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.scope} - {self.title}"

