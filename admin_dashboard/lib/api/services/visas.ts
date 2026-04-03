import { DocumentService, type CreateDocumentData, type Document, type UpdateDocumentData } from "./documents"
import type { ApiResponse, Visa } from "@/types/models"

function mapDocumentStatusToVisaStatus(status: Document["status"]): Visa["status"] {
  if (status === "VERIFIED") {
    return "APPROVED"
  }
  if (status === "REJECTED") {
    return "REJECTED"
  }
  return "PENDING"
}

function mapDocumentToVisa(document: Document): Visa {
  const status = mapDocumentStatusToVisaStatus(document.status)

  return {
    id: document.id,
    booking: document.booking || "",
    number: document.document_number || "",
    visaType: document.trip_name || document.title || "Visa",
    status,
    applicationDate: document.created_at,
    approvedAt: status === "APPROVED" ? document.updated_at : undefined,
    rejectedAt: status === "REJECTED" ? document.updated_at : undefined,
    visaCopy: document.file_url,
    notes: document.notes,
    created_at: document.created_at,
    updated_at: document.updated_at,
  }
}

export const VisaService = {
  /**
   * Get all visas with optional filters.
   * Backed by the unified Document API.
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Visa[]; count: number; totalPages: number }>> => {
    const response = await DocumentService.list(
      { ...filters, document_type: "VISA" },
      token
    )

    if (!response.success || !response.data) {
      return response as ApiResponse<{ results: Visa[]; count: number; totalPages: number }>
    }

    return {
      success: true,
      data: {
        ...response.data,
        results: response.data.results.map(mapDocumentToVisa),
      },
    }
  },

  /**
   * Get a single visa by ID.
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Visa>> => {
    const response = await DocumentService.get(id, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Visa>
    }

    return {
      success: true,
      data: mapDocumentToVisa(response.data),
    }
  },

  /**
   * Create a new visa document.
   */
  create: async (data: Partial<Visa>, token?: string | null): Promise<ApiResponse<Visa>> => {
    const payload: CreateDocumentData = {
      pilgrim: (data as Partial<Visa> & { pilgrim?: string }).pilgrim as string,
      booking: data.booking,
      document_type: "VISA",
      title: data.visaType || "Visa",
      document_number: data.number,
      file_public_id: data.visaCopy || "",
      notes: data.notes,
    }

    const response = await DocumentService.create(payload, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Visa>
    }

    return {
      success: true,
      data: mapDocumentToVisa(response.data),
    }
  },

  /**
   * Update an existing visa document.
   */
  update: async (
    id: string,
    data: Partial<Visa>,
    token?: string | null
  ): Promise<ApiResponse<Visa>> => {
    const payload: UpdateDocumentData = {
      title: data.visaType,
      document_number: data.number,
      file_public_id: data.visaCopy,
      notes: data.notes,
      status:
        data.status === "APPROVED"
          ? "VERIFIED"
          : data.status === "REJECTED"
            ? "REJECTED"
            : data.status === "PENDING"
              ? "PENDING"
              : undefined,
    }

    const response = await DocumentService.update(id, payload, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Visa>
    }

    return {
      success: true,
      data: mapDocumentToVisa(response.data),
    }
  },

  /**
   * Delete a visa document.
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return DocumentService.delete(id, token)
  },

  /**
   * Bulk approve visas by verifying the underlying documents.
   */
  bulkApprove: async (visaIds: string[], token?: string | null): Promise<ApiResponse<void>> => {
    await Promise.all(visaIds.map((visaId) => DocumentService.verify(visaId, token)))
    return { success: true }
  },

  /**
   * Bulk reject visas by rejecting the underlying documents.
   */
  bulkReject: async (visaIds: string[], token?: string | null): Promise<ApiResponse<void>> => {
    await Promise.all(visaIds.map((visaId) => DocumentService.reject(visaId, "Rejected in bulk", token)))
    return { success: true }
  },
}
