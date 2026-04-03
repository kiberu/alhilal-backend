import { DocumentService, type CreateDocumentData, type Document, type UpdateDocumentData } from "./documents"
import type { ApiResponse, Passport } from "@/types/models"

function mapDocumentToPassport(document: Document): Passport {
  return {
    id: document.id,
    pilgrim: document.pilgrim,
    number: document.document_number || "",
    country: document.issuing_country || "",
    expiryDate: document.expiry_date || "",
    scannedCopy: document.file_url,
    created_at: document.created_at,
    updated_at: document.updated_at,
  }
}

export const PassportService = {
  /**
   * Get all passports with optional filters.
   * Backed by the unified Document API.
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Passport[]; count: number; totalPages: number }>> => {
    const response = await DocumentService.list(
      { ...filters, document_type: "PASSPORT" },
      token
    )

    if (!response.success || !response.data) {
      return response as ApiResponse<{ results: Passport[]; count: number; totalPages: number }>
    }

    return {
      success: true,
      data: {
        ...response.data,
        results: response.data.results.map(mapDocumentToPassport),
      },
    }
  },

  /**
   * Get a single passport by ID.
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Passport>> => {
    const response = await DocumentService.get(id, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Passport>
    }

    return {
      success: true,
      data: mapDocumentToPassport(response.data),
    }
  },

  /**
   * Create a new passport document.
   */
  create: async (data: Partial<Passport>, token?: string | null): Promise<ApiResponse<Passport>> => {
    const payload: CreateDocumentData = {
      pilgrim: data.pilgrim as string,
      document_type: "PASSPORT",
      title: "Passport",
      document_number: data.number,
      issuing_country: data.country,
      file_public_id: data.scannedCopy || "",
      expiry_date: data.expiryDate,
    }

    const response = await DocumentService.create(payload, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Passport>
    }

    return {
      success: true,
      data: mapDocumentToPassport(response.data),
    }
  },

  /**
   * Update an existing passport document.
   */
  update: async (
    id: string,
    data: Partial<Passport>,
    token?: string | null
  ): Promise<ApiResponse<Passport>> => {
    const payload: UpdateDocumentData = {
      document_number: data.number,
      issuing_country: data.country,
      file_public_id: data.scannedCopy,
      expiry_date: data.expiryDate,
    }

    const response = await DocumentService.update(id, payload, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Passport>
    }

    return {
      success: true,
      data: mapDocumentToPassport(response.data),
    }
  },

  /**
   * Delete a passport document.
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return DocumentService.delete(id, token)
  },

  /**
   * Get expiring passports (within a certain number of days).
   */
  getExpiring: async (
    days: number = 90,
    token?: string | null
  ): Promise<ApiResponse<Passport[]>> => {
    const response = await DocumentService.getExpiringSoon(days, token)
    if (!response.success || !response.data) {
      return response as ApiResponse<Passport[]>
    }

    return {
      success: true,
      data: response.data
        .filter((document) => document.document_type === "PASSPORT")
        .map(mapDocumentToPassport),
    }
  },
}
