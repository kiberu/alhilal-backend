"""Shared test helpers for backend API certification."""

from django.contrib.auth import get_user_model

from apps.accounts.models import StaffProfile


Account = get_user_model()


def create_staff_user(*, phone, name, staff_role="ADMIN", password=None, **extra_fields):
    """Create a staff account with the matching StaffProfile row."""
    user = Account.objects.create_user(
        phone=phone,
        name=name,
        password=password,
        role="STAFF",
        is_staff=True,
        **extra_fields,
    )

    if not user.is_staff:
        user.is_staff = True
        user.save(update_fields=["is_staff"])

    StaffProfile.objects.update_or_create(user=user, defaults={"role": staff_role})
    return user
