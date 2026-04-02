export type WebsiteLeadInterestType = "CONSULTATION" | "GUIDE_REQUEST";

export type WebsiteLeadSubmission = {
  name: string;
  phone: string;
  email?: string;
  interestType: WebsiteLeadInterestType;
  travelWindow?: string;
  notes?: string;
  tripId?: string;
  source: string;
  contextLabel: string;
  ctaLabel: string;
  campaign?: string;
};

type WebsiteLeadPayload = {
  name: string;
  phone: string;
  email?: string;
  interest_type: WebsiteLeadInterestType;
  travel_window?: string;
  notes?: string;
  trip?: string;
  source: string;
  page_path: string;
  context_label: string;
  cta_label: string;
  campaign?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const RAW_PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL_INTERNAL || "http://localhost:8000/api/v1/";
const PUBLIC_API_BASE = RAW_PUBLIC_API_BASE.endsWith("/") ? RAW_PUBLIC_API_BASE : `${RAW_PUBLIC_API_BASE}/`;

function getTrackingParams(searchParams: URLSearchParams) {
  return {
    utm_source: searchParams.get("utm_source") || undefined,
    utm_medium: searchParams.get("utm_medium") || undefined,
    utm_campaign: searchParams.get("utm_campaign") || undefined,
    utm_content: searchParams.get("utm_content") || undefined,
    utm_term: searchParams.get("utm_term") || undefined,
  };
}

export function buildWebsiteLeadPayload(submission: WebsiteLeadSubmission, location: Location, referrer: string): WebsiteLeadPayload {
  const searchParams = new URLSearchParams(location.search);
  const campaign = submission.campaign || searchParams.get("campaign") || searchParams.get("utm_campaign") || undefined;

  return {
    name: submission.name,
    phone: submission.phone,
    email: submission.email || undefined,
    interest_type: submission.interestType,
    travel_window: submission.travelWindow || undefined,
    notes: submission.notes || undefined,
    trip: submission.tripId || undefined,
    source: submission.source,
    page_path: location.pathname,
    context_label: submission.contextLabel,
    cta_label: submission.ctaLabel,
    campaign,
    referrer: referrer || undefined,
    ...getTrackingParams(searchParams),
  };
}

export async function createWebsiteLead(submission: WebsiteLeadSubmission) {
  const payload = buildWebsiteLeadPayload(submission, window.location, document.referrer);
  const response = await fetch(`${PUBLIC_API_BASE}public/leads/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) as Record<string, unknown> : {};

  if (!response.ok) {
    const message = typeof data.detail === "string"
      ? data.detail
      : typeof data.error === "string"
        ? data.error
        : "We could not save your request. Please try again.";
    throw new Error(message);
  }

  return data;
}
