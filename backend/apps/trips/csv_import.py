"""
CSV import utilities for Trip admin.
"""
import csv
from io import StringIO
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db import transaction

Account = get_user_model()


def import_pilgrims_from_csv(modeladmin, request):
    """
    Import pilgrims from CSV file.
    
    Expected CSV format:
    name,phone,email,dob,nationality,emergency_name,emergency_phone
    
    Creates:
    - Account (if not exists)
    - PilgrimProfile (if not exists)
    """
    if request.method == 'POST' and request.FILES.get('csv_file'):
        csv_file = request.FILES['csv_file']
        
        # Decode CSV
        decoded_file = csv_file.read().decode('utf-8')
        io_string = StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        created = 0
        updated = 0
        errors = []
        
        try:
            with transaction.atomic():
                for row in reader:
                    try:
                        # Get or create account
                        phone = row['phone'].strip()
                        user, user_created = Account.objects.get_or_create(
                            phone=phone,
                            defaults={
                                'name': row.get('name', '').strip() or f'Pilgrim {phone[-4:]}',
                                'email': row.get('email', '').strip() or None,
                                'role': 'PILGRIM',
                                'is_active': True
                            }
                        )
                        
                        # Get or create profile
                        from apps.accounts.models import PilgrimProfile
                        from datetime import datetime
                        
                        profile, profile_created = PilgrimProfile.objects.get_or_create(
                            user=user,
                            defaults={}
                        )
                        
                        # Update profile fields
                        if row.get('dob'):
                            try:
                                profile.dob = datetime.strptime(row['dob'], '%Y-%m-%d').date()
                            except ValueError:
                                pass
                        
                        if row.get('nationality'):
                            profile.nationality = row['nationality'].strip()[:2].upper()
                        
                        if row.get('emergency_name'):
                            profile.emergency_name = row['emergency_name'].strip()
                        
                        if row.get('emergency_phone'):
                            profile.emergency_phone = row['emergency_phone'].strip()
                        
                        profile.save()
                        
                        if user_created and profile_created:
                            created += 1
                        else:
                            updated += 1
                            
                    except Exception as e:
                        errors.append(f"Row {reader.line_num}: {str(e)}")
            
            # Report results
            if created:
                messages.success(request, f"Created {created} new pilgrim(s).")
            if updated:
                messages.info(request, f"Updated {updated} existing pilgrim(s).")
            if errors:
                for error in errors[:5]:
                    messages.error(request, error)
                if len(errors) > 5:
                    messages.warning(request, f"...and {len(errors) - 5} more errors.")
                    
        except Exception as e:
            messages.error(request, f"Import failed: {str(e)}")
    
    return None

