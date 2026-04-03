import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import SettingsPage from '@/app/dashboard/settings/page'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/lib/api/services/auth'
import { PlatformService } from '@/lib/api/services/platform'
import { toast } from 'sonner'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api/services/auth', () => ({
  AuthService: {
    changePassword: jest.fn(),
  },
}))

jest.mock('@/lib/api/services/platform', () => ({
  PlatformService: {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Phase 4 settings smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        name: 'Operations Lead',
        email: 'ops@alhilaltravels.com',
        phone: '+256700111111',
        staffProfile: { role: 'ADMIN' },
      },
      accessToken: 'test-access-token',
      isLoading: false,
      isAdmin: true,
    })

    ;(PlatformService.getSettings as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        otpSupportPhone: '+256700111111',
        otpSupportWhatsApp: '+256700222222',
        otpFallbackMessage: 'Call support.',
        mobileSupportPhone: '+256700333333',
        mobileSupportWhatsApp: '+256700444444',
        mobileSupportEmail: 'support@alhilaltravels.com',
        mobileSupportMessage: 'Support is available.',
        notificationProviderEnabled: true,
        notificationProviderName: 'native-apns-fcm',
        notificationProviderNotes: 'Provider agnostic bridge.',
        leadNotificationToEmail: 'ops@alhilaltravels.com',
        leadNotificationCcEmail: 'leadership@alhilaltravels.com',
        youtubeChannelId: 'channel-id',
        youtubePlaylistId: 'playlist-id',
        youtubeCacheSyncedAt: '2026-04-03T09:00:00Z',
        updatedAt: '2026-04-03T09:00:00Z',
      },
    })

    ;(AuthService.changePassword as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        message: 'Password changed successfully.',
        changedAt: '2026-04-03T10:00:00Z',
      },
    })
  })

  it('loads admin settings and completes the staff password change flow', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(PlatformService.getSettings).toHaveBeenCalledWith('test-access-token')
    })

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'staffpass123' },
    })
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'NewStaffPass456!' },
    })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'NewStaffPass456!' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }))

    await waitFor(() => {
      expect(AuthService.changePassword).toHaveBeenCalledWith(
        {
          currentPassword: 'staffpass123',
          newPassword: 'NewStaffPass456!',
          confirmPassword: 'NewStaffPass456!',
        },
        'test-access-token'
      )
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully.')
    })
  })
})
