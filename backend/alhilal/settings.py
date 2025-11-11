"""
Django settings for alhilal project.
"""
import os
from pathlib import Path
from datetime import timedelta
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    DATABASE_URL=(str, ''),
    DB_NAME=(str, 'alhilal'),
    DB_USER=(str, 'alhilal'),
    DB_PASSWORD=(str, ''),
    DB_HOST=(str, 'localhost'),
    DB_PORT=(int, 5432),
    SECRET_KEY=(str, 'django-insecure-change-me'),
    TIME_ZONE=(str, 'Africa/Kampala'),
    CLOUDINARY_CLOUD_NAME=(str, ''),
    CLOUDINARY_API_KEY=(str, ''),
    CLOUDINARY_API_SECRET=(str, ''),
    REDIS_URL=(str, 'redis://localhost:6379/0'),
    CORS_ALLOWED_ORIGINS=(list, []),
    FIELD_ENCRYPTION_KEY=(str, ''),
    OTP_EXPIRY_SECONDS=(int, 600),
    OTP_MAX_ATTEMPTS=(int, 5),
    JWT_ACCESS_TOKEN_LIFETIME=(int, 3600),
    JWT_REFRESH_TOKEN_LIFETIME=(int, 86400),
    RATELIMIT_ENABLE=(bool, True),
    AFRICASTALKING_USERNAME=(str, 'sandbox'),
    AFRICASTALKING_API_KEY=(str, ''),
    AFRICASTALKING_SENDER_ID=(str, ''),
    SMS_ENABLED=(bool, False),
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

# ALLOWED_HOSTS configuration
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# Automatically add Railway domain if running on Railway
if os.environ.get('RAILWAY_ENVIRONMENT'):
    railway_domain = os.environ.get('RAILWAY_PUBLIC_DOMAIN')
    if railway_domain and railway_domain not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(railway_domain)
    # Also allow Railway's static domain format
    if os.environ.get('RAILWAY_STATIC_URL'):
        static_domain = os.environ.get('RAILWAY_STATIC_URL').replace('https://', '').replace('http://', '')
        if static_domain and static_domain not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(static_domain)

# In development or if no hosts specified, allow all (not recommended for production)
if not ALLOWED_HOSTS or DEBUG:
    ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'django_filters',
    'simple_history',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'cloudinary_storage',
    'cloudinary',
    
    # Local apps
    'apps.accounts',
    'apps.pilgrims',
    'apps.trips',
    'apps.bookings',
    'apps.content',
    'apps.api',
    'apps.common',
]

# Debug toolbar (only in development)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
]

if DEBUG:
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')

ROOT_URLCONF = 'alhilal.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'alhilal.wsgi.application'

# Database
# Railway provides DATABASE_URL automatically, use it if available
import sys

# During collectstatic, we don't need a real database connection
if 'collectstatic' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
elif env('DATABASE_URL'):
    DATABASES = {
        'default': env.db('DATABASE_URL')
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME'),
            'USER': env('DB_USER'),
            'PASSWORD': env('DB_PASSWORD'),
            'HOST': env('DB_HOST'),
            'PORT': env('DB_PORT'),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = env('TIME_ZONE')
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

# WhiteNoise configuration for static files in production
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {        
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary configuration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': env('CLOUDINARY_API_KEY'),
    'API_SECRET': env('CLOUDINARY_API_SECRET'),
    'SECURE': True,
    'RESOURCE_TYPE': 'auto',
}

# Initialize Cloudinary SDK
import cloudinary
cloudinary.config(
    cloud_name=env('CLOUDINARY_CLOUD_NAME'),
    api_key=env('CLOUDINARY_API_KEY'),
    api_secret=env('CLOUDINARY_API_SECRET'),
    secure=True
)

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.Account'

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.common.exceptions.custom_exception_handler',
}

# JWT configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(seconds=env('JWT_ACCESS_TOKEN_LIFETIME')),
    'REFRESH_TOKEN_LIFETIME': timedelta(seconds=env('JWT_REFRESH_TOKEN_LIFETIME')),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS configuration
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
])
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all origins in development

# CORS headers - Required for both development and production
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'cache-control',
    'pragma',
    'expires',
]

