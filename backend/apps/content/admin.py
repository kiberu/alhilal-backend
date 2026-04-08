from django.contrib import admin
from .models import Dua, GuidanceArticle, NotificationLog


@admin.register(Dua)
class DuaAdmin(admin.ModelAdmin):
    """Admin for Dua model."""
    
    list_display = ['category', 'text_ar', 'created_at']
    list_filter = ['category']
    search_fields = ['text_ar', 'text_en']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    """Admin for NotificationLog model."""
    
    list_display = ['scope', 'title', 'scheduled_at', 'sent_at', 'count_sent']
    list_filter = ['scope', 'sent_at']
    search_fields = ['title', 'message']
    readonly_fields = ['created_at']


@admin.register(GuidanceArticle)
class GuidanceArticleAdmin(admin.ModelAdmin):
    """Admin for guidance article content."""

    list_display = [
        'title',
        'slug',
        'category',
        'featured',
        'featured_order',
        'published_at',
        'author',
    ]
    list_filter = ['featured', 'category', 'published_at']
    search_fields = ['title', 'slug', 'description', 'category']
    readonly_fields = ['created_at', 'updated_at']
