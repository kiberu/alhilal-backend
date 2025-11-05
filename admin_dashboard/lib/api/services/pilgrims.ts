// lib/api/services/pilgrims.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  PilgrimProfile,
  PilgrimWithDetails,
  PilgrimFilters,
  CreatePilgrimData,
  PaginatedResponse,
} from "@/types/models"

/**
 * Service for pilgrim management API calls.
 */
export class PilgrimService {
  /**
   * GET /pilgrims
   * List all pilgrims with filtering and pagination.
   */
  static async list(
    filters?: PilgrimFilters,
    authToken?: string
  ): Promise<ApiResponse<PaginatedResponse<PilgrimProfile>>> {
    return apiClient.get<PaginatedResponse<PilgrimProfile>>(
      API_ENDPOINTS.PILGRIMS.LIST,
      filters,
      authToken
    )
  }

  /**
   * GET /pilgrims/:id
   * Get pilgrim details.
   */
  static async get(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<PilgrimProfile>> {
    return apiClient.get<PilgrimProfile>(
      API_ENDPOINTS.PILGRIMS.GET(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /pilgrims
   * Create pilgrim (no user account required).
   */
  static async create(
    data: CreatePilgrimData,
    authToken?: string
  ): Promise<ApiResponse<PilgrimProfile>> {
    return apiClient.post<PilgrimProfile>(
      API_ENDPOINTS.PILGRIMS.CREATE,
      data,
      undefined,
      authToken
    )
  }

  /**
   * PATCH /pilgrims/:id
   * Update pilgrim profile.
   */
  static async update(
    id: string,
    data: Partial<CreatePilgrimData>,
    authToken?: string
  ): Promise<ApiResponse<PilgrimProfile>> {
    return apiClient.patch<PilgrimProfile>(
      API_ENDPOINTS.PILGRIMS.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }

  /**
   * DELETE /pilgrims/:id
   * Delete pilgrim.
   */
  static async delete(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.PILGRIMS.DELETE(id),
      undefined,
      authToken
    )
  }

  /**
   * GET /pilgrims/:id/bookings
   * Get pilgrim's bookings.
   */
  static async getBookings(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<BookingWithDetails[]>> {
    return apiClient.get<BookingWithDetails[]>(
      API_ENDPOINTS.PILGRIMS.BOOKINGS(id),
      undefined,
      authToken
    )
  }

  /**
   * GET /pilgrims/:id/documents
   * Get pilgrim's documents (passports, visas).
   */
  static async getDocuments(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<{ passports: Passport[]; visas: Visa[] }>> {
    return apiClient.get<{ passports: Passport[]; visas: Visa[] }>(
      API_ENDPOINTS.PILGRIMS.DOCUMENTS(id),
      undefined,
      authToken
    )
  }

  /**
   * GET /pilgrims/export
   * Export pilgrims to CSV.
   */
  static async exportCSV(
    filters?: PilgrimFilters,
    authToken?: string
  ): Promise<Blob> {
    const response = await fetch(
      API_ENDPOINTS.PILGRIMS.EXPORT_CSV + "?" + new URLSearchParams(filters as Record<string, string>).toString(),
      {
        headers: {
          Authorization: `Bearer ${authToken || apiClient.getAuthToken()}`,
        },
      }
    )
    return response.blob()
  }

  /**
   * GET /pilgrims/import/template/
   * Download Excel template for bulk import.
   */
  static async downloadTemplate(authToken?: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.PILGRIMS.IMPORT_TEMPLATE, {
        headers: {
          Authorization: `Bearer ${authToken || apiClient.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `pilgrims_import_template_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`
      
      if (contentDisposition) {
        // Try multiple patterns to extract filename
        const patterns = [
          /filename\*=UTF-8''(.+)/,
          /filename="([^"]+)"/,
          /filename=([^;\s]+)/
        ]
        
        for (const pattern of patterns) {
          const match = contentDisposition.match(pattern)
          if (match && match[1]) {
            filename = decodeURIComponent(match[1])
            break
          }
        }
      }

      // Download file
      const blob = await response.blob()
      
      // Create a new blob with the correct MIME type if needed
      const excelBlob = new Blob([blob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = window.URL.createObjectURL(excelBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
    } catch (error) {
      console.error('Error downloading template:', error)
      throw error
    }
  }

  /**
   * POST /pilgrims/import/validate/
   * Validate import file and check for duplicates (Phase 1).
   */
  static async validateImport(
    file: File,
    authToken?: string
  ): Promise<ApiResponse<{
    success: boolean
    summary: {
      total: number
      valid: number
      duplicates: number
      errors: number
    }
    valid_rows: any[]
    duplicate_rows: any[]
    error_rows: any[]
    message: string
  }>> {
    const formData = new FormData()
    formData.append("file", file)
    
    return apiClient.postFormData(
      API_ENDPOINTS.PILGRIMS.IMPORT_VALIDATE,
      formData,
      undefined,
      authToken
    )
  }

  /**
   * POST /pilgrims/import/
   * Import pilgrims from Excel file (Phase 2).
   */
  static async importPilgrims(
    file: File,
    authToken?: string
  ): Promise<ApiResponse<{ success: boolean; imported: number; errors: string[]; warnings: string[]; message: string }>> {
    const formData = new FormData()
    formData.append("file", file)
    
    return apiClient.postFormData<{ success: boolean; imported: number; errors: string[]; warnings: string[]; message: string }>(
      API_ENDPOINTS.PILGRIMS.IMPORT,
      formData,
      undefined,
      authToken
    )
  }

  /**
   * POST /pilgrims/import
   * Import pilgrims from CSV (legacy).
   */
  static async importCSV(
    file: File,
    authToken?: string
  ): Promise<ApiResponse<{ imported: number; errors: Array<{ row: number; message: string }> }>> {
    const formData = new FormData()
    formData.append("file", file)
    
    return apiClient.postFormData<{ imported: number; errors: Array<{ row: number; message: string }> }>(
      API_ENDPOINTS.PILGRIMS.IMPORT_CSV,
      formData,
      undefined,
      authToken
    )
  }
}

