import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import HomeScreen from '@/app/(tabs)/index';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncPublicGuidanceArticles, syncPublicTrips } from '@/lib/support/public-cache';

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/support/public-cache', () => ({
  syncPublicTrips: jest.fn(),
  syncPublicGuidanceArticles: jest.fn(),
  buildPublicFallbackNotice: jest.fn(() => ''),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Public Home Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null });

    (syncPublicTrips as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'trip-1',
          slug: 'july-fenna-umrah-2026',
          name: 'Fenna Umrah',
          excerpt: 'Featured Fenna departure with structured support and truthful package information.',
          featured: true,
          status: 'OPEN_FOR_SALES',
          commercial_month_label: 'July Umrah 2026',
          packages_count: 1,
          starting_price_minor_units: 4650000,
          starting_price_currency: 'UGX',
          default_nights: 8,
          start_date: '2026-07-12',
          end_date: '2026-07-20',
          cities: ['Makkah', 'Madinah'],
        },
      ],
      source: 'network',
      error: null,
    });

    (syncPublicGuidanceArticles as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'guide-1',
          slug: 'first-time-umrah-checklist',
          title: 'First-Time Umrah Checklist',
          description: 'A practical guide for first-time pilgrims.',
          category: 'Pilgrimage readiness',
          featured: true,
          featuredOrder: 1,
          readTime: '9 min read',
          updatedAt: '2026-04-03T09:00:00Z',
          publishedAt: '2026-04-03T09:00:00Z',
          authorName: 'Al Hilal Team',
          imageUrl: 'https://www.alhilaltravels.com/assets/journeys/guidance.jpg',
        },
      ],
      source: 'network',
      error: null,
    });
  });

  it('renders the redesigned public home and routes into guest actions', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Plan your pilgrimage with clarity and care.')).toBeTruthy();
    });

    expect(screen.getByText("Answer Allah's Call")).toBeTruthy();
    expect(screen.getByText('Featured journeys')).toBeTruthy();
    expect(screen.getByText('Latest guidance')).toBeTruthy();
    expect(screen.getByText('Quick actions')).toBeTruthy();
    expect(screen.getByText('Trusted partners')).toBeTruthy();
    expect(screen.queryByText('Booked pilgrim?')).toBeNull();
    expect(screen.getAllByText('Pilgrim Access').length).toBeGreaterThan(0);
    expect(screen.getByText('Fenna Umrah')).toBeTruthy();
    expect(screen.getByText('First-Time Umrah Checklist')).toBeTruthy();

    fireEvent.press(screen.getByText('Plan Your Pilgrimage'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/journeys');

    fireEvent.press(screen.getAllByText('Pilgrim Access')[0]);
    expect(mockRouter.push).toHaveBeenCalledWith('/pilgrim-access');
  });
});
