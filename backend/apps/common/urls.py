from django.urls import path
from .views import health_check, upload_file_view

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('upload', upload_file_view, name='upload-file'),
]

