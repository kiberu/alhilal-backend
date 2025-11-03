# Generated manually for Payment model

import django.db.models.deletion
import simple_history.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookings", "0002_booking_amount_paid_minor_units_booking_currency_and_more"),
        ("accounts", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Payment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("amount_minor_units", models.IntegerField(help_text="Amount in smallest currency unit (e.g., cents)")),
                ("currency", models.CharField(default="USD", max_length=3)),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("CASH", "Cash"),
                            ("BANK_TRANSFER", "Bank Transfer"),
                            ("CREDIT_CARD", "Credit Card"),
                            ("DEBIT_CARD", "Debit Card"),
                            ("MOBILE_MONEY", "Mobile Money"),
                            ("CHECK", "Check"),
                            ("OTHER", "Other"),
                        ],
                        max_length=20,
                    ),
                ),
                ("payment_date", models.DateField(help_text="Date payment was received")),
                ("reference_number", models.CharField(blank=True, help_text="Transaction/Receipt reference", max_length=100)),
                ("notes", models.TextField(blank=True, help_text="Additional payment notes")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "booking",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to="bookings.booking",
                    ),
                ),
                (
                    "recorded_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="recorded_payments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Payment",
                "verbose_name_plural": "Payments",
                "db_table": "payments",
                "ordering": ["-payment_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="HistoricalPayment",
            fields=[
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False)),
                ("amount_minor_units", models.IntegerField(help_text="Amount in smallest currency unit (e.g., cents)")),
                ("currency", models.CharField(default="USD", max_length=3)),
                (
                    "payment_method",
                    models.CharField(
                        choices=[
                            ("CASH", "Cash"),
                            ("BANK_TRANSFER", "Bank Transfer"),
                            ("CREDIT_CARD", "Credit Card"),
                            ("DEBIT_CARD", "Debit Card"),
                            ("MOBILE_MONEY", "Mobile Money"),
                            ("CHECK", "Check"),
                            ("OTHER", "Other"),
                        ],
                        max_length=20,
                    ),
                ),
                ("payment_date", models.DateField(help_text="Date payment was received")),
                ("reference_number", models.CharField(blank=True, help_text="Transaction/Receipt reference", max_length=100)),
                ("notes", models.TextField(blank=True, help_text="Additional payment notes")),
                ("created_at", models.DateTimeField(blank=True, editable=False)),
                ("updated_at", models.DateTimeField(blank=True, editable=False)),
                ("history_id", models.AutoField(primary_key=True, serialize=False)),
                ("history_date", models.DateTimeField(db_index=True)),
                ("history_change_reason", models.CharField(max_length=100, null=True)),
                (
                    "history_type",
                    models.CharField(choices=[("+", "Created"), ("~", "Changed"), ("-", "Deleted")], max_length=1),
                ),
                (
                    "booking",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="bookings.booking",
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "recorded_by",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "historical Payment",
                "db_table": "payments_history",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]

