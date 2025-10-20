"""
Custom admin views for Trip management.
"""
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from .csv_import import import_pilgrims_from_csv


@staff_member_required
def import_pilgrims_view(request):
    """
    View for importing pilgrims from CSV.
    """
    if request.method == 'POST':
        import_pilgrims_from_csv(None, request)
        return redirect('admin:accounts_pilgrimprofile_changelist')
    
    context = {
        'title': 'Import Pilgrims from CSV',
        'instructions': '''
        <h3>CSV Format</h3>
        <p>Your CSV file should have the following columns:</p>
        <ul>
            <li><strong>name</strong> - Pilgrim's full name (required)</li>
            <li><strong>phone</strong> - Phone number with country code, e.g. +256712345678 (required)</li>
            <li><strong>email</strong> - Email address (optional)</li>
            <li><strong>dob</strong> - Date of birth in YYYY-MM-DD format (optional)</li>
            <li><strong>nationality</strong> - 2-letter country code, e.g. UG (optional)</li>
            <li><strong>emergency_name</strong> - Emergency contact name (optional)</li>
            <li><strong>emergency_phone</strong> - Emergency contact phone (optional)</li>
        </ul>
        
        <h3>Example CSV</h3>
        <pre>
name,phone,email,dob,nationality,emergency_name,emergency_phone
John Doe,+256712345678,john@example.com,1990-01-15,UG,Jane Doe,+256712345679
Mary Smith,+256700123456,mary@example.com,1985-03-20,KE,Bob Smith,+256700123457
        </pre>
        '''
    }
    
    return render(request, 'admin/csv_import.html', context)

