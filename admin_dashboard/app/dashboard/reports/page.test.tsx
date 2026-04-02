import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import ReportsPage from './page'
import { useAuth } from '@/hooks/useAuth'
import { ReportService } from '@/lib/api/services/reports'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/services/reports', () => ({
  ReportService: {
    getSummary: jest.fn(),
    getPaymentTarget: jest.fn(),
    getReadinessCompletion: jest.fn(),
    getVisaTicketProgress: jest.fn(),
    getTripPackagePerformance: jest.fn(),
    getLeadFunnel: jest.fn(),
    exportSummary: jest.fn(),
    exportPaymentTarget: jest.fn(),
    exportReadinessCompletion: jest.fn(),
    exportVisaTicketProgress: jest.fn(),
    exportTripPackagePerformance: jest.fn(),
    exportLeadFunnel: jest.fn(),
  },
}))

describe('ReportsPage', () => {
  const originalCreateElement = document.createElement.bind(document)
  const mockClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ accessToken: 'test-access-token' })

    window.URL.createObjectURL = jest.fn(() => 'blob:test-report')
    window.URL.revokeObjectURL = jest.fn()

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          click: mockClick,
          set href(_value: string) {},
          set download(_value: string) {},
        } as unknown as HTMLAnchorElement
      }

      return originalCreateElement(tagName)
    })

    ;(ReportService.getSummary as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'summary-report',
        cards: [
          {
            id: 'card-active',
            label: 'Active bookings',
            value: 12,
            unit: 'bookings',
            description: 'Bookings currently in BOOKED or CONFIRMED status.',
          },
        ],
      },
    })
    ;(ReportService.getPaymentTarget as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'payment-row',
            trip_name: 'July Umrah',
            package_name: 'Standard',
            active_bookings: 8,
            pilgrims_at_target: 6,
            attainment_rate: 75,
            sales_target: 12,
            sales_target_attainment_rate: 66.67,
          },
        ],
      },
    })
    ;(ReportService.getReadinessCompletion as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'readiness-row',
            trip_name: 'July Umrah',
            package_name: 'Standard',
            ready_for_travel: 5,
            ready_for_review: 2,
            blocked: 1,
            requires_follow_up: 1,
            completion_rate: 62.5,
          },
        ],
      },
    })
    ;(ReportService.getVisaTicketProgress as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'visa-row',
            trip_name: 'July Umrah',
            package_name: 'Standard',
            visa_verified: 6,
            ticket_issued: 5,
            documents_complete: 6,
            visa_verification_rate: 75,
            ticket_issue_rate: 62.5,
            visa_and_ticket_complete: 5,
            visa_and_ticket_complete_rate: 62.5,
          },
        ],
      },
    })
    ;(ReportService.getTripPackagePerformance as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        rows: [
          {
            id: 'performance-row',
            trip_name: 'July Umrah',
            package_name: 'Standard',
            capacity: 20,
            active_bookings: 8,
            confirmed_bookings: 7,
            occupancy_rate: 40,
            sales_target: 12,
            sales_target_attainment_rate: 66.67,
            total_paid_minor_units: 800000,
            average_payment_progress_percent: 71.25,
          },
        ],
      },
    })
    ;(ReportService.getLeadFunnel as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        totals: {
          id: 'lead-totals',
          total: 15,
          contacted: 7,
          qualified: 3,
          closed: 1,
        },
        rows: [
          {
            id: 'lead-row',
            status: 'CONTACTED',
            total: 7,
            consultation: 5,
            guide_request: 2,
            conversion_rate: 46.67,
          },
        ],
        sources: [
          {
            id: 'lead-source',
            source: 'homepage',
            total: 10,
            share_rate: 66.67,
          },
        ],
      },
    })
    ;(ReportService.exportSummary as jest.Mock).mockResolvedValue(new Blob(['summary']))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('loads the operational report surfaces and renders canonical report rows', async () => {
    render(<ReportsPage />)

    await waitFor(() => {
      expect(ReportService.getSummary).toHaveBeenCalledWith({ days: 30 }, 'test-access-token')
    })

    await waitFor(() => {
      expect(screen.getByText('homepage')).toBeInTheDocument()
    })

    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
    expect(screen.getByText('Payment Target Attainment')).toBeInTheDocument()
    expect(screen.getByText('Readiness Completion')).toBeInTheDocument()
    expect(screen.getByText('Lead Sources')).toBeInTheDocument()
    expect(screen.getAllByText('Standard').length).toBeGreaterThan(0)
    expect(screen.getByText('homepage')).toBeInTheDocument()
  })

  it('exports the summary snapshot as CSV', async () => {
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export Summary CSV/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Export Summary CSV/i }))

    await waitFor(() => {
      expect(ReportService.exportSummary).toHaveBeenCalledWith({ days: 30 }, 'test-access-token')
      expect(mockClick).toHaveBeenCalled()
    })
  })
})
