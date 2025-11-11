import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { ApiResponse } from "@/types/models"

export interface Document {
  id: string
  pilgrim: string
  document_type: "PASSPORT" | "VISA" | "VACCINATION" | "ID_CARD" | "BIRTH_CERTIFICATE" | "TRAVEL_PERMIT" | "OTHER"
  title: string
  document_number?: string
  issuing_country?: string
  file_public_id: string
  file_url?: string
  issue_date?: string
  expiry_date?: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  rejection_reason?: string
  notes?: string
  trip?: string
  trip_name?: string
  booking?: string
  booking_reference?: string
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface CreateDocumentData {
  pilgrim: string
  document_type: "PASSPORT" | "VISA" | "VACCINATION" | "ID_CARD" | "BIRTH_CERTIFICATE" | "TRAVEL_PERMIT" | "OTHER"
  title: string
  document_number?: string
  issuing_country?: string
  file_public_id: string
  issue_date?: string
  expiry_date?: string
  trip?: string
  booking?: string
  notes?: string
}

export interface UpdateDocumentData {
  title?: string
  document_number?: string
  issuing_country?: string
  file_public_id?: string
  issue_date?: string
  expiry_date?: string
  status?: "PENDING" | "VERIFIED" | "REJECTED"
  rejection_reason?: string
  notes?: string
  trip?: string
  booking?: string
}

export const DocumentService = {
  /**
   * Get all documents with optional filters
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Document[]; count: number; totalPages: number }>> => {
    return apiClient.get(API_ENDPOINTS.DOCUMENTS.LIST, filters, token)
  },

  /**
   * Get a single document by ID
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Document>> => {
    return apiClient.get(API_ENDPOINTS.DOCUMENTS.GET(id), undefined, token)
  },

  /**
   * Create a new document
   */
  create: async (data: CreateDocumentData, token?: string | null): Promise<ApiResponse<Document>> => {
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.CREATE, data, undefined, token)
  },

  /**
   * Update an existing document
   */
  update: async (
    id: string,
    data: UpdateDocumentData,
    token?: string | null
  ): Promise<ApiResponse<Document>> => {
    return apiClient.patch(API_ENDPOINTS.DOCUMENTS.UPDATE(id), data, undefined, token)
  },

  /**
   * Delete a document
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id), undefined, token)
  },

  /**
   * Verify a document (change status to VERIFIED)
   */
  verify: async (id: string, token?: string | null): Promise<ApiResponse<Document>> => {
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.VERIFY(id), {}, undefined, token)
  },

  /**
   * Reject a document (change status to REJECTED)
   */
  reject: async (
    id: string,
    rejectionReason: string,
    token?: string | null
  ): Promise<ApiResponse<Document>> => {
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.REJECT(id), { rejection_reason: rejectionReason }, undefined, token)
  },

  /**
   * Get documents expiring soon (within a certain number of days)
   */
  getExpiringSoon: async (
    days: number = 30,
    token?: string | null
  ): Promise<ApiResponse<Document[]>> => {
    return apiClient.get(API_ENDPOINTS.DOCUMENTS.EXPIRING_SOON, { days }, token)
  },

  /**
   * Get expired documents
   */
  getExpired: async (token?: string | null): Promise<ApiResponse<Document[]>> => {
    return apiClient.get(API_ENDPOINTS.DOCUMENTS.EXPIRED, undefined, token)
  },
}

