import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import PhoneLoginScreen from '@/app/(auth)/phone-login';
import { useColorScheme } from '@/hooks/use-color-scheme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Pilgrim Access Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('shows the v1 coming soon message without the old login form', () => {
    render(<PhoneLoginScreen />);

    expect(screen.getByText('Pilgrim Access')).toBeTruthy();
    expect(
      screen.getByText('Pilgrim dashboard features like trip updates, self-service tools, and richer in app support coming in next versions')
    ).toBeTruthy();
    expect(screen.queryByPlaceholderText('712345678')).toBeNull();
    expect(screen.queryByText('Login')).toBeNull();
  });
});
