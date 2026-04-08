"""Tests for public guidance article APIs and guidance seeding."""
from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from apps.common.management.commands.seed_data import Command as SeedDataCommand
from apps.content.models import GuidanceArticle



def create_guidance_article(*, slug, title, category, published_at, featured=False, featured_order=0, author=None):
    """Create a guidance article with minimum body content for API tests."""
    return GuidanceArticle.objects.create(
        slug=slug,
        title=title,
        description=f"{title} description",
        category=category,
        featured=featured,
        featured_order=featured_order,
        image_url='https://www.alhilaltravels.com/assets/journeys/guidance.jpg',
        read_time='8 min read',
        published_at=published_at,
        author=author,
        author_role_label='Pilgrim Support and Guidance',
        intro=['Intro paragraph'],
        sections=[
            {
                'heading': 'Section heading',
                'paragraphs': ['Section paragraph'],
                'checklist': ['Checklist item'],
            }
        ],
        takeaway='Takeaway text',
        sources=[{'label': 'Source', 'url': 'https://example.com/source'}],
        keywords=['keyword one', 'keyword two'],
    )


@pytest.mark.django_db
class TestPublicGuidanceArticleAPI:
    """Contract tests for anonymous guidance endpoints."""

    def test_list_public_guidance_returns_only_published_with_featured_order(self, api_client, staff_user):
        now = timezone.now()
        create_guidance_article(
            slug='regular-guide',
            title='Regular Guide',
            category='Pilgrimage basics',
            published_at=now,
            featured=False,
            featured_order=0,
            author=staff_user,
        )
        create_guidance_article(
            slug='featured-b',
            title='Featured B',
            category='Pilgrimage basics',
            published_at=now,
            featured=True,
            featured_order=2,
            author=staff_user,
        )
        create_guidance_article(
            slug='featured-a',
            title='Featured A',
            category='Pilgrimage basics',
            published_at=now,
            featured=True,
            featured_order=1,
            author=staff_user,
        )
        create_guidance_article(
            slug='future-guide',
            title='Future Guide',
            category='Pilgrimage basics',
            published_at=now + timedelta(days=5),
            featured=True,
            featured_order=0,
            author=staff_user,
        )

        response = api_client.get('/api/v1/public/guidance/')

        assert response.status_code == status.HTTP_200_OK
        assert [item['slug'] for item in response.data] == ['featured-a', 'featured-b', 'regular-guide']
        assert response.data[0]['author_name'] == staff_user.name

    def test_list_public_guidance_supports_featured_category_and_limit_filters(self, api_client):
        now = timezone.now()
        create_guidance_article(
            slug='health-1',
            title='Health One',
            category='Health and safety',
            published_at=now,
            featured=True,
            featured_order=1,
        )
        create_guidance_article(
            slug='health-2',
            title='Health Two',
            category='Health and safety',
            published_at=now,
            featured=True,
            featured_order=2,
        )
        create_guidance_article(
            slug='family-1',
            title='Family One',
            category='Family and household',
            published_at=now,
            featured=True,
            featured_order=1,
        )

        response = api_client.get(
            '/api/v1/public/guidance/',
            {'featured': 'true', 'category': 'Health and safety', 'limit': '1'},
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['slug'] == 'health-1'

    def test_public_guidance_detail_returns_full_article_payload(self, api_client):
        article = create_guidance_article(
            slug='detail-guide',
            title='Detail Guide',
            category='Pilgrimage basics',
            published_at=timezone.now(),
            featured=True,
            featured_order=1,
        )

        response = api_client.get(f'/api/v1/public/guidance/{article.slug}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['slug'] == 'detail-guide'
        assert response.data['intro'] == ['Intro paragraph']
        assert response.data['sections'][0]['heading'] == 'Section heading'
        assert response.data['takeaway'] == 'Takeaway text'
        assert response.data['sources'][0]['url'] == 'https://example.com/source'

    def test_public_guidance_detail_returns_not_found_for_unknown_or_unpublished(self, api_client):
        unpublished = create_guidance_article(
            slug='unpublished-guide',
            title='Unpublished Guide',
            category='Pilgrimage basics',
            published_at=timezone.now() + timedelta(days=1),
        )

        unknown = api_client.get('/api/v1/public/guidance/missing-guide/')
        unpublished_response = api_client.get(f'/api/v1/public/guidance/{unpublished.slug}/')

        assert unknown.status_code == status.HTTP_404_NOT_FOUND
        assert unpublished_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestGuidanceSeedCommand:
    """Coverage for guidance seeding behavior introduced in phase one."""

    def test_seed_guidance_articles_is_idempotent_and_links_staff_author(self, staff_user):
        command = SeedDataCommand()

        command.create_guidance_articles()
        first_count = GuidanceArticle.objects.count()
        first_article = GuidanceArticle.objects.get(slug='first-time-umrah-checklist')

        command.create_guidance_articles()
        second_count = GuidanceArticle.objects.count()

        all_slugs = list(GuidanceArticle.objects.values_list('slug', flat=True))
        assert first_count > 0
        assert first_count == second_count
        assert len(all_slugs) == len(set(all_slugs))
        assert first_article.author == staff_user
        assert first_article.author_role_label == 'Pilgrim Support and Guidance'

    def test_seed_guidance_articles_provide_published_featured_media_for_test_surfaces(self, api_client, staff_user):
        command = SeedDataCommand()

        command.create_guidance_articles()

        response = api_client.get('/api/v1/public/guidance/', {'featured': 'true', 'limit': '3'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert all(item['featured'] for item in response.data)
        assert [item['featured_order'] for item in response.data] == [1, 2, 3]
        assert all(item['published_at'] for item in response.data)
        assert all(item['image_url'].startswith('https://') for item in response.data)
        assert all(item['author_name'] == staff_user.name for item in response.data)
