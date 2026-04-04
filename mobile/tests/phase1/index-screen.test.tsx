import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import IndexScreen from '@/app/index';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { readGuestOnboardingSeen } from '@/lib/guest/onboarding';

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/guest/onboarding', () => ({
  readGuestOnboardingSeen: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
};

describe('Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('routes new guests into get-started', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false, isAuthenticated: false });
    (readGuestOnboardingSeen as jest.Mock).mockResolvedValue(false);

    render(<IndexScreen />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/get-started');
    });
  });

  it('routes returning guests into tabs', async () => {
    (useAuth as jest.Mock).mockReturnValue({ isLoading: false, isAuthenticated: false });
    (readGuestOnboardingSeen as jest.Mock).mockResolvedValue(true);

    render(<IndexScreen />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
