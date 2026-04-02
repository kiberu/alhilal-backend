"""Helpers for syncing Al Hilal lesson videos from YouTube."""

from __future__ import annotations

import json
from datetime import timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings
from django.utils import timezone

from .models import PlatformSettings


class YouTubeSyncError(Exception):
    """Raised when the configured YouTube source cannot be synced."""


YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'


def _youtube_request(endpoint: str, params: dict) -> dict:
    """Call the YouTube Data API and return parsed JSON."""
    api_key = getattr(settings, 'YOUTUBE_DATA_API_KEY', '')
    if not api_key:
        raise YouTubeSyncError('YOUTUBE_DATA_API_KEY is not configured')

    query = urlencode({**params, 'key': api_key})
    url = f'{YOUTUBE_API_BASE}/{endpoint}?{query}'

    try:
        with urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except HTTPError as exc:
        raise YouTubeSyncError(f'YouTube API error: {exc.code}') from exc
    except URLError as exc:
        raise YouTubeSyncError(f'YouTube network error: {exc.reason}') from exc


def _resolve_playlist_id(platform_settings: PlatformSettings) -> str:
    """Resolve the configured playlist, falling back to channel uploads."""
    if platform_settings.youtube_playlist_id:
        return platform_settings.youtube_playlist_id

    if not platform_settings.youtube_channel_id:
        raise YouTubeSyncError('No YouTube playlist or channel is configured')

    payload = _youtube_request(
        'channels',
        {
            'part': 'contentDetails',
            'id': platform_settings.youtube_channel_id,
            'maxResults': 1,
        },
    )
    items = payload.get('items', [])
    if not items:
        raise YouTubeSyncError('Configured YouTube channel was not found')

    uploads_playlist = items[0].get('contentDetails', {}).get('relatedPlaylists', {}).get('uploads')
    if not uploads_playlist:
        raise YouTubeSyncError('Configured YouTube channel does not expose an uploads playlist')

    return uploads_playlist


def _normalize_playlist_items(items: list[dict]) -> list[dict]:
    """Normalize playlist items to the app contract."""
    normalized_items = []
    for item in items:
        snippet = item.get('snippet', {})
        content_details = item.get('contentDetails', {})
        video_id = content_details.get('videoId') or snippet.get('resourceId', {}).get('videoId')
        if not video_id:
            continue

        thumbnails = snippet.get('thumbnails', {})
        thumbnail = (
            thumbnails.get('high')
            or thumbnails.get('medium')
            or thumbnails.get('default')
            or {}
        )

        normalized_items.append(
            {
                'videoId': video_id,
                'title': snippet.get('title', ''),
                'description': snippet.get('description', ''),
                'publishedAt': snippet.get('publishedAt'),
                'channelTitle': snippet.get('channelTitle', ''),
                'thumbnailUrl': thumbnail.get('url'),
                'youtubeUrl': f'https://www.youtube.com/watch?v={video_id}',
            }
        )

    return normalized_items


def sync_platform_videos(force_refresh: bool = False, max_results: int = 12) -> tuple[list[dict], PlatformSettings, bool]:
    """Return normalized platform videos, refreshing cache when needed."""
    platform_settings = PlatformSettings.get_solo()
    stale = (
        not platform_settings.youtube_cache_synced_at
        or platform_settings.youtube_cache_synced_at <= timezone.now() - timedelta(minutes=15)
    )

    if not force_refresh and platform_settings.youtube_cache_payload and not stale:
        return platform_settings.youtube_cache_payload, platform_settings, False

    if not platform_settings.youtube_playlist_id and not platform_settings.youtube_channel_id:
        return [], platform_settings, False

    playlist_id = _resolve_playlist_id(platform_settings)
    payload = _youtube_request(
        'playlistItems',
        {
            'part': 'snippet,contentDetails',
            'playlistId': playlist_id,
            'maxResults': max_results,
        },
    )
    items = _normalize_playlist_items(payload.get('items', []))

    platform_settings.youtube_cache_payload = items
    platform_settings.youtube_cache_synced_at = timezone.now()
    if not platform_settings.youtube_playlist_id:
        platform_settings.youtube_playlist_id = playlist_id
    platform_settings.save(
        update_fields=['youtube_playlist_id', 'youtube_cache_payload', 'youtube_cache_synced_at', 'updated_at']
    )

    return items, platform_settings, True
