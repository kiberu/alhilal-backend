"""Public lead-capture views."""

import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.serializers.platform import WebsiteLeadPublicCreateSerializer
from apps.common.notifications import send_website_lead_notification

logger = logging.getLogger(__name__)


class PublicWebsiteLeadCreateView(APIView):
    """Accept website lead submissions from public forms."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Create a new website lead."""
        serializer = WebsiteLeadPublicCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()

        try:
            send_website_lead_notification(lead)
        except Exception:
            logger.exception("Failed to send website lead notification for lead %s.", lead.id)

        response_serializer = WebsiteLeadPublicCreateSerializer(lead)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
