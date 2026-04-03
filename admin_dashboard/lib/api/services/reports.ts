import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  LeadFunnelReport,
  PaymentTargetReport,
  ReadinessCompletionReport,
  ReportFilters,
  SummaryReport,
  TripPackagePerformanceReport,
  VisaTicketProgressReport,
} from "@/types/models"

function buildExportUrl(
  endpoint: string,
  filters?: ReportFilters
): string {
  const url = new URL(endpoint)

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value))
    }
  })

  return url.toString()
}

async function downloadCsv(
  endpoint: string,
  filters?: ReportFilters,
  authToken?: string
): Promise<Blob> {
  const response = await fetch(buildExportUrl(endpoint, filters), {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  })

  if (!response.ok) {
    throw new Error("Failed to export CSV report")
  }

  return response.blob()
}

export class ReportService {
  static async getSummary(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<SummaryReport>> {
    return apiClient.get<SummaryReport>(API_ENDPOINTS.REPORTS.SUMMARY, filters, authToken)
  }

  static async getPaymentTarget(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<PaymentTargetReport>> {
    return apiClient.get<PaymentTargetReport>(API_ENDPOINTS.REPORTS.PAYMENT_TARGET, filters, authToken)
  }

  static async getReadinessCompletion(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<ReadinessCompletionReport>> {
    return apiClient.get<ReadinessCompletionReport>(API_ENDPOINTS.REPORTS.READINESS, filters, authToken)
  }

  static async getVisaTicketProgress(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<VisaTicketProgressReport>> {
    return apiClient.get<VisaTicketProgressReport>(API_ENDPOINTS.REPORTS.VISA_TICKET_PROGRESS, filters, authToken)
  }

  static async getTripPackagePerformance(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<TripPackagePerformanceReport>> {
    return apiClient.get<TripPackagePerformanceReport>(
      API_ENDPOINTS.REPORTS.TRIP_PACKAGE_PERFORMANCE,
      filters,
      authToken
    )
  }

  static async getLeadFunnel(
    filters?: ReportFilters,
    authToken?: string
  ): Promise<ApiResponse<LeadFunnelReport>> {
    return apiClient.get<LeadFunnelReport>(API_ENDPOINTS.REPORTS.LEAD_FUNNEL, filters, authToken)
  }

  static async exportSummary(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.SUMMARY_EXPORT, filters, authToken)
  }

  static async exportPaymentTarget(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.PAYMENT_TARGET_EXPORT, filters, authToken)
  }

  static async exportReadinessCompletion(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.READINESS_EXPORT, filters, authToken)
  }

  static async exportVisaTicketProgress(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.VISA_TICKET_PROGRESS_EXPORT, filters, authToken)
  }

  static async exportTripPackagePerformance(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.TRIP_PACKAGE_PERFORMANCE_EXPORT, filters, authToken)
  }

  static async exportLeadFunnel(filters?: ReportFilters, authToken?: string): Promise<Blob> {
    return downloadCsv(API_ENDPOINTS.REPORTS.LEAD_FUNNEL_EXPORT, filters, authToken)
  }
}
