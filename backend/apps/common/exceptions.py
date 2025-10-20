from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that returns consistent error format.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            'error': {
                'code': exc.__class__.__name__,
                'message': str(exc),
            }
        }
        
        # Add field-level errors if available
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            custom_response_data['error']['fields'] = exc.detail
        
        response.data = custom_response_data

    return response

