from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .cloudinary import upload_file
import logging

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def health_check(request):
    """Simple health check endpoint for Docker/monitoring."""
    return JsonResponse({
        "status": "healthy",
        "service": "alhilal-backend"
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    """
    Upload a document to Cloudinary.
    
    Expects:
        - file: The file to upload
        - folder: Optional folder name (default: 'documents')
        - resource_type: Optional resource type (default: 'auto')
    
    Returns:
        {
            "publicId": "...",
            "secureUrl": "...",
            "format": "...",
            "bytes": 12345
        }
    """
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can upload documents.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file = request.FILES['file']
    folder = request.POST.get('folder', 'documents')
    resource_type = request.POST.get('resource_type', 'auto')
    
    try:
        # Upload to Cloudinary
        result = upload_file(
            file,
            folder=folder,
            resource_type=resource_type
        )
        
        return Response({
            'publicId': result['public_id'],
            'secureUrl': result['secure_url'],
            'format': result.get('format', ''),
            'bytes': result.get('bytes', 0),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        return Response(
            {'error': f'Upload failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
