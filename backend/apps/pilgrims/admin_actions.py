"""
Custom admin actions for Pilgrim/Visa management.
"""
from django.contrib import messages
from django.core.exceptions import ValidationError


def mark_visa_submitted(modeladmin, request, queryset):
    """
    Mark selected visas as SUBMITTED.
    """
    count = queryset.filter(status='PENDING').update(status='SUBMITTED')
    messages.success(request, f"Marked {count} visa(s) as SUBMITTED.")

mark_visa_submitted.short_description = "Mark as SUBMITTED"


def approve_visas(modeladmin, request, queryset):
    """
    Approve selected visas.
    
    Note: Requires doc_public_id, issue_date, and expiry_date to be set manually.
    """
    approved = 0
    errors = []
    
    for visa in queryset.filter(status='SUBMITTED'):
        try:
            visa.status = 'APPROVED'
            visa.clean()  # Validate
            visa.save()
            approved += 1
        except ValidationError as e:
            errors.append(f"{visa.pilgrim.user.name}: {', '.join(e.messages)}")
    
    if approved:
        messages.success(request, f"Approved {approved} visa(s).")
    
    if errors:
        for error in errors[:5]:
            messages.error(request, error)
        if len(errors) > 5:
            messages.warning(request, f"...and {len(errors) - 5} more errors.")

approve_visas.short_description = "Approve visas (requires doc + dates)"


def reject_visas(modeladmin, request, queryset):
    """
    Reject selected visas.
    """
    count = queryset.update(status='REJECTED')
    messages.success(request, f"Rejected {count} visa(s).")

reject_visas.short_description = "Reject visas"


def export_visa_status_csv(modeladmin, request, queryset):
    """
    Export visa status as CSV.
    """
    import csv
    from django.http import HttpResponse
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="visa_status.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Pilgrim Name', 'Phone', 'Email', 'Nationality',
        'Trip Code', 'Trip Name',
        'Visa Status', 'Ref Number', 
        'Issue Date', 'Expiry Date',
        'Created At', 'Updated At'
    ])
    
    for visa in queryset:
        pilgrim = visa.pilgrim
        user = pilgrim.user
        trip = visa.trip
        
        writer.writerow([
            user.name,
            user.phone,
            user.email or '',
            pilgrim.nationality or '',
            trip.code,
            trip.name,
            visa.status,
            visa.ref_no or '',
            visa.issue_date or '',
            visa.expiry_date or '',
            visa.created_at,
            visa.updated_at
        ])
    
    return response

export_visa_status_csv.short_description = "Export visa status as CSV"


def export_passports_csv(modeladmin, request, queryset):
    """
    Export passport list as CSV (with masked numbers).
    """
    import csv
    from django.http import HttpResponse
    from apps.common.encryption import mask_value
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="passports.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Pilgrim Name', 'Phone', 'Nationality',
        'Passport Number (Masked)', 'Country', 'Expiry Date',
        'Created At'
    ])
    
    for passport in queryset:
        pilgrim = passport.pilgrim
        user = pilgrim.user
        
        writer.writerow([
            user.name,
            user.phone,
            pilgrim.nationality or '',
            mask_value(passport.number),
            passport.country,
            passport.expiry_date,
            passport.created_at
        ])
    
    return response

export_passports_csv.short_description = "Export as CSV (masked)"

