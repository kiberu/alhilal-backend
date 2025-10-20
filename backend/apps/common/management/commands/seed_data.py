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
        from apps.pilgrims.models import Passport, Visa
        from apps.content.models import Dua
        
        self.stdout.write('🗑️  Clearing existing data...')
        
        Trip.objects.all().delete()
        Booking.objects.all().delete()
        Passport.objects.all().delete()
        Visa.objects.all().delete()
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
        from apps.pilgrims.models import Passport
        
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
                    dob=dob,
                    nationality=nationality,
                    emergency_name=f'{data["name"].split()[0]} Emergency',
                    emergency_phone=f'+25670{random.randint(1000000, 9999999)}'
                )
                
                Passport.objects.create(
                    pilgrim=profile,
                    number=passport_number,
                    country=nationality,
                    expiry_date=date.today() + timedelta(days=365*3)  # 3 years
                )
                
                self.stdout.write(f'   ✓ Created pilgrim: {data["name"]} ({data["phone"]})')
            else:
                self.stdout.write(f'   - Pilgrim exists: {data["name"]}')
        
        self.stdout.write('')

    def create_trips(self):
        """Create sample trips with packages, flights, hotels, and bookings"""
        from apps.trips.models import (
            Trip, TripPackage, PackageFlight, PackageHotel,
            ItineraryItem, TripUpdate, TripGuideSection,
            ChecklistItem, EmergencyContact, TripFAQ
        )
        from apps.bookings.models import Booking
        from apps.pilgrims.models import Visa
        from apps.accounts.models import PilgrimProfile
        
        self.stdout.write('✈️  Creating trips...')
        
        # Trip 1: Umrah 2025 - May (Upcoming)
        trip1, created = Trip.objects.get_or_create(
            code='UMRAH2025MAY',
            defaults={
                'name': 'Umrah 2025 - May Package',
                'cities': ['Makkah', 'Madinah'],
                'start_date': date.today() + timedelta(days=30),
                'end_date': date.today() + timedelta(days=45),
                'visibility': 'PUBLIC',
                'operator_notes': 'Premium Umrah experience with 5-star accommodation'
            }
        )
        
        if created:
            self.stdout.write(f'   ✓ Created trip: {trip1.name}')
            
            # Packages for Trip 1
            gold_pkg = TripPackage.objects.create(
                trip=trip1,
                name='Gold Package',
                price_minor_units=5000000,  # 50,000 UGX
                currency='UGX',
                capacity=50,
                visibility='PUBLIC'
            )
            
            premium_pkg = TripPackage.objects.create(
                trip=trip1,
                name='Premium Package',
                price_minor_units=8000000,  # 80,000 UGX
                currency='UGX',
                capacity=30,
                visibility='PUBLIC'
            )
            
            self.stdout.write(f'     ✓ Created packages: Gold, Premium')
            
            # Flights for Gold Package
            dep_date = datetime.combine(trip1.start_date, time(2, 0))
            
            PackageFlight.objects.create(
                package=gold_pkg,
                leg='OUTBOUND',
                carrier='EK',
                flight_no='EK730',
                dep_airport='EBB',
                dep_dt=timezone.make_aware(dep_date),
                arr_airport='DXB',
                arr_dt=timezone.make_aware(dep_date + timedelta(hours=6)),
                group_pnr='ABC123'
            )
            
            PackageFlight.objects.create(
                package=gold_pkg,
                leg='CONNECTING',
                carrier='EK',
                flight_no='EK804',
                dep_airport='DXB',
                dep_dt=timezone.make_aware(dep_date + timedelta(hours=8)),
                arr_airport='JED',
                arr_dt=timezone.make_aware(dep_date + timedelta(hours=11)),
                group_pnr='ABC123'
            )
            
            return_date = datetime.combine(trip1.end_date, time(18, 0))
            
            PackageFlight.objects.create(
                package=gold_pkg,
                leg='RETURN',
                carrier='EK',
                flight_no='EK805',
                dep_airport='JED',
                dep_dt=timezone.make_aware(return_date),
                arr_airport='DXB',
                arr_dt=timezone.make_aware(return_date + timedelta(hours=3)),
                group_pnr='XYZ789'
            )
            
            self.stdout.write(f'     ✓ Created flights for Gold package')
            
            # Hotels for Gold Package
            PackageHotel.objects.create(
                package=gold_pkg,
                name='Hilton Makkah Convention Hotel',
                address='Jabal Omar, Near Haram, Makkah',
                room_type='Standard Room',
                check_in=trip1.start_date,
                check_out=trip1.start_date + timedelta(days=10),
                group_confirmation_no='HIL12345'
            )
            
            PackageHotel.objects.create(
                package=gold_pkg,
                name='Intercontinental Madinah',
                address='Near Masjid Nabawi, Madinah',
                room_type='Deluxe Room',
                check_in=trip1.start_date + timedelta(days=10),
                check_out=trip1.end_date,
                group_confirmation_no='IHG67890'
            )
            
            self.stdout.write(f'     ✓ Created hotels for Gold package')
            
            # Itinerary
            itinerary_items = [
                {
                    'day_index': 1,
                    'title': 'Arrival at Jeddah Airport',
                    'location': 'King Abdulaziz International Airport',
                    'start_time': '11:00:00',
                    'end_time': '14:00:00',
                    'notes': 'Group meet at Terminal 1. Transport to Makkah hotel.'
                },
                {
                    'day_index': 1,
                    'title': 'Check-in at Makkah Hotel',
                    'location': 'Hilton Makkah Convention Hotel',
                    'start_time': '16:00:00',
                    'end_time': '18:00:00',
                    'notes': 'Room allocation and orientation'
                },
                {
                    'day_index': 2,
                    'title': 'Umrah Ritual',
                    'location': 'Masjid al-Haram',
                    'start_time': '06:00:00',
                    'end_time': '12:00:00',
                    'notes': 'Complete Umrah with guide'
                },
                {
                    'day_index': 3,
                    'title': 'Ziyarah Tour - Makkah',
                    'location': 'Historical Sites',
                    'start_time': '09:00:00',
                    'end_time': '17:00:00',
                    'notes': 'Visit Cave of Hira, Jabal al-Nour, and other sites'
                },
                {
                    'day_index': 11,
                    'title': 'Travel to Madinah',
                    'location': 'Makkah to Madinah',
                    'start_time': '08:00:00',
                    'end_time': '14:00:00',
                    'notes': 'Coach journey with lunch stop'
                },
            ]
            
            for item in itinerary_items:
                ItineraryItem.objects.create(trip=trip1, **item)
            
            self.stdout.write(f'     ✓ Created itinerary ({len(itinerary_items)} items)')
            
            # Travel Guide
            TripGuideSection.objects.create(
                trip=trip1,
                order=1,
                title='What to Pack',
                content_md='''# Essential Items
- Ihram clothing (2 sets for men)
- Comfortable walking shoes
- Prayer mat and Quran
- Medications and toiletries
- Travel adapter (Saudi Arabia uses type G plugs)'''
            )
            
            TripGuideSection.objects.create(
                trip=trip1,
                order=2,
                title='Weather Information',
                content_md='''# May Weather in Saudi Arabia
- Temperature: 35-40°C (hot and dry)
- Recommended: Light, breathable clothing
- Stay hydrated - carry water bottle
- Use sunscreen and hat during outdoor activities'''
            )
            
            self.stdout.write(f'     ✓ Created travel guide sections')
            
            # Checklist
            checklist_items = [
                {'label': 'Valid Passport', 'category': 'DOCS', 'is_required': True},
                {'label': 'Visa Copy', 'category': 'DOCS', 'is_required': True},
                {'label': 'Yellow Fever Certificate', 'category': 'HEALTH', 'is_required': False},
                {'label': 'Travel Insurance', 'category': 'DOCS', 'is_required': False},
                {'label': 'Ihram Clothing', 'category': 'PERSONAL', 'is_required': True},
                {'label': 'Prayer Mat', 'category': 'PERSONAL', 'is_required': False},
            ]
            
            for item in checklist_items:
                ChecklistItem.objects.create(trip=trip1, **item)
            
            # Emergency Contacts
            EmergencyContact.objects.create(
                trip=trip1,
                label='Tour Guide',
                phone='+966501234567',
                hours='24/7',
                notes='WhatsApp available'
            )
            
            EmergencyContact.objects.create(
                trip=trip1,
                label='Hotel Reception',
                phone='+966126777777',
                hours='24/7',
                notes='Hilton Makkah front desk'
            )
            
            # FAQs
            faqs = [
                {
                    'question': 'What time is hotel check-in?',
                    'answer': 'Check-in is at 2:00 PM. Early check-in subject to availability.',
                    'order': 1
                },
                {
                    'question': 'Is WiFi available at the hotel?',
                    'answer': 'Yes, free WiFi is available in all rooms and public areas.',
                    'order': 2
                },
                {
                    'question': 'What meals are included?',
                    'answer': 'Breakfast and dinner are included. Lunch can be purchased at the hotel or nearby restaurants.',
                    'order': 3
                },
            ]
            
            for faq in faqs:
                TripFAQ.objects.create(trip=trip1, **faq)
            
            self.stdout.write(f'     ✓ Created essentials (checklist, contacts, FAQs)')
            
            # Create bookings for pilgrims
            pilgrims = PilgrimProfile.objects.all()[:3]
            for i, pilgrim in enumerate(pilgrims):
                booking = Booking.objects.create(
                    pilgrim=pilgrim,
                    package=gold_pkg if i < 2 else premium_pkg,
                    status='BOOKED',
                    ticket_number=f'TK{random.randint(100000, 999999)}',
                    room_assignment=f'Room {201 + i}'
                )
                
                # Create visa for booked pilgrims
                Visa.objects.create(
                    pilgrim=pilgrim,
                    trip=trip1,
                    status='PENDING'
                )
            
            self.stdout.write(f'     ✓ Created {len(pilgrims)} bookings and visas')
            
            # Trip Update
            TripUpdate.objects.create(
                trip=trip1,
                title='Important: Flight Schedule Confirmed',
                body_md='All flights have been confirmed. Please check your email for detailed itinerary.',
                urgency='IMPORTANT',
                pinned=True,
                publish_at=timezone.now() - timedelta(days=1)
            )
        
        else:
            self.stdout.write(f'   - Trip exists: {trip1.name}')
        
        # Trip 2: Past Umrah (for history)
        trip2, created = Trip.objects.get_or_create(
            code='UMRAH2024DEC',
            defaults={
                'name': 'Umrah 2024 - December',
                'cities': ['Makkah', 'Madinah'],
                'start_date': date.today() - timedelta(days=60),
                'end_date': date.today() - timedelta(days=45),
                'visibility': 'PUBLIC',
                'operator_notes': 'Completed trip - December 2024'
            }
        )
        
        if created:
            self.stdout.write(f'   ✓ Created past trip: {trip2.name}')
        
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

