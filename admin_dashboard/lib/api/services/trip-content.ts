// lib/api/services/trip-content.ts
import { apiClient, type ApiResponse } from "../client"

/**
 * Service for trip content management API calls
 * (packages, itinerary, updates, guides, checklists, contacts, FAQs)
 */

// ============================================================================
// PACKAGES
// ============================================================================

export class PackageService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/packages?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/packages/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/packages', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/packages/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/packages/${id}`, {}, authToken)
  }
}

// ============================================================================
// ITINERARY
// ============================================================================

export class ItineraryService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/itinerary?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/itinerary/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    // Convert camelCase to snake_case for backend
    const backendData = {
      trip: data.trip,
      day_index: data.dayIndex,
      title: data.title,
      start_time: data.startTime,
      end_time: data.endTime,
      location: data.location,
      notes: data.notes,
      attach_url: data.attachUrl,
    }
    return apiClient.post('/itinerary', backendData, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    // Convert camelCase to snake_case for backend
    const backendData: any = {}
    if (data.dayIndex !== undefined) backendData.day_index = data.dayIndex
    if (data.title !== undefined) backendData.title = data.title
    if (data.startTime !== undefined) backendData.start_time = data.startTime
    if (data.endTime !== undefined) backendData.end_time = data.endTime
    if (data.location !== undefined) backendData.location = data.location
    if (data.notes !== undefined) backendData.notes = data.notes
    if (data.attachUrl !== undefined) backendData.attach_url = data.attachUrl
    
    return apiClient.patch(`/itinerary/${id}`, backendData, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/itinerary/${id}`, {}, authToken)
  }

  static async reorder(items: Array<{ id: string; dayIndex: number }>, authToken?: string): Promise<ApiResponse<void>> {
    // Convert camelCase to snake_case for backend
    const backendItems = items.map(item => ({
      id: item.id,
      day_index: item.dayIndex
    }))
    return apiClient.post('/itinerary/reorder', { items: backendItems }, {}, authToken)
  }
}

// ============================================================================
// TRIP UPDATES
// ============================================================================

export class TripUpdateService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/updates?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/updates/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/updates', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/updates/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/updates/${id}`, {}, authToken)
  }

  static async togglePin(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/updates/${id}/toggle_pin`, {}, {}, authToken)
  }
}

// ============================================================================
// TRAVEL GUIDES
// ============================================================================

export class TravelGuideService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/guides?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/guides/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/guides', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/guides/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/guides/${id}`, {}, authToken)
  }

  static async reorder(guides: Array<{ id: string; order: number }>, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.post('/guides/reorder', { guides }, {}, authToken)
  }
}

// ============================================================================
// CHECKLISTS
// ============================================================================

export class ChecklistService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/checklists?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/checklists/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/checklists', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/checklists/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/checklists/${id}`, {}, authToken)
  }
}

// ============================================================================
// EMERGENCY CONTACTS
// ============================================================================

export class EmergencyContactService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/contacts?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/contacts/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/contacts', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/contacts/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/contacts/${id}`, {}, authToken)
  }
}

// ============================================================================
// FAQS
// ============================================================================

export class FAQService {
  static async list(tripId: string, authToken?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/faqs?trip=${tripId}`, {}, authToken)
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/faqs/${id}`, {}, authToken)
  }

  static async create(data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/faqs', data, {}, authToken)
  }

  static async update(id: string, data: any, authToken?: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/faqs/${id}`, data, {}, authToken)
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/faqs/${id}`, {}, authToken)
  }

  static async reorder(faqs: Array<{ id: string; order: number }>, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.post('/faqs/reorder', { faqs }, {}, authToken)
  }
}

