from django.urls import path
from .views import health_check, upload_document

urlpatterns = [
    path('', health_check, name='health-check'),
    path('upload', upload_document, name='upload-document'),
]

