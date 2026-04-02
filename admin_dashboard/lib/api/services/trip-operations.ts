import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  CreateTripMilestoneData,
  CreateTripResourceData,
  TripMilestone,
  TripResource,
} from "@/types/models"

interface PaginatedApiResponse<T> {
  results?: T[]
}

interface TripMilestoneApiShape {
  id: string
  trip: string
  package?: string | null
  milestone_type: string
  title: string
  status: string
  target_date?: string | null
  actual_date?: string | null
  notes?: string
  owner?: string | null
  owner_name?: string | null
  is_public: boolean
  order: number
  created_at: string
  updated_at: string
}

interface TripResourceApiShape {
  id: string
  trip: string
  package?: string | null
  title: string
  description?: string
  resource_type: string
  order: number
  file_public_id: string
  file_format?: string | null
  file_url?: string | null
  viewer_mode: string
  metadata?: Record<string, unknown>
  is_pinned: boolean
  published_at?: string | null
  created_at: string
  updated_at: string
}

function mapMilestone(data: TripMilestoneApiShape): TripMilestone {
  return {
    id: data.id,
    trip: data.trip,
    package: data.package || null,
    milestoneType: data.milestone_type,
    title: data.title,
    status: data.status as TripMilestone["status"],
    targetDate: data.target_date || null,
    actualDate: data.actual_date || null,
    notes: data.notes || "",
    owner: data.owner || null,
    ownerName: data.owner_name || null,
    isPublic: data.is_public,
    order: data.order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function mapResource(data: TripResourceApiShape): TripResource {
  return {
    id: data.id,
    trip: data.trip,
    package: data.package || null,
    title: data.title,
    description: data.description || "",
    resourceType: data.resource_type as TripResource["resourceType"],
    order: data.order,
    filePublicId: data.file_public_id,
    fileFormat: data.file_format || null,
    fileUrl: data.file_url || null,
    viewerMode: data.viewer_mode as TripResource["viewerMode"],
    metadata: data.metadata || {},
    isPinned: data.is_pinned,
    publishedAt: data.published_at || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

function toMilestonePayload(data: Partial<CreateTripMilestoneData>) {
  return {
    trip: data.trip,
    package: data.package,
    milestone_type: data.milestoneType,
    title: data.title,
    status: data.status,
    target_date: data.targetDate,
    actual_date: data.actualDate,
    notes: data.notes,
    owner: data.owner,
    is_public: data.isPublic,
    order: data.order,
  }
}

function toResourcePayload(data: Partial<CreateTripResourceData>) {
  return {
    trip: data.trip,
    package: data.package,
    title: data.title,
    description: data.description,
    resource_type: data.resourceType,
    order: data.order,
    file_public_id: data.filePublicId,
    file_format: data.fileFormat,
    file_url: data.fileUrl,
    viewer_mode: data.viewerMode,
    metadata: data.metadata,
    is_pinned: data.isPinned,
    published_at: data.publishedAt,
  }
}

function mapListResponse<TShape, TMapped>(
  response: ApiResponse<TShape[] | PaginatedApiResponse<TShape>>,
  mapper: (value: TShape) => TMapped
): ApiResponse<TMapped[]> {
  const raw = response.data
  const items = Array.isArray(raw) ? raw : raw?.results || []

  return {
    ...response,
    data: items.map(mapper),
  }
}

export class MilestoneService {
  static async list(
    filters?: Record<string, string | number | boolean>,
    authToken?: string
  ): Promise<ApiResponse<TripMilestone[]>> {
    const response = await apiClient.get<TripMilestoneApiShape[] | PaginatedApiResponse<TripMilestoneApiShape>>(
      API_ENDPOINTS.MILESTONES.LIST,
      filters,
      authToken
    )

    return mapListResponse(response, mapMilestone)
  }

  static async create(
    data: CreateTripMilestoneData,
    authToken?: string
  ): Promise<ApiResponse<TripMilestone>> {
    const response = await apiClient.post<TripMilestoneApiShape>(
      API_ENDPOINTS.MILESTONES.CREATE,
      toMilestonePayload(data),
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapMilestone(response.data) : undefined,
    }
  }

  static async update(
    id: string,
    data: Partial<CreateTripMilestoneData>,
    authToken?: string
  ): Promise<ApiResponse<TripMilestone>> {
    const response = await apiClient.patch<TripMilestoneApiShape>(
      API_ENDPOINTS.MILESTONES.UPDATE(id),
      toMilestonePayload(data),
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapMilestone(response.data) : undefined,
    }
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.MILESTONES.DELETE(id), undefined, authToken)
  }
}

export class ResourceService {
  static async list(
    filters?: Record<string, string | number | boolean>,
    authToken?: string
  ): Promise<ApiResponse<TripResource[]>> {
    const response = await apiClient.get<TripResourceApiShape[] | PaginatedApiResponse<TripResourceApiShape>>(
      API_ENDPOINTS.RESOURCES.LIST,
      filters,
      authToken
    )

    return mapListResponse(response, mapResource)
  }

  static async create(
    data: CreateTripResourceData,
    authToken?: string
  ): Promise<ApiResponse<TripResource>> {
    const response = await apiClient.post<TripResourceApiShape>(
      API_ENDPOINTS.RESOURCES.CREATE,
      toResourcePayload(data),
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapResource(response.data) : undefined,
    }
  }

  static async update(
    id: string,
    data: Partial<CreateTripResourceData>,
    authToken?: string
  ): Promise<ApiResponse<TripResource>> {
    const response = await apiClient.patch<TripResourceApiShape>(
      API_ENDPOINTS.RESOURCES.UPDATE(id),
      toResourcePayload(data),
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapResource(response.data) : undefined,
    }
  }

  static async publish(id: string, authToken?: string): Promise<ApiResponse<TripResource>> {
    const response = await apiClient.post<TripResourceApiShape>(
      API_ENDPOINTS.RESOURCES.PUBLISH(id),
      {},
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapResource(response.data) : undefined,
    }
  }

  static async unpublish(id: string, authToken?: string): Promise<ApiResponse<TripResource>> {
    const response = await apiClient.post<TripResourceApiShape>(
      API_ENDPOINTS.RESOURCES.UNPUBLISH(id),
      {},
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapResource(response.data) : undefined,
    }
  }

  static async delete(id: string, authToken?: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.RESOURCES.DELETE(id), undefined, authToken)
  }
}
