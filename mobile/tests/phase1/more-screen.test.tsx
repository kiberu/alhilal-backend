import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import MoreScreen from '@/app/(tabs)/more';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('More Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null, logout: jest.fn() });
  });

  it('routes to guest support pages and settings', () => {
    render(<MoreScreen />);

    fireEvent.press(screen.getByText('About Al Hilal'));
    expect(mockRouter.push).toHaveBeenCalledWith('/about');

    fireEvent.press(screen.getByText('Settings and Preferences'));
    expect(mockRouter.push).toHaveBeenCalledWith('/settings');

    fireEvent.press(screen.getByText('Pilgrim Access Login'));
    expect(mockRouter.push).toHaveBeenCalledWith('/pilgrim-access');
  });
});
