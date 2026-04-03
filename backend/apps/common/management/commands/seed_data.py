"""
Django management command to seed the database with sample data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear  # Clear existing data first
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta, time, datetime
import random

Account = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with sample data for testing and demonstration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('🌱 Starting Database Seeding'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('')

        if options['clear']:
            self.clear_data()

        # Seed in order
        self.create_staff_users()
        self.create_pilgrims()
        self.create_trips()
        self.create_duas()
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('✅ Database Seeding Complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('')
        self.stdout.write('📍 Access Points:')
        self.stdout.write('  Admin: http://localhost/admin/')
        self.stdout.write('  API: http://localhost/api/v1/docs/')
        self.stdout.write('')
        self.stdout.write('👤 Test Accounts:')
        self.stdout.write('  Staff: +256700000001 / password: admin123')
        self.stdout.write('  Pilgrim: +256712000001 / Use OTP authentication')
        self.stdout.write('')

    def clear_data(self):
        """Clear existing data (except superusers)"""
        from apps.trips.models import Trip
        from apps.bookings.models import Booking
        from apps.pilgrims.models import Document
        from apps.content.models import Dua
        
        self.stdout.write('🗑️  Clearing existing data...')
        
        Trip.objects.all().delete()
        Booking.objects.all().delete()
        Document.objects.all().delete()
        Dua.objects.all().delete()
        Account.objects.filter(is_superuser=False).delete()
        
        self.stdout.write(self.style.SUCCESS('   ✓ Data cleared'))
        self.stdout.write('')

    def create_staff_users(self):
        """Create sample staff users"""
        from apps.accounts.models import StaffProfile
        
        self.stdout.write('👥 Creating staff users...')
        
        staff_data = [
            {
                'phone': '+256700000001',
                'name': 'Admin Staff',
                'email': 'admin@alhilal.com',
                'role': 'ADMIN'
            },
            {
                'phone': '+256700000002',
                'name': 'Agent Staff',
                'email': 'agent@alhilal.com',
                'role': 'AGENT'
            },
        ]
        
        for data in staff_data:
            role = data.pop('role')
            user, created = Account.objects.get_or_create(
                phone=data['phone'],
                defaults={
                    **data,
                    'role': 'STAFF',
                    'is_staff': True,
                }
            )
            if created:
                user.set_password('admin123')
                user.save()
                
                StaffProfile.objects.create(
                    user=user,
                    role=role
                )
                self.stdout.write(f'   ✓ Created staff: {data["name"]} ({data["phone"]})')
            else:
                self.stdout.write(f'   - Staff exists: {data["name"]}')
        
        self.stdout.write('')

    def create_pilgrims(self):
        """Create sample pilgrims with profiles and passports"""
        from apps.accounts.models import PilgrimProfile
        from apps.pilgrims.models import Document
        
        self.stdout.write('🧳 Creating pilgrims...')
        
        pilgrims_data = [
            {
                'phone': '+256712000001',
                'name': 'John Doe',
                'email': 'john@example.com',
                'dob': date(1990, 5, 15),
                'nationality': 'UG',
                'passport': 'AB1234567'
            },
            {
                'phone': '+256712000002',
                'name': 'Mary Smith',
                'email': 'mary@example.com',
                'dob': date(1985, 8, 20),
                'nationality': 'UG',
                'passport': 'CD7654321'
            },
            {
                'phone': '+256712000003',
                'name': 'David Brown',
                'email': 'david@example.com',
                'dob': date(1992, 3, 10),
                'nationality': 'KE',
                'passport': 'EF9876543'
            },
            {
                'phone': '+256712000004',
                'name': 'Sarah Johnson',
                'email': 'sarah@example.com',
                'dob': date(1988, 11, 25),
                'nationality': 'TZ',
                'passport': 'GH5432109'
            },
            {
                'phone': '+256712000005',
                'name': 'Ahmed Hassan',
                'email': 'ahmed@example.com',
                'dob': date(1995, 7, 8),
                'nationality': 'UG',
                'passport': 'IJ3456789'
            },
        ]
        
        for data in pilgrims_data:
            passport_number = data.pop('passport')
            dob = data.pop('dob')
            nationality = data.pop('nationality')
            
            user, created = Account.objects.get_or_create(
                phone=data['phone'],
                defaults={
                    **data,
                    'role': 'PILGRIM',
                }
            )
            
            if created:
                profile = PilgrimProfile.objects.create(
                    user=user,
                    full_name=data['name'],
                    phone=data['phone'],
                    passport_number=passport_number,
                    dob=dob,
                    nationality=nationality,
                    emergency_name=f'{data["name"].split()[0]} Emergency',
                    emergency_phone=f'+25670{random.randint(1000000, 9999999)}'
                )
                
                Document.objects.create(
                    pilgrim=profile,
                    document_type='PASSPORT',
                    title=f'Passport - {nationality}',
                    document_number=passport_number,
                    issuing_country=nationality,
                    file_public_id=f'documents/passport_{passport_number.lower()}',
                    expiry_date=date.today() + timedelta(days=365*3)  # 3 years
                )
                
                self.stdout.write(f'   ✓ Created pilgrim: {data["name"]} ({data["phone"]})')
            else:
                self.stdout.write(f'   - Pilgrim exists: {data["name"]}')
        
        self.stdout.write('')

    def create_trips(self):
        """Seed 2026-2027 Umrah calendar trips and package metadata."""
        from apps.trips.models import (
            Trip, TripPackage, PackageFlight, PackageHotel,
            TripUpdate, TripGuideSection, ChecklistItem,
            EmergencyContact, TripFAQ
        )
        from apps.common.models import Currency
        
        self.stdout.write('✈️  Creating trips...')
        currencies = {}
        for code, name, symbol in [
            ('UGX', 'Ugandan Shilling', 'USh'),
            ('USD', 'US Dollar', '$'),
        ]:
            currency, _ = Currency.objects.get_or_create(
                code=code,
                defaults={'name': name, 'symbol': symbol},
            )
            currencies[code] = currency

        # Source: UMRAH CALENDER 2026-2027.pdf (normalized for obvious year typos)
        calendar_rows = [
            {
                'code': 'UMR26JULFEN',
                'family_code': '2026-JUL-FFENNA',
                'label': 'July 2026',
                'name': 'July Ffenna Umrah',
                'start_date': date(2026, 7, 12),
                'end_date': date(2026, 7, 21),
                'status': 'PREPARATION',
                'nights': 8,
                'airline': 'ET',
                'madinah_hotel': 'Araek Taibah',
                'makkah_hotel': 'Infinity',
                'price_minor_units': 4650000,
                'currency': 'UGX',
                'sales_target': 70,
                'hotel_booking_month': 'JUNE',
                'airline_booking_month': 'MARCH',
            },
            {
                'code': 'UMR26AUG',
                'family_code': '2026-AUG',
                'label': 'August 2026',
                'name': 'August Umrah',
                'start_date': date(2026, 8, 20),
                'end_date': date(2026, 8, 29),
                'status': 'OPEN_FOR_SALES',
                'nights': 8,
                'airline': 'QATAR',
                'madinah_hotel': 'Maysan',
                'makkah_hotel': 'Swiis Hotel',
                'price_minor_units': 2050,
                'currency': 'USD',
                'sales_target': 20,
                'hotel_booking_month': '',
                'airline_booking_month': '',
            },
            {
                'code': 'UMR26SEP',
                'family_code': '2026-SEP',
                'label': 'September 2026',
                'name': 'September Umrah',
                'start_date': date(2026, 9, 20),
                'end_date': date(2026, 9, 28),
                'status': 'OPEN_FOR_SALES',
                'nights': 8,
                'airline': 'FLY DUBAI/ET',
                'madinah_hotel': 'Concord Hotel',
                'makkah_hotel': 'Al Masa Grand',
                'price_minor_units': 1650,
                'currency': 'USD',
                'sales_target': 20,
                'hotel_booking_month': '',
                'airline_booking_month': '',
            },
            {
                'code': 'UMR26OCTIND',
                'family_code': '2026-OCT-INDEPENDENCE',
                'label': 'October 2026',
                'name': 'Independence Umrah',
                'start_date': date(2026, 10, 8),
                'end_date': date(2026, 10, 15),
                'status': 'OPEN_FOR_SALES',
                'nights': 7,
                'airline': 'ET/FD',
                'madinah_hotel': 'Golden Tulip',
                'makkah_hotel': 'Vocco / Infinity',
                'price_minor_units': 4910000,
                'currency': 'UGX',
                'sales_target': 30,
                'hotel_booking_month': '',
                'airline_booking_month': '',
            },
            {
                'code': 'UMR26NOV',
                'family_code': '2026-NOV',
                'label': 'November 2026',
                'name': 'November Umrah',
                'start_date': date(2026, 11, 28),
                'end_date': date(2026, 12, 5),
                'status': 'OPEN_FOR_SALES',
                'nights': 8,
                'airline': 'QATAR',
                'madinah_hotel': 'Maysan',
                'makkah_hotel': 'Anjum',
                'price_minor_units': 1950,
                'currency': 'USD',
                'sales_target': 20,
                'hotel_booking_month': '',
                'airline_booking_month': '',
            },
            {
                'code': 'UMR26DECSUPA',
                'family_code': '2026-DEC',
                'label': 'December 2026',
                'name': 'December Supa Umrah',
                'start_date': date(2026, 12, 24),
                'end_date': date(2027, 1, 2),
                'status': 'OPEN_FOR_SALES',
                'nights': 9,
                'airline': 'QATAR',
                'madinah_hotel': 'Concord Hotel',
                'makkah_hotel': 'Al Masa Grand',
                'price_minor_units': 1950,
                'currency': 'USD',
                'sales_target': None,
                'hotel_booking_month': 'JUNE',
                'airline_booking_month': 'APRIL',
            },
            {
                'code': 'UMR26DECPJED',
                'family_code': '2026-DEC-PREMIUM',
                'label': 'December 2026',
                'name': 'December Premium / Jeddah Trip',
                'start_date': date(2026, 12, 24),
                'end_date': date(2027, 1, 3),
                'status': 'OPEN_FOR_SALES',
                'nights': 9,
                'airline': 'QATAR',
                'madinah_hotel': 'Maysan',
                'makkah_hotel': 'Swiis Hotel',
                'price_minor_units': 2650,
                'currency': 'USD',
                'sales_target': 35,
                'hotel_booking_month': 'JUNE',
                'airline_booking_month': 'APRIL',
            },
            {
                'code': 'UMR26DECPQAT',
                'family_code': '2026-DEC-PREMIUM',
                'label': 'December 2026',
                'name': 'December Premium / Qatar Tour',
                'start_date': date(2026, 12, 24),
                'end_date': date(2027, 1, 5),
                'status': 'OPEN_FOR_SALES',
                'nights': 12,
                'airline': 'QATAR',
                'madinah_hotel': 'Maysan',
                'makkah_hotel': 'Swiis Hotel',
                'price_minor_units': 3300,
                'currency': 'USD',
                'sales_target': None,
                'hotel_booking_month': 'JUNE',
                'airline_booking_month': 'APRIL',
            },
            {
                'code': 'UMR27JAN',
                'family_code': '2027-JAN',
                'label': 'January 2027',
                'name': 'January Umrah 2027',
                'start_date': date(2027, 1, 15),
                'end_date': date(2027, 1, 23),
                'status': 'OPEN_FOR_SALES',
                'nights': 8,
                'airline': 'ET',
                'madinah_hotel': 'Golden Tulip',
                'makkah_hotel': 'Al Masa Grand',
                'price_minor_units': 1750,
                'currency': 'USD',
                'sales_target': 25,
                'hotel_booking_month': 'NOVEMBER',
                'airline_booking_month': '',
            },
            {
                'code': 'UMR27HIJJA',
                'family_code': '2027-HIJJA',
                'label': 'Hijja 2027',
                'name': 'Hijja 2027',
                'start_date': date(2027, 5, 14),
                'end_date': date(2027, 5, 19),
                'status': 'PLANNING',
                'nights': 20,
                'airline': 'FD/ET',
                'madinah_hotel': '',
                'makkah_hotel': '',
                'price_minor_units': 6100,
                'currency': 'USD',
                'sales_target': 30,
                'hotel_booking_month': 'JULY',
                'airline_booking_month': 'MAY',
            },
            {
                'code': 'UMR27RAMEARLY',
                'family_code': '2027-RAMADHAN',
                'label': 'Early Ramadhan 2027',
                'name': 'Early Ramadhan Umrah',
                'start_date': date(2027, 2, 13),
                'end_date': date(2027, 2, 21),
                'status': 'PLANNING',
                'nights': 8,
                'airline': '',
                'madinah_hotel': 'Maysan',
                'makkah_hotel': 'Anjum',
                'price_minor_units': 1850,
                'currency': 'USD',
                'sales_target': 20,
                'hotel_booking_month': 'JULY',
                'airline_booking_month': 'MAY',
            },
            {
                'code': 'UMR27RAM',
                'family_code': '2027-RAMADHAN',
                'label': 'Ramadhan 2027',
                'name': 'Ramadhan Umrah',
                'start_date': date(2027, 2, 23),
                'end_date': date(2027, 3, 8),
                'status': 'PLANNING',
                'nights': 14,
                'airline': 'FD/ET',
                'madinah_hotel': 'Golden Tulip',
                'makkah_hotel': 'Tara Ajyad',
                'price_minor_units': 7850000,
                'currency': 'UGX',
                'sales_target': 40,
                'hotel_booking_month': 'JULY',
                'airline_booking_month': 'MAY',
            },
            {
                'code': 'UMR27RAMPREM',
                'family_code': '2027-RAMADHAN',
                'label': 'Ramadhan 2027',
                'name': 'Premium Ramadhan Umrah',
                'start_date': date(2027, 2, 23),
                'end_date': date(2027, 3, 8),
                'status': 'PLANNING',
                'nights': 14,
                'airline': 'QATAR',
                'madinah_hotel': 'Concord Hotel',
                'makkah_hotel': 'Al Masa Grand',
                'price_minor_units': 3350,
                'currency': 'USD',
                'sales_target': 20,
                'hotel_booking_month': 'JULY',
                'airline_booking_month': 'MAY',
            },
        ]

        for row in calendar_rows:
            excerpt = (
                f"{row['name']} - {row['start_date'].strftime('%d %b %Y')} to "
                f"{row['end_date'].strftime('%d %b %Y')}"
            )
            trip, created = Trip.objects.get_or_create(
                code=row['code'],
                defaults={
                    'family_code': row['family_code'],
                    'commercial_month_label': row['label'],
                    'name': row['name'],
                    'excerpt': excerpt,
                    'seo_title': f"Al Hilal {row['name']}",
                    'seo_description': excerpt,
                    'cities': ['Makkah', 'Madinah'],
                    'status': row['status'],
                    'start_date': row['start_date'],
                    'end_date': row['end_date'],
                    'default_nights': row['nights'],
                    'visibility': 'PUBLIC',
                    'featured': row['code'] == 'UMR26JULFEN',
                    'operator_notes': 'Seeded from UMRAH CALENDER 2026-2027 source.',
                },
            )

            if created:
                self.stdout.write(f"   ✓ Created trip: {trip.name}")
            else:
                self.stdout.write(f"   - Trip exists: {trip.name}")

            package, package_created = TripPackage.objects.get_or_create(
                trip=trip,
                package_code=f"{row['code']}-STD",
                defaults={
                    'name': 'Standard Package',
                    'nights': row['nights'],
                    'price_minor_units': row['price_minor_units'],
                    'currency': currencies[row['currency']],
                    'capacity': row['sales_target'],
                    'sales_target': row['sales_target'],
                    'hotel_booking_month': row['hotel_booking_month'],
                    'airline_booking_month': row['airline_booking_month'],
                    'status': 'SELLING' if row['status'] == 'OPEN_FOR_SALES' else 'DRAFT',
                    'visibility': 'PUBLIC',
                },
            )

            if package_created:
                self.stdout.write('     ✓ Created package')
            else:
                self.stdout.write('     - Package exists')

            if package_created and row['airline']:
                outbound_dt = timezone.make_aware(datetime.combine(trip.start_date, time(3, 0)))
                return_dt = timezone.make_aware(datetime.combine(trip.end_date, time(18, 0)))
                carrier = row['airline'].split('/')[0][:8]
                group_code = row['code'][-6:]

                PackageFlight.objects.get_or_create(
                    package=package,
                    leg='OUTBOUND',
                    dep_airport='EBB',
                    arr_airport='JED',
                    defaults={
                        'carrier': carrier,
                        'flight_no': f'{group_code}1',
                        'dep_dt': outbound_dt,
                        'arr_dt': outbound_dt + timedelta(hours=5),
                        'group_pnr': f'{group_code}OUT',
                    },
                )
                PackageFlight.objects.get_or_create(
                    package=package,
                    leg='RETURN',
                    dep_airport='JED',
                    arr_airport='EBB',
                    defaults={
                        'carrier': carrier,
                        'flight_no': f'{group_code}2',
                        'dep_dt': return_dt,
                        'arr_dt': return_dt + timedelta(hours=5),
                        'group_pnr': f'{group_code}RET',
                    },
                )

            if package_created and (row['madinah_hotel'] or row['makkah_hotel']):
                trip_span_days = max((trip.end_date - trip.start_date).days, 2)
                mid_date = trip.start_date + timedelta(days=max(trip_span_days // 2, 1))
                if mid_date >= trip.end_date:
                    mid_date = trip.end_date - timedelta(days=1)

                if row['madinah_hotel']:
                    PackageHotel.objects.get_or_create(
                        package=package,
                        name=row['madinah_hotel'],
                        check_in=trip.start_date,
                        check_out=mid_date,
                        defaults={
                            'address': 'Madinah, Saudi Arabia',
                            'room_type': 'Standard',
                        },
                    )
                if row['makkah_hotel']:
                    PackageHotel.objects.get_or_create(
                        package=package,
                        name=row['makkah_hotel'],
                        check_in=mid_date,
                        check_out=trip.end_date,
                        defaults={
                            'address': 'Makkah, Saudi Arabia',
                            'room_type': 'Standard',
                        },
                    )

        # Add lightweight support content for the featured departure.
        featured_trip = Trip.objects.filter(code='UMR26JULFEN').first()
        if featured_trip:
            TripGuideSection.objects.get_or_create(
                trip=featured_trip,
                order=1,
                title='Core Packing Checklist',
                defaults={
                    'content_md': (
                        "- Ihram clothing\n"
                        "- Valid passport and visa copy\n"
                        "- Personal medication\n"
                        "- Comfortable walking footwear"
                    )
                },
            )
            ChecklistItem.objects.get_or_create(
                trip=featured_trip,
                label='Valid passport (6+ months)',
                category='DOCS',
                defaults={'is_required': True},
            )
            EmergencyContact.objects.get_or_create(
                trip=featured_trip,
                label='Al Hilal Operations',
                phone='+256700000001',
                defaults={'hours': '24/7', 'notes': 'Main support line'},
            )
            TripFAQ.objects.get_or_create(
                trip=featured_trip,
                order=1,
                question='When should I submit my travel documents?',
                defaults={
                    'answer': 'Submit as early as possible after booking to avoid visa processing delays.'
                },
            )
            TripUpdate.objects.get_or_create(
                trip=featured_trip,
                title='2026-2027 Calendar Seeded',
                defaults={
                    'body_md': 'Initial trip schedule has been seeded from the official calendar.',
                    'urgency': 'INFO',
                    'pinned': False,
                    'publish_at': timezone.now(),
                },
            )

        self.stdout.write('')

    def create_duas(self):
        """Create sample duas"""
        from apps.content.models import Dua
        
        self.stdout.write('📿 Creating duas...')
        
        duas_data = [
            {
                'category': 'TAWAF',
                'text_ar': 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
                'text_en': 'Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest',
                'transliteration': 'SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu akbar',
                'source': 'General Dhikr'
            },
            {
                'category': 'TAWAF',
                'text_ar': 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                'text_en': 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire',
                'transliteration': 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar',
                'source': 'Quran 2:201'
            },
            {
                'category': 'SAI',
                'text_ar': 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
                'text_en': 'Indeed, Safa and Marwah are among the symbols of Allah',
                'transliteration': 'Inna as-Safa wal-Marwata min sha\'a\'irillah',
                'source': 'Quran 2:158'
            },
            {
                'category': 'ARAFAT',
                'text_ar': 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                'text_en': 'There is no god but Allah alone, with no partner. To Him belongs the dominion, and to Him belongs all praise, and He has power over all things',
                'transliteration': 'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa \'ala kulli shay\'in qadir',
                'source': 'Hadith'
            },
            {
                'category': 'GENERAL',
                'text_ar': 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
                'text_en': 'O Allah, I ask You for pardon and well-being',
                'transliteration': 'Allahumma inni as\'alukal-\'afwa wal-\'afiyah',
                'source': 'Hadith'
            },
        ]
        
        count = 0
        for data in duas_data:
            _, created = Dua.objects.get_or_create(
                text_ar=data['text_ar'],
                defaults=data
            )
            if created:
                count += 1
        
        self.stdout.write(f'   ✓ Created {count} duas')
        self.stdout.write('')
