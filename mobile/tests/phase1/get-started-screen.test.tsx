import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import GetStartedScreen from '@/app/get-started';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { markGuestOnboardingSeen } from '@/lib/guest/onboarding';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/guest/onboarding', () => ({
  markGuestOnboardingSeen: jest.fn(),
  readGuestOnboardingSeen: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
};

describe('Get Started Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (markGuestOnboardingSeen as jest.Mock).mockResolvedValue(undefined);
  });

  it('marks onboarding seen and routes into the guest app', async () => {
    render(<GetStartedScreen />);

    expect(screen.getByText('Plan sacred travel with calmer guidance and clear next steps.')).toBeTruthy();

    fireEvent.press(screen.getByText('Get Started'));

    await waitFor(() => {
      expect(markGuestOnboardingSeen).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
