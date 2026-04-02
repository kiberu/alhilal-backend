import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'

import ReadinessPage from './page'
import { useAuth } from '@/hooks/useAuth'
import { ReadinessService } from '@/lib/api/services/readiness'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/services/readiness', () => ({
  ReadinessService: {
    list: jest.fn(),
  },
}))

describe('ReadinessPage', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ accessToken: 'test-access-token' })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
    ;(ReadinessService.list as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        count: 1,
        totalPages: 1,
        results: [
          {
            id: 'readiness-1',
            pilgrim_name: 'Amina Yusuf',
            booking_reference: 'BK-001',
            trip_name: 'July Umrah',
            trip_code: 'UMR-001',
            package_name: 'Standard',
            status: 'READY_FOR_REVIEW',
            payment_progress_percent: 90,
            ready_for_travel: false,
            requires_follow_up: false,
          },
        ],
      },
    })
  })

  it('loads the readiness queue and opens the selected readiness record', async () => {
    render(<ReadinessPage />)

    await waitFor(() => {
      expect(ReadinessService.list).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('Amina Yusuf')).toBeInTheDocument()
    })

    expect(screen.getByText('Travel Readiness')).toBeInTheDocument()
    expect(screen.getByText('READY_FOR_REVIEW')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Amina Yusuf'))

    expect(mockPush).toHaveBeenCalledWith('/dashboard/readiness/readiness-1')
  })
})
