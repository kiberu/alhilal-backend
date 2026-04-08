import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface PublicLeadRequest {
  name: string;
  phone: string;
  email?: string;
  interestType: 'CONSULTATION' | 'GUIDE_REQUEST';
  travelWindow?: string;
  notes?: string;
  tripId?: string;
  source: string;
  pagePath: string;
  contextLabel: string;
  ctaLabel: string;
  campaign?: string;
  referrer?: string;
}

export interface PublicLeadResponse {
  id: string;
  name: string;
  phone: string;
  email: string;
  interestType: string;
  travelWindow: string;
  notes: string;
  tripId: string | null;
  source: string;
  pagePath: string;
  contextLabel: string;
  ctaLabel: string;
  campaign: string;
  status: string;
  createdAt: string;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeLeadResponse(rawValue: unknown): PublicLeadResponse {
  const raw = typeof rawValue === 'object' && rawValue !== null ? (rawValue as Record<string, unknown>) : {};
  return {
    id: stringValue(raw.id),
    name: stringValue(raw.name),
    phone: stringValue(raw.phone),
    email: stringValue(raw.email),
    interestType: stringValue(raw.interest_type),
    travelWindow: stringValue(raw.travel_window),
    notes: stringValue(raw.notes),
    tripId: typeof raw.trip === 'string' ? raw.trip : null,
    source: stringValue(raw.source),
    pagePath: stringValue(raw.page_path),
    contextLabel: stringValue(raw.context_label),
    ctaLabel: stringValue(raw.cta_label),
    campaign: stringValue(raw.campaign),
    status: stringValue(raw.status),
    createdAt: stringValue(raw.created_at),
  };
}

export class LeadsService {
  /**
   * Submit a public booking or consultation lead.
   */
  static async createPublicLead(payload: PublicLeadRequest): Promise<ApiResponse<PublicLeadResponse>> {
    const response = await apiClient.post<unknown>(API_ENDPOINTS.LEADS.PUBLIC_CREATE, {
      name: payload.name,
      phone: payload.phone,
      email: payload.email || '',
      interest_type: payload.interestType,
      travel_window: payload.travelWindow || '',
      notes: payload.notes || '',
      trip: payload.tripId || null,
      source: payload.source,
      page_path: payload.pagePath,
      context_label: payload.contextLabel,
      cta_label: payload.ctaLabel,
      campaign: payload.campaign || '',
      referrer: payload.referrer || '',
    });

    if (!response.success || !response.data) {
      return response as ApiResponse<PublicLeadResponse>;
    }

    return {
      ...response,
      data: normalizeLeadResponse(response.data),
    };
  }
}
