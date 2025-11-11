"""
Cloudinary integration utilities.
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings
from typing import Optional
import time


def signed_delivery(public_id: str, expires_in: int = 600, resource_type: str = None, file_format: str = None) -> str:
    """
    Generate a signed URL for private Cloudinary resources.
    
    Args:
        public_id: The Cloudinary public_id of the resource
        expires_in: Expiration time in seconds (default: 10 minutes)
        resource_type: Type of resource ('raw', 'image', 'video', etc.). If None, auto-detects.
        file_format: File format/extension (jpg, pdf, png, etc.). Used for detection if provided.
        
    Returns:
        Signed URL that expires after the specified time
        
    Example:
        >>> url = signed_delivery('passports/abc123', file_format='pdf')
        >>> # Returns a URL valid for 10 minutes with correct resource type
    """
    if not public_id:
        return ''
    
    # Auto-detect resource type if not provided
    if resource_type is None:
        # First, try using the provided file_format
        if file_format:
            format_lower = file_format.lower().lstrip('.')
            
            image_formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico']
            video_formats = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv']
            document_formats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
            
            if format_lower in image_formats:
                resource_type = 'image'
            elif format_lower in video_formats:
                resource_type = 'video'
            elif format_lower in document_formats:
                resource_type = 'raw'
        
        # Fallback: Check file extension in public_id
        if resource_type is None:
            public_id_lower = public_id.lower()
            
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.ico']
            video_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv']
            document_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
            
            if any(public_id_lower.endswith(ext) for ext in image_extensions):
                resource_type = 'image'
            elif any(public_id_lower.endswith(ext) for ext in video_extensions):
                resource_type = 'video'
            elif any(public_id_lower.endswith(ext) for ext in document_extensions):
                resource_type = 'raw'
            else:
                # No extension detected - use folder-based heuristic for legacy uploads
                # Document folders often contain images (scanned docs without extensions)
                document_folders = ['passports', 'visas', 'documents', 'vaccinations', 'id_cards', 'birth_certificates']
                if any(public_id_lower.startswith(folder) for folder in document_folders):
                    resource_type = 'image'
                else:
                    resource_type = 'raw'
    
    # Calculate expiration timestamp
    expiration = int(time.time()) + expires_in
    
    # Generate signed URL
    url, options = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type=resource_type,
        type='authenticated',  # Use authenticated type for non-public resources
        sign_url=True,
        expires_at=expiration,
        secure=True
    )
    
    return url


def upload_file(file, folder: str = '', public_id: Optional[str] = None, resource_type: str = 'raw', is_public: bool = False) -> dict:
    """
    Upload a file to Cloudinary with server-side signing.
    
    Args:
        file: File object or path to upload
        folder: Cloudinary folder to upload to
        public_id: Custom public_id (optional, will be generated if not provided)
        resource_type: Type of resource ('raw', 'image', 'video', etc.)
        is_public: Whether the file should be publicly accessible (default: False for private)
        
    Returns:
        Dict with 'public_id', 'secure_url', 'resource_type'
        
    Example:
        >>> result = upload_file(request.FILES['passport'], folder='passports')
        >>> # Returns {'public_id': 'passports/xyz', 'secure_url': '...', ...}
    """
    # Determine if this should be public based on folder or explicit flag
    # Public folders: trips, content, public
    # Private folders: passports, visas, documents
    public_folders = ['trips', 'content', 'public']
    should_be_public = is_public or any(folder.startswith(pf) for pf in public_folders)
    
    upload_params = {
        'folder': folder,
        'resource_type': resource_type,
        'type': 'upload' if should_be_public else 'authenticated',  # Public or private
        'overwrite': False,
    }
    
    if public_id:
        upload_params['public_id'] = public_id
    
    # Upload to Cloudinary
    result = cloudinary.uploader.upload(file, **upload_params)
    
    return {
        'public_id': result['public_id'],
        'secure_url': result['secure_url'],
        'resource_type': result['resource_type'],
        'format': result.get('format', ''),
        'bytes': result.get('bytes', 0),
    }


def delete_file(public_id: str, resource_type: str = 'raw') -> bool:
    """
    Delete a file from Cloudinary.
    
    Args:
        public_id: The Cloudinary public_id of the resource
        resource_type: Type of resource ('raw', 'image', 'video', etc.)
        
    Returns:
        True if deleted successfully, False otherwise
    """
    if not public_id:
        return False
    
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            type='authenticated'
        )
        return result.get('result') == 'ok'
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to delete Cloudinary file {public_id}: {e}")
        return False


def get_signed_upload_params(folder: str = '', resource_type: str = 'raw') -> dict:
    """
    Generate signed upload parameters for client-side uploads (if needed in future).
    
    Args:
        folder: Cloudinary folder to upload to
        resource_type: Type of resource ('raw', 'image', 'video', etc.)
        
    Returns:
        Dict with signature, timestamp, and other params for client upload
    """
    timestamp = int(time.time())
    
    params = {
        'timestamp': timestamp,
        'folder': folder,
        'resource_type': resource_type,
        'type': 'authenticated',
    }
    
    # Generate signature
    signature = cloudinary.utils.api_sign_request(params, settings.CLOUDINARY_STORAGE['API_SECRET'])
    
    return {
        **params,
        'signature': signature,
        'api_key': settings.CLOUDINARY_STORAGE['API_KEY'],
        'cloud_name': settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
    }


def refresh_signed_url(public_id: str, resource_type: str = 'raw', expires_in: int = 600) -> Optional[str]:
    """
    Refresh an expired signed URL.
    
    This is useful for the API when a client tries to access an expired URL.
    
    Args:
        public_id: The Cloudinary public_id of the resource
        resource_type: Type of resource ('raw', 'image', 'video', etc.)
        expires_in: Expiration time in seconds (default: 10 minutes)
        
    Returns:
        New signed URL or None if the resource doesn't exist
    """
    try:
        # Check if resource exists
        cloudinary.api.resource(public_id, resource_type=resource_type)
        # If exists, generate new signed URL
        return signed_delivery(public_id, expires_in, resource_type)
    except Exception:
        return None


class CloudinaryURLMixin:
    """
    Mixin for models that have Cloudinary attachments.
    
    Usage:
        class MyModel(CloudinaryURLMixin, models.Model):
            attach_public_id = models.CharField(...)
            attach_url = models.URLField(...)
            
        # Then in serializer or view:
        signed_url = instance.get_signed_url('attach')
    """
    
    def get_signed_url(self, field_prefix: str = 'attach', expires_in: int = 600) -> Optional[str]:
        """
        Get a signed URL for a Cloudinary attachment.
        
        Args:
            field_prefix: Prefix of the public_id field (e.g., 'attach' for 'attach_public_id')
            expires_in: Expiration time in seconds
            
        Returns:
            Signed URL or None
        """
        public_id_field = f"{field_prefix}_public_id"
        public_id = getattr(self, public_id_field, None)
        
        if not public_id:
            return None
        
        return signed_delivery(public_id, expires_in)

