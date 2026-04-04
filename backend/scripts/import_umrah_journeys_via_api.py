#!/usr/bin/env python3
"""Import normalized Umrah journeys into the backend via staff API endpoints.

Default mode is a dry run that only prints planned operations.
Use --apply to execute writes against an API environment (including production).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib import error, parse, request


DEFAULT_SOURCE = "/Users/kiberusharif/Downloads/umrah_calendar_2026_2027_normalized.md"


# Metadata aligned with the normalized 2026-2027 calendar and backend seed conventions.
ROW_METADATA: dict[str, dict[str, Any]] = {
    "1": {
        "code": "UMR26JULFEN",
        "family_code": "2026-JUL-FFENNA",
        "commercial_month_label": "July 2026",
        "trip_name": "July Ffenna Umrah",
        "trip_status": "PREPARATION",
        "featured": True,
    },
    "2": {
        "code": "UMR26AUG",
        "family_code": "2026-AUG",
        "commercial_month_label": "August 2026",
        "trip_name": "August Umrah",
        "trip_status": "OPEN_FOR_SALES",
    },
    "3": {
        "code": "UMR26SEP",
        "family_code": "2026-SEP",
        "commercial_month_label": "September 2026",
        "trip_name": "September Umrah",
        "trip_status": "OPEN_FOR_SALES",
    },
    "4": {
        "code": "UMR26OCTIND",
        "family_code": "2026-OCT-INDEPENDENCE",
        "commercial_month_label": "October 2026",
        "trip_name": "Independence Umrah",
        "trip_status": "OPEN_FOR_SALES",
    },
    "5": {
        "code": "UMR26NOV",
        "family_code": "2026-NOV",
        "commercial_month_label": "November 2026",
        "trip_name": "November Umrah",
        "trip_status": "OPEN_FOR_SALES",
    },
    "6": {
        "code": "UMR26DECSUPA",
        "family_code": "2026-DEC",
        "commercial_month_label": "December 2026",
        "trip_name": "December Supa Umrah",
        "trip_status": "OPEN_FOR_SALES",
    },
    "7a": {
        "code": "UMR26DECPJED",
        "family_code": "2026-DEC-PREMIUM",
        "commercial_month_label": "December 2026",
        "trip_name": "December Premium / Jeddah Trip",
        "trip_status": "OPEN_FOR_SALES",
        "package_name": "Premium Package",
    },
    "7b": {
        "code": "UMR26DECPQAT",
        "family_code": "2026-DEC-PREMIUM",
        "commercial_month_label": "December 2026",
        "trip_name": "December Premium / Qatar Tour",
        "trip_status": "OPEN_FOR_SALES",
        "package_name": "Premium Package",
    },
    "8": {
        "code": "UMR27JAN",
        "family_code": "2027-JAN",
        "commercial_month_label": "January 2027",
        "trip_name": "January Umrah 2027",
        "trip_status": "OPEN_FOR_SALES",
    },
    "9": {
        "code": "UMR27HIJJA",
        "family_code": "2027-HIJJA",
        "commercial_month_label": "Hijja 2027",
        "trip_name": "Hijja 2027",
        "trip_status": "PLANNING",
        "fallback_start_date": "2027-05-14",
        "fallback_end_date": "2027-05-19",
    },
    "10": {
        "code": "UMR27RAMEARLY",
        "family_code": "2027-RAMADHAN",
        "commercial_month_label": "Early Ramadhan 2027",
        "trip_name": "Early Ramadhan Umrah",
        "trip_status": "PLANNING",
    },
    "11": {
        "code": "UMR27RAM",
        "family_code": "2027-RAMADHAN",
        "commercial_month_label": "Ramadhan 2027",
        "trip_name": "Ramadhan Umrah",
        "trip_status": "PLANNING",
    },
    "12": {
        "code": "UMR27RAMPREM",
        "family_code": "2027-RAMADHAN",
        "commercial_month_label": "Ramadhan 2027",
        "trip_name": "Premium Ramadhan Umrah",
        "trip_status": "PLANNING",
        "package_name": "Premium Package",
    },
}


@dataclass
class JourneyRow:
    sn: str
    package_month: str
    departure_date: date | None
    arrival_date: date | None
    madinah_hotel: str
    makkah_hotel: str
    airline: str
    fare_raw: str
    target: int | None
    nights: int | None
    hotel_booking_month: str
    airline_booking_month: str
    notes: str


@dataclass
class JourneyPlan:
    row: JourneyRow
    trip_payload: dict[str, Any]
    package_payload: dict[str, Any]
    start_date: date
    end_date: date


def to_slug_token(value: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "", value.upper())


def parse_date(value: str) -> date | None:
    text = (value or "").strip()
    if not text:
        return None
    return datetime.strptime(text, "%Y-%m-%d").date()


def parse_integer(value: str) -> int | None:
    text = (value or "").strip()
    if not text:
        return None
    digits = re.sub(r"[^0-9]", "", text)
    if not digits:
        return None
    return int(digits)


def parse_fare(value: str) -> int | None:
    text = (value or "").strip()
    if not text:
        return None
    first_segment = text.split("/")[0].strip()
    normalized = re.sub(r"[^0-9.]", "", first_segment)
    if not normalized:
        return None
    return int(round(float(normalized)))


def infer_currency(fare_raw: str, fare_value: int | None) -> str:
    raw = (fare_raw or "").strip()
    if "$" in raw:
        return "USD"
    if fare_value is not None and fare_value >= 100_000:
        return "UGX"
    return "USD"


def normalize_month_label(value: str) -> str:
    return (value or "").strip().upper()


def month_label_from_start(start_date: date) -> str:
    return start_date.strftime("%B %Y")


def generate_default_code(row: JourneyRow) -> str:
    yy = row.departure_date.year % 100 if row.departure_date else 0
    slug = to_slug_token(row.package_month)
    if not slug:
        slug = f"ROW{to_slug_token(row.sn)}"
    return f"UMR{yy:02d}{slug}"[:24]


def build_default_name(row: JourneyRow) -> str:
    name = row.package_month.strip()
    if not name:
        name = f"Journey {row.sn}"
    return name


def markdown_rows(source_path: Path) -> list[JourneyRow]:
    text = source_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    header_idx = None
    for idx, line in enumerate(lines):
        if line.strip().startswith("| S/N |"):
            header_idx = idx
            break

    if header_idx is None:
        raise ValueError("Could not find markdown table header row.")

    rows: list[JourneyRow] = []
    for line in lines[header_idx + 2 :]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            break
        cells = [part.strip() for part in stripped.strip("|").split("|")]
        if len(cells) < 13:
            continue

        rows.append(
            JourneyRow(
                sn=cells[0],
                package_month=cells[1],
                departure_date=parse_date(cells[2]),
                arrival_date=parse_date(cells[3]),
                madinah_hotel=cells[4],
                makkah_hotel=cells[5],
                airline=cells[6],
                fare_raw=cells[7],
                target=parse_integer(cells[8]),
                nights=parse_integer(cells[9]),
                hotel_booking_month=cells[10],
                airline_booking_month=cells[11],
                notes=cells[12],
            )
        )

    if not rows:
        raise ValueError("No data rows found in markdown table.")

    return rows


def compact(payload: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in payload.items():
        if value is None:
            continue
        if isinstance(value, str) and value == "":
            continue
        out[key] = value
    return out


def build_plan(row: JourneyRow) -> JourneyPlan:
    meta = ROW_METADATA.get(row.sn, {})

    start_date = row.departure_date or parse_date(meta.get("fallback_start_date", "") or "")
    end_date = row.arrival_date or parse_date(meta.get("fallback_end_date", "") or "")

    if not start_date or not end_date:
        raise ValueError(
            f"Row {row.sn}: missing departure/arrival date and no fallback metadata available."
        )

    nights = row.nights
    if nights is None:
        nights = max((end_date - start_date).days, 0)

    fare_value = parse_fare(row.fare_raw)
    target = row.target

    code = meta.get("code") or generate_default_code(row)
    trip_name = meta.get("trip_name") or build_default_name(row)
    family_code = meta.get("family_code") or f"{start_date.year}-{to_slug_token(row.package_month)[:12]}"
    commercial_month_label = meta.get("commercial_month_label") or month_label_from_start(start_date)
    trip_status = meta.get("trip_status") or "DRAFT"
    package_name = meta.get("package_name") or "Standard Package"

    excerpt = f"{trip_name} - {start_date.strftime('%d %b %Y')} to {end_date.strftime('%d %b %Y')}"

    trip_payload = compact(
        {
            "code": code,
            "familyCode": family_code,
            "commercialMonthLabel": commercial_month_label,
            "status": trip_status,
            "name": trip_name,
            "excerpt": excerpt,
            "seoTitle": f"Al Hilal {trip_name}",
            "seoDescription": excerpt,
            "cities": ["Makkah", "Madinah"],
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "defaultNights": nights,
            "visibility": "PUBLIC",
            "featured": bool(meta.get("featured", False)),
            "operatorNotes": (
                "Imported via API from umrah_calendar_2026_2027_normalized.md. "
                + (f"Notes: {row.notes}" if row.notes else "")
            ).strip(),
        }
    )

    package_status = "SELLING" if trip_status == "OPEN_FOR_SALES" else "DRAFT"
    currency_code = infer_currency(row.fare_raw, fare_value)

    package_payload = compact(
        {
            "package_code": f"{code}-STD",
            "name": package_name,
            "nights": nights,
            "price_minor_units": fare_value,
            "currency_code": currency_code,
            "capacity": target,
            "sales_target": target,
            "hotel_booking_month": normalize_month_label(row.hotel_booking_month),
            "airline_booking_month": normalize_month_label(row.airline_booking_month),
            "status": package_status,
            "visibility": "PUBLIC",
        }
    )

    return JourneyPlan(
        row=row,
        trip_payload=trip_payload,
        package_payload=package_payload,
        start_date=start_date,
        end_date=end_date,
    )


class SimpleApiClient:
    def __init__(self, api_base: str, timeout_seconds: int = 30):
        self.api_base = api_base.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _url(self, endpoint: str, params: dict[str, Any] | None = None) -> str:
        path = endpoint.lstrip("/")
        url = f"{self.api_base}/{path}"
        if params:
            query = parse.urlencode({k: v for k, v in params.items() if v is not None and v != ""})
            if query:
                url = f"{url}?{query}"
        return url

    def request(
        self,
        method: str,
        endpoint: str,
        token: str | None = None,
        payload: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
    ) -> Any:
        url = self._url(endpoint, params)
        body: bytes | None = None
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        req = request.Request(url=url, method=method.upper(), headers=headers, data=body)
        try:
            with request.urlopen(req, timeout=self.timeout_seconds) as resp:
                raw = resp.read().decode("utf-8")
        except error.HTTPError as exc:
            err_body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"{method.upper()} {url} failed ({exc.code}): {err_body}"
            ) from exc

        if not raw:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw


def extract_results(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        results = payload.get("results")
        if isinstance(results, list):
            return results
        data = payload.get("data")
        if isinstance(data, list):
            return data
    return []


def isoformat_z(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def primary_carrier(airline: str) -> str | None:
    text = (airline or "").strip()
    if not text:
        return None
    first = text.split("/")[0].strip()
    cleaned = re.sub(r"[^A-Za-z0-9]", "", first).upper()
    if not cleaned:
        return None
    return cleaned[:8]


class JourneyImporter:
    def __init__(
        self,
        client: SimpleApiClient,
        apply: bool,
        update_existing: bool,
        include_operations: bool,
        verbose: bool,
    ):
        self.client = client
        self.apply = apply
        self.update_existing = update_existing
        self.include_operations = include_operations
        self.verbose = verbose

        self.trip_created = 0
        self.trip_updated = 0
        self.trip_skipped = 0
        self.package_created = 0
        self.package_updated = 0
        self.package_skipped = 0
        self.flight_created = 0
        self.hotel_created = 0

    def log(self, message: str) -> None:
        print(message)

    def v(self, message: str) -> None:
        if self.verbose:
            print(message)

    def login(self, phone: str, password: str) -> str:
        data = self.client.request(
            "POST",
            "auth/staff/login/",
            payload={"phone": phone, "password": password},
        )

        token = None
        if isinstance(data, dict):
            token = data.get("accessToken") or data.get("access")

        if not token:
            raise RuntimeError("Login succeeded without an access token.")

        return token

    def find_trip_by_code(self, token: str, code: str) -> dict[str, Any] | None:
        payload = self.client.request(
            "GET",
            "trips",
            token=token,
            params={"search": code, "page_size": 200},
        )
        for item in extract_results(payload):
            if item.get("code") == code:
                return item
        return None

    def list_packages_for_trip(self, token: str, trip_id: str) -> list[dict[str, Any]]:
        payload = self.client.request(
            "GET",
            "packages",
            token=token,
            params={"trip": trip_id, "page_size": 200},
        )
        return extract_results(payload)

    def list_flights_for_package(self, token: str, package_id: str) -> list[dict[str, Any]]:
        payload = self.client.request(
            "GET",
            "flights",
            token=token,
            params={"package": package_id, "page_size": 200},
        )
        return extract_results(payload)

    def list_hotels_for_package(self, token: str, package_id: str) -> list[dict[str, Any]]:
        payload = self.client.request(
            "GET",
            "hotels",
            token=token,
            params={"package": package_id, "page_size": 200},
        )
        return extract_results(payload)

    def ensure_trip(self, token: str, plan: JourneyPlan) -> str:
        code = plan.trip_payload["code"]
        existing = self.find_trip_by_code(token, code)

        if existing:
            trip_id = str(existing["id"])
            if self.update_existing:
                self.client.request(
                    "PATCH",
                    f"trips/{trip_id}",
                    token=token,
                    payload=plan.trip_payload,
                )
                self.trip_updated += 1
                self.log(f"  ~ Updated trip {code}")
            else:
                self.trip_skipped += 1
                self.log(f"  - Trip exists {code} (skipped update)")
            return trip_id

        created = self.client.request("POST", "trips", token=token, payload=plan.trip_payload)
        trip_id = str(created["id"])
        self.trip_created += 1
        self.log(f"  + Created trip {code}")
        return trip_id

    def ensure_package(self, token: str, plan: JourneyPlan, trip_id: str) -> str:
        desired_code = plan.package_payload.get("package_code")
        desired_name = plan.package_payload.get("name")

        packages = self.list_packages_for_trip(token, trip_id)
        existing = None
        for package in packages:
            if desired_code and package.get("package_code") == desired_code:
                existing = package
                break
        if existing is None:
            for package in packages:
                if desired_name and package.get("name") == desired_name:
                    existing = package
                    break

        payload = dict(plan.package_payload)
        payload["trip"] = trip_id

        if existing:
            package_id = str(existing["id"])
            if self.update_existing:
                self.client.request(
                    "PATCH",
                    f"packages/{package_id}",
                    token=token,
                    payload=payload,
                )
                self.package_updated += 1
                self.log(f"  ~ Updated package {payload.get('package_code', package_id)}")
            else:
                self.package_skipped += 1
                self.log(f"  - Package exists {payload.get('package_code', package_id)} (skipped update)")
            return package_id

        created = self.client.request("POST", "packages", token=token, payload=payload)
        package_id = str(created["id"])
        self.package_created += 1
        self.log(f"  + Created package {payload.get('package_code', package_id)}")
        return package_id

    def flight_payloads(self, plan: JourneyPlan, package_id: str) -> list[dict[str, Any]]:
        carrier = primary_carrier(plan.row.airline)
        if not carrier:
            return []

        outbound_dep = datetime.combine(plan.start_date, time(3, 0, tzinfo=timezone.utc))
        outbound_arr = outbound_dep + timedelta(hours=5)
        return_dep = datetime.combine(plan.end_date, time(18, 0, tzinfo=timezone.utc))
        return_arr = return_dep + timedelta(hours=5)

        group_code = plan.trip_payload["code"][-6:]

        return [
            {
                "package": package_id,
                "leg": "OUTBOUND",
                "carrier": carrier,
                "flight_no": f"{group_code}1",
                "dep_airport": "EBB",
                "dep_dt": isoformat_z(outbound_dep),
                "arr_airport": "JED",
                "arr_dt": isoformat_z(outbound_arr),
                "group_pnr": f"{group_code}OUT",
            },
            {
                "package": package_id,
                "leg": "RETURN",
                "carrier": carrier,
                "flight_no": f"{group_code}2",
                "dep_airport": "JED",
                "dep_dt": isoformat_z(return_dep),
                "arr_airport": "EBB",
                "arr_dt": isoformat_z(return_arr),
                "group_pnr": f"{group_code}RET",
            },
        ]

    def hotel_payloads(self, plan: JourneyPlan, package_id: str) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []

        days = max((plan.end_date - plan.start_date).days, 1)
        split_point = plan.start_date + timedelta(days=max(days // 2, 1))
        if split_point >= plan.end_date:
            split_point = plan.end_date

        madinah = plan.row.madinah_hotel.strip()
        makkah = plan.row.makkah_hotel.strip()

        if madinah and split_point > plan.start_date:
            rows.append(
                {
                    "package": package_id,
                    "name": madinah,
                    "address": "Madinah, Saudi Arabia",
                    "room_type": "Standard",
                    "check_in": plan.start_date.isoformat(),
                    "check_out": split_point.isoformat(),
                }
            )

        if makkah and plan.end_date > split_point:
            rows.append(
                {
                    "package": package_id,
                    "name": makkah,
                    "address": "Makkah, Saudi Arabia",
                    "room_type": "Standard",
                    "check_in": split_point.isoformat(),
                    "check_out": plan.end_date.isoformat(),
                }
            )

        # Single-hotel fallback when split windows collapse.
        if not rows and madinah:
            rows.append(
                {
                    "package": package_id,
                    "name": madinah,
                    "address": "Saudi Arabia",
                    "room_type": "Standard",
                    "check_in": plan.start_date.isoformat(),
                    "check_out": plan.end_date.isoformat(),
                }
            )

        return rows

    def ensure_flights(self, token: str, plan: JourneyPlan, package_id: str) -> None:
        desired = self.flight_payloads(plan, package_id)
        if not desired:
            self.v("  - No flight data provided; skipping flights")
            return

        existing = self.list_flights_for_package(token, package_id)
        existing_keys = {
            (str(row.get("leg", "")), str(row.get("flight_no", "")), str(row.get("dep_dt", "")))
            for row in existing
        }

        for payload in desired:
            key = (payload["leg"], payload["flight_no"], payload["dep_dt"])
            if key in existing_keys:
                self.v(f"  - Flight exists {payload['flight_no']} ({payload['leg']})")
                continue
            self.client.request("POST", "flights", token=token, payload=payload)
            self.flight_created += 1
            self.log(f"  + Created flight {payload['flight_no']} ({payload['leg']})")

    def ensure_hotels(self, token: str, plan: JourneyPlan, package_id: str) -> None:
        desired = self.hotel_payloads(plan, package_id)
        if not desired:
            self.v("  - No hotel data provided; skipping hotels")
            return

        existing = self.list_hotels_for_package(token, package_id)
        existing_keys = {
            (str(row.get("name", "")), str(row.get("check_in", "")), str(row.get("check_out", "")))
            for row in existing
        }

        for payload in desired:
            key = (payload["name"], payload["check_in"], payload["check_out"])
            if key in existing_keys:
                self.v(f"  - Hotel exists {payload['name']} ({payload['check_in']}->{payload['check_out']})")
                continue
            self.client.request("POST", "hotels", token=token, payload=payload)
            self.hotel_created += 1
            self.log(f"  + Created hotel {payload['name']} ({payload['check_in']}->{payload['check_out']})")

    def dry_run(self, plans: list[JourneyPlan]) -> None:
        self.log("Dry run only. No API calls were made.\n")
        for plan in plans:
            self.log(f"[{plan.row.sn}] {plan.trip_payload['code']} :: {plan.trip_payload['name']}")
            self.log(
                "  trip  -> "
                + json.dumps(
                    {
                        "code": plan.trip_payload["code"],
                        "status": plan.trip_payload.get("status"),
                        "startDate": plan.trip_payload.get("startDate"),
                        "endDate": plan.trip_payload.get("endDate"),
                        "visibility": plan.trip_payload.get("visibility"),
                    }
                )
            )
            self.log(
                "  pkg   -> "
                + json.dumps(
                    {
                        "package_code": plan.package_payload.get("package_code"),
                        "price_minor_units": plan.package_payload.get("price_minor_units"),
                        "currency_code": plan.package_payload.get("currency_code"),
                        "capacity": plan.package_payload.get("capacity"),
                        "status": plan.package_payload.get("status"),
                    }
                )
            )
            self.log(
                f"  ops   -> flights={len(self.flight_payloads(plan, '<package-id>'))}, hotels={len(self.hotel_payloads(plan, '<package-id>'))}"
            )
        self.log("\nRun again with --apply to execute this import.")

    def apply_all(self, token: str, plans: list[JourneyPlan]) -> None:
        for plan in plans:
            self.log(f"[{plan.row.sn}] {plan.trip_payload['code']} :: {plan.trip_payload['name']}")
            trip_id = self.ensure_trip(token, plan)
            package_id = self.ensure_package(token, plan, trip_id)

            if self.include_operations:
                self.ensure_flights(token, plan, package_id)
                self.ensure_hotels(token, plan, package_id)

    def summary(self) -> str:
        return (
            "Summary:\n"
            f"  trips: created={self.trip_created}, updated={self.trip_updated}, skipped={self.trip_skipped}\n"
            f"  packages: created={self.package_created}, updated={self.package_updated}, skipped={self.package_skipped}\n"
            f"  flights created={self.flight_created}\n"
            f"  hotels created={self.hotel_created}"
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import Umrah journeys to backend using staff admin API endpoints."
    )
    parser.add_argument(
        "--source",
        default=os.getenv("ALHILAL_JOURNEYS_SOURCE", DEFAULT_SOURCE),
        help="Path to normalized markdown table file.",
    )
    parser.add_argument(
        "--api-base",
        default=os.getenv("ALHILAL_API_BASE", "http://localhost:8000/api/v1"),
        help="Base API URL, for example https://backend.example.com/api/v1",
    )
    parser.add_argument(
        "--phone",
        default=os.getenv("ALHILAL_STAFF_PHONE"),
        help="Staff phone number for /auth/staff/login/",
    )
    parser.add_argument(
        "--password",
        default=os.getenv("ALHILAL_STAFF_PASSWORD"),
        help="Staff password for /auth/staff/login/",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Execute writes (default is dry-run only).",
    )
    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="PATCH existing trips/packages instead of skipping them.",
    )
    parser.add_argument(
        "--skip-operations",
        action="store_true",
        help="Skip flight/hotel creation and only create trips/packages.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process only the first N rows from the markdown table.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose logging for skipped/existing entities.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = Path(args.source).expanduser().resolve()

    if not source.exists():
        print(f"Source file not found: {source}", file=sys.stderr)
        return 2

    try:
        rows = markdown_rows(source)
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to parse source markdown: {exc}", file=sys.stderr)
        return 2

    plans: list[JourneyPlan] = []
    for row in rows:
        try:
            plans.append(build_plan(row))
        except Exception as exc:  # noqa: BLE001
            print(f"Skipping row {row.sn}: {exc}", file=sys.stderr)

    if args.limit is not None:
        plans = plans[: max(args.limit, 0)]

    if not plans:
        print("No importable journey rows found.", file=sys.stderr)
        return 2

    client = SimpleApiClient(args.api_base)
    importer = JourneyImporter(
        client=client,
        apply=args.apply,
        update_existing=args.update_existing,
        include_operations=not args.skip_operations,
        verbose=args.verbose,
    )

    if not args.apply:
        importer.dry_run(plans)
        return 0

    if not args.phone or not args.password:
        print(
            "--apply requires --phone and --password (or ALHILAL_STAFF_PHONE / ALHILAL_STAFF_PASSWORD).",
            file=sys.stderr,
        )
        return 2

    try:
        token = importer.login(args.phone, args.password)
        importer.apply_all(token, plans)
    except Exception as exc:  # noqa: BLE001
        print(f"Import failed: {exc}", file=sys.stderr)
        return 1

    print()
    print(importer.summary())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
