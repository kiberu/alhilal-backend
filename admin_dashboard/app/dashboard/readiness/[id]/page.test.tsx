import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'

import ReadinessDetailPage from './page'
import { useAuth } from '@/hooks/useAuth'
import { ReadinessService } from '@/lib/api/services/readiness'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/services/readiness', () => ({
  ReadinessService: {
    get: jest.fn(),
    update: jest.fn(),
    validateReady: jest.fn(),
    clearValidation: jest.fn(),
  },
}))

const readinessRecord = {
  id: 'readiness-1',
  pilgrim: 'pilgrim-1',
  booking: 'booking-1',
  trip: 'trip-1',
  pilgrim_name: 'Amina Yusuf',
  booking_reference: 'BK-001',
  trip_name: 'July Umrah',
  trip_code: 'UMR-001',
  package_name: 'Standard',
  booking_status: 'BOOKED',
  package_status: 'SELLING',
  trip_start_date: '2026-07-01',
  trip_end_date: '2026-07-14',
  status: 'READY_FOR_REVIEW',
  payment_progress_percent: 90,
  ready_for_travel: false,
  requires_follow_up: false,
  darasa_one_completed: true,
  darasa_two_completed: true,
  send_off_completed: true,
  validation_notes: '',
  profile_complete: true,
  passport_valid: true,
  visa_verified: true,
  documents_complete: true,
  payment_target_met: true,
  ticket_issued: true,
  missing_items: ['Staff validation for travel-ready pass'],
  blockers: [],
  blocking_reason: '',
  validated_at: null,
}

describe('ReadinessDetailPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ accessToken: 'test-access-token' })
    ;(useParams as jest.Mock).mockReturnValue({ id: 'readiness-1' })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })
    ;(ReadinessService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: readinessRecord,
    })
    ;(ReadinessService.update as jest.Mock).mockResolvedValue({
      success: true,
      data: readinessRecord,
    })
    ;(ReadinessService.validateReady as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...readinessRecord, status: 'READY_FOR_TRAVEL', ready_for_travel: true },
    })
    ;(ReadinessService.clearValidation as jest.Mock).mockResolvedValue({
      success: true,
      data: readinessRecord,
    })
  })

  it('loads the readiness detail and saves manual check updates', async () => {
    render(<ReadinessDetailPage />)

    await waitFor(() => {
      expect(ReadinessService.get).toHaveBeenCalledWith('readiness-1', 'test-access-token')
    })

    await waitFor(() => {
      expect(screen.getByText('Manual Readiness Checks')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save checks/i }))

    await waitFor(() => {
      expect(ReadinessService.update).toHaveBeenCalledWith(
        'readiness-1',
        expect.objectContaining({
          darasa_one_completed: true,
          darasa_two_completed: true,
          send_off_completed: true,
        }),
        'test-access-token'
      )
    })
  })

  it('validates and clears the travel-ready pass from the staff detail view', async () => {
    render(<ReadinessDetailPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Validate ready/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Validate ready/i }))

    await waitFor(() => {
      expect(ReadinessService.validateReady).toHaveBeenCalledWith('readiness-1', '', 'test-access-token')
    })

    fireEvent.click(screen.getByRole('button', { name: /Clear validation/i }))

    await waitFor(() => {
      expect(ReadinessService.clearValidation).toHaveBeenCalledWith('readiness-1', 'test-access-token')
    })
  })
})