# Spectacular (OpenAPI) settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Alhilal Travels API',
    'DESCRIPTION': """
    # Alhilal Pilgrimage Management System API
    
    Complete API for managing pilgrimage trips, bookings, pilgrims, and travel documentation.
    
    ## Features
    - 🕌 **Trip Management**: Create and manage pilgrimage trips
    - 📦 **Package Management**: Handle travel packages with flexible pricing
    - 👥 **Pilgrim Management**: Track pilgrim information and documents
    - 📋 **Booking System**: Complete booking and payment tracking
    - 📄 **Document Management**: Passport and visa handling with encryption
    - 📚 **Content Management**: Duas, itineraries, and travel information
    
    ## Authentication
    All endpoints require JWT authentication. Obtain tokens via `/api/v1/auth/login/`.
    
    ## Contact
    - Website: https://alhilaltravels.com
    - Email: info@alhilaltravels.com
    """,
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': r'/api/v1',
    'COMPONENT_SPLIT_REQUEST': True,
    
    # UI Configuration
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
        'filter': True,
        'tryItOutEnabled': True,
        'syntaxHighlight.theme': 'monokai',
    },
    
    # Authentication schemes
    'SECURITY': [
        {
            'bearerAuth': []
        }
    ],
    'COMPONENTS': {
        'securitySchemes': {
            'bearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    },
    
    # API Grouping
    'TAGS': [
        {'name': 'Authentication', 'description': 'User authentication and authorization'},
        {'name': 'Profile', 'description': 'User profile management'},
        {'name': 'Trips', 'description': 'Pilgrimage trip operations'},
        {'name': 'Packages', 'description': 'Travel package management'},
        {'name': 'Bookings', 'description': 'Booking and payment operations'},
        {'name': 'Pilgrims', 'description': 'Pilgrim information management'},
        {'name': 'Documents', 'description': 'Passport and visa management'},
        {'name': 'Content', 'description': 'Duas, itineraries, and content'},
        {'name': 'Admin', 'description': 'Administrative operations'},
    ],
    
    # Schema generation
    'SCHEMA_COERCE_PATH_PK_SUFFIX': True,
    'PREPROCESSING_HOOKS': [],
    'POSTPROCESSING_HOOKS': [],
    
    # API versioning
    'SCHEMA_PATH_PREFIX_TRIM': True,
    'SERVERS': [
        {'url': 'https://api.alhilaltravels.com', 'description': 'Production server'},
        {'url': 'https://alhilal-backend-production.up.railway.app', 'description': 'Railway server'},
        {'url': 'http://localhost:8000', 'description': 'Local development server'},
    ],
}

# Celery configuration
CELERY_BROKER_URL = env('REDIS_URL')
CELERY_RESULT_BACKEND = env('REDIS_URL')
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Simple History configuration
SIMPLE_HISTORY_HISTORY_CHANGE_REASON_USE_TEXT = True

# OTP configuration
OTP_EXPIRY_SECONDS = env('OTP_EXPIRY_SECONDS')
OTP_MAX_ATTEMPTS = env('OTP_MAX_ATTEMPTS')

# Field encryption key
# For Railway deployment: generate a secure key and set it in environment variables
# During build time (collectstatic/migrations), a temporary key is used if none is set
# This temporary key should NEVER be used in production for actual data
# Valid Fernet key format (32 url-safe base64-encoded bytes = 44 chars)
TEMPORARY_KEY = 'dGVtcG9yYXJ5X2J1aWxkX2tleV9kb19ub3RfdXNlX2lucHJvZHVjdGlvbg=='
FIELD_ENCRYPTION_KEY = env('FIELD_ENCRYPTION_KEY') or TEMPORARY_KEY

# Warn if using temporary key in production
if not DEBUG and FIELD_ENCRYPTION_KEY == TEMPORARY_KEY:
    import warnings
    warnings.warn(
        "WARNING: Using temporary FIELD_ENCRYPTION_KEY! "
        "Set a secure key in production environment variables.",
        RuntimeWarning
    )

# Rate limiting
RATELIMIT_ENABLE = env('RATELIMIT_ENABLE')

# Africa's Talking SMS Configuration
AFRICASTALKING_USERNAME = env('AFRICASTALKING_USERNAME')
AFRICASTALKING_API_KEY = env('AFRICASTALKING_API_KEY')
AFRICASTALKING_SENDER_ID = env('AFRICASTALKING_SENDER_ID')
SMS_ENABLED = env('SMS_ENABLED')

# Initialize Africa's Talking if credentials are provided
if AFRICASTALKING_API_KEY and AFRICASTALKING_API_KEY != '':
    try:
        import africastalking
        africastalking.initialize(
            username=AFRICASTALKING_USERNAME,
            api_key=AFRICASTALKING_API_KEY
        )
    except Exception as e:
        import warnings
        warnings.warn(f"Failed to initialize Africa's Talking: {e}", RuntimeWarning)

# Security settings for production
if not DEBUG:
    # Trust Railway's proxy headers for HTTPS detection
    # Railway terminates SSL and passes X-Forwarded-Proto header
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Don't force SSL redirect - Railway handles this at the proxy level
    # If you want Django to redirect, uncomment the line below
    # SECURE_SSL_REDIRECT = True
    
    # Secure cookies (only sent over HTTPS)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    # Security headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # HSTS (HTTP Strict Transport Security)
    # Tells browsers to only use HTTPS for future requests
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Debug toolbar configuration
if DEBUG:
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
    import socket
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    INTERNAL_IPS += [ip[: ip.rfind(".")] + ".1" for ip in ips]

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

