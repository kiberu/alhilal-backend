import { DashboardService } from '../services/dashboard'
import { TripService } from '../services/trips'
import { apiClient } from '../client'

jest.mock('../client')

describe('DashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch dashboard stats', async () => {
    const mockStats = {
      trips: { total: 10, active: 5 },
      bookings: { active: 20, eoi: 3 },
      pilgrims: { total: 50 },
      visas: { pending: 5, approved: 40 },
    }

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockStats,
    })

    const result = await DashboardService.getStats('test-token')

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('dashboard/stats'),
      undefined,
      'test-token'
    )
    expect(result.data).toEqual(mockStats)
  })

  it('should fetch dashboard activity', async () => {
    const mockActivity = [
      {
        id: '1',
        type: 'booking',
        title: 'New booking',
        description: 'Booking created',
        timestamp: '2025-01-01T00:00:00Z',
      },
    ]

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockActivity,
    })

    const result = await DashboardService.getActivity('test-token')

    expect(result.data).toEqual(mockActivity)
  })
})

describe('TripService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should list trips with filters', async () => {
    const mockTrips = {
      results: [
        { id: '1', name: 'Umrah 2025', code: 'UMR2025' },
      ],
      count: 1,
      totalPages: 1,
    }

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockTrips,
    })

    const filters = { page: 1, visibility: 'PUBLIC' }
    const result = await TripService.list(filters, 'test-token')

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('trips'),
      filters,
      'test-token'
    )
    expect(result.data).toEqual(mockTrips)
  })

  it('should get trip by id', async () => {
    const mockTrip = {
      id: '1',
      name: 'Umrah 2025',
      code: 'UMR2025',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
    }

    ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockTrip,
    })

    const result = await TripService.get('1', 'test-token')

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('trips/1'),
      undefined,
      'test-token'
    )
    expect(result.data).toEqual(mockTrip)
  })

  it('should create new trip', async () => {
    const newTrip = {
      code: 'UMR2025',
      name: 'Umrah 2025',
      cities: ['Makkah', 'Madinah'],
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      visibility: 'PUBLIC' as const,
    }

    const mockResponse = {
      id: '1',
      ...newTrip,
    }

    ;(apiClient.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockResponse,
    })

    const result = await TripService.create(newTrip, 'test-token')

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('trips'),
      newTrip,
      undefined,
      'test-token'
    )
    expect(result.data).toEqual(mockResponse)
  })

  it('should update trip', async () => {
    const updates = { name: 'Updated Umrah 2025' }

    ;(apiClient.patch as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: '1', ...updates },
    })

    const result = await TripService.update('1', updates, 'test-token')

    expect(apiClient.patch).toHaveBeenCalledWith(
      expect.stringContaining('trips/1'),
      updates,
      undefined,
      'test-token'
    )
  })

  it('should delete trip', async () => {
    ;(apiClient.delete as jest.Mock).mockResolvedValueOnce({
      success: true,
    })

    await TripService.delete('1', 'test-token')

    expect(apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('trips/1'),
      undefined,
      'test-token'
    )
  })

  it('should duplicate trip', async () => {
    const mockDuplicate = {
      id: '2',
      name: 'Umrah 2025 (Copy)',
      code: 'UMR2025-COPY',
    }

    ;(apiClient.post as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: mockDuplicate,
    })

    const result = await TripService.duplicate('1', 'test-token')

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('trips/1/duplicate'),
      undefined,
      undefined,
      'test-token'
    )
    expect(result.data).toEqual(mockDuplicate)
  })
})

