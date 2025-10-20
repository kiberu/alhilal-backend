from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """
    Simple health check endpoint for container orchestration.
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'healthy',
            'service': 'alhilal-backend',
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e),
        }, status=500)

