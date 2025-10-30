import { renderHook, waitFor } from '@testing-library/react'
import { useAuth, useRequireAuth } from '../useAuth'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock next-auth
jest.mock('next-auth/react')
jest.mock('next/navigation')

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user and tokens when authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockSession.user)
    expect(result.current.accessToken).toBe('access-token')
    expect(result.current.refreshToken).toBe('refresh-token')
  })

  it('should return loading state', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should return unauthenticated state', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('should check admin role', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'Admin User',
        staffProfile: { role: 'ADMIN' },
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isAgent).toBe(false)
  })
})

describe('useRequireAuth', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('should redirect to login when not authenticated', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    renderHook(() => useRequireAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should not redirect when authenticated', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1' }, accessToken: 'token' },
      status: 'authenticated',
    })

    renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should not redirect while loading', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    })

    renderHook(() => useRequireAuth())

    expect(mockPush).not.toHaveBeenCalled()
  })
})

