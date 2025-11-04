"""
Management command to create an admin user
Usage: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import Account
import os


class Command(BaseCommand):
    help = 'Creates an admin superuser'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--phone', type=str, help='Admin phone number')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--first-name', type=str, help='First name', default='Admin')
        parser.add_argument('--last-name', type=str, help='Last name', default='User')

    def handle(self, *args, **options):
        # Get from command line or environment variables
        email = options['email'] or os.environ.get('ADMIN_EMAIL')
        phone = options['phone'] or os.environ.get('ADMIN_PHONE')
        password = options['password'] or os.environ.get('ADMIN_PASSWORD')
        first_name = options['first_name']
        last_name = options['last_name']

        if not email or not phone or not password:
            self.stdout.write(self.style.ERROR(
                'Error: Email, phone, and password are required.\n'
                'Usage: python manage.py create_admin --email admin@example.com '
                '--phone +256700000000 --password SecurePass123\n'
                'Or set ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD environment variables'
            ))
            return

        # Check if user already exists
        if Account.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(
                f'User with email {email} already exists!'
            ))
            return

        # Create superuser
        try:
            user = Account.objects.create_superuser(
                email=email,
                phone=phone,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='admin'
            )
            
            self.stdout.write(self.style.SUCCESS(
                f'✅ Successfully created superuser: {user.email}'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   Name: {user.get_full_name()}'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   Phone: {user.phone}'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'   Role: {user.role}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Error creating superuser: {str(e)}'
            ))

