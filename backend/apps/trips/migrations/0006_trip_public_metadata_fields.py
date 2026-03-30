# Generated manually for public website metadata support.

from django.db import migrations, models
from django.utils.text import slugify


def populate_trip_slugs(apps, schema_editor):
    Trip = apps.get_model("trips", "Trip")

    for trip in Trip.objects.all().order_by("created_at", "id"):
        base_value = trip.slug or trip.name or trip.code or str(trip.id)
        base_slug = slugify(base_value) or slugify(trip.code) or str(trip.id)
        candidate = base_slug[:180]
        index = 2

        while Trip.objects.exclude(pk=trip.pk).filter(slug=candidate).exists():
            suffix = f"-{index}"
            candidate = f"{base_slug[: 180 - len(suffix)]}{suffix}"
            index += 1

        trip.slug = candidate
        trip.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("trips", "0005_add_featured_field"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicaltrip",
            name="excerpt",
            field=models.CharField(blank=True, default="", max_length=280),
        ),
        migrations.AddField(
            model_name="historicaltrip",
            name="seo_description",
            field=models.CharField(blank=True, default="", max_length=180),
        ),
        migrations.AddField(
            model_name="historicaltrip",
            name="seo_title",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="historicaltrip",
            name="slug",
            field=models.SlugField(blank=True, max_length=180, null=True),
        ),
        migrations.AddField(
            model_name="trip",
            name="excerpt",
            field=models.CharField(blank=True, default="", max_length=280),
        ),
        migrations.AddField(
            model_name="trip",
            name="seo_description",
            field=models.CharField(blank=True, default="", max_length=180),
        ),
        migrations.AddField(
            model_name="trip",
            name="seo_title",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="trip",
            name="slug",
            field=models.SlugField(blank=True, max_length=180, null=True, unique=True),
        ),
        migrations.RunPython(populate_trip_slugs, migrations.RunPython.noop),
    ]
