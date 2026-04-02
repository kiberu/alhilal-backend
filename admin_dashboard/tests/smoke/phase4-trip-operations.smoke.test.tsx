import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'

import TripOperationsPage from '@/app/dashboard/trips/[id]/operations/page'
import { useAuth } from '@/hooks/useAuth'
import {
  MilestoneService,
  ResourceService,
  TripService,
  UserService,
} from '@/lib/api/services'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/services', () => ({
  MilestoneService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ResourceService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
  },
  TripService: {
    getById: jest.fn(),
  },
  UserService: {
    getUsers: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => (
    <button type="button" role="tab" {...props}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: any) => <div>{children}</div>,
}))

describe('Phase 4 trip operations smoke', () => {
  const mockPush = jest.fn()

  const unpublishedResource = {
    id: 'resource-1',
    trip: 'trip-1',
    package: null,
    title: 'Operational Guide',
    description: 'Pilgrim-facing guide',
    resourceType: 'UMRAH_GUIDE',
    order: 1,
    filePublicId: 'guides/operational-guide',
    fileFormat: 'pdf',
    fileUrl: 'https://cdn.alhilaltravels.com/guides/operational-guide.pdf',
    viewerMode: 'DOWNLOADABLE',
    metadata: {},
    isPinned: true,
    publishedAt: null,
    createdAt: '2026-04-03T09:00:00Z',
    updatedAt: '2026-04-03T09:00:00Z',
  }

  const publishedResource = {
    ...unpublishedResource,
    publishedAt: '2026-04-03T10:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useAuth as jest.Mock).mockReturnValue({ accessToken: 'test-access-token' })
    ;(useParams as jest.Mock).mockReturnValue({ id: 'trip-1' })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    })

    ;(TripService.getById as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'trip-1',
        name: 'July Umrah',
        status: 'OPEN_FOR_SALES',
        packages: [
          {
            id: 'package-1',
            name: 'Standard',
          },
        ],
      },
    })

    ;(MilestoneService.list as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    })

    ;(UserService.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    })

    ;(ResourceService.list as jest.Mock)
      .mockResolvedValueOnce({
        success: true,
        data: [unpublishedResource],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [publishedResource],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [unpublishedResource],
      })

    ;(ResourceService.publish as jest.Mock).mockResolvedValue({
      success: true,
      data: publishedResource,
    })

    ;(ResourceService.unpublish as jest.Mock).mockResolvedValue({
      success: true,
      data: unpublishedResource,
    })
  })

  it('loads trip operations and toggles resource publication for pilgrim-facing guides', async () => {
    render(<TripOperationsPage />)

    await waitFor(() => {
      expect(TripService.getById).toHaveBeenCalledWith('trip-1', 'test-access-token')
      expect(screen.getByText('July Umrah Operations')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Operational Guide')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Publish$/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /^Publish$/i }))

    await waitFor(() => {
      expect(ResourceService.publish).toHaveBeenCalledWith('resource-1', 'test-access-token')
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Unpublish$/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /^Unpublish$/i }))

    await waitFor(() => {
      expect(ResourceService.unpublish).toHaveBeenCalledWith('resource-1', 'test-access-token')
    })
  })
})
