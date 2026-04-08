import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import JourneysScreen from '@/app/(tabs)/journeys';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncPublicTrips } from '@/lib/support/public-cache';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/support/public-cache', () => ({
  syncPublicTrips: jest.fn(),
  buildPublicFallbackNotice: jest.fn(() => ''),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Journeys Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');

    (syncPublicTrips as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'trip-1',
          slug: 'july-fenna-umrah-2026',
          name: 'Fenna Umrah',
          excerpt: 'Featured Fenna departure with truthful package and booking information.',
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
        {
          id: 'trip-2',
          slug: 'august-family-umrah-2026',
          name: 'Muharram Family Umrah',
          excerpt: 'A family-aware departure with calmer pacing and household support.',
          featured: false,
          status: 'OPEN_FOR_SALES',
          commercial_month_label: 'August Umrah 2026',
          packages_count: 1,
          starting_price_minor_units: 4950000,
          starting_price_currency: 'UGX',
          default_nights: 10,
          start_date: '2026-08-08',
          end_date: '2026-08-18',
          cities: ['Makkah', 'Madinah'],
        },
      ],
      source: 'network',
      error: null,
    });
  });

  it('shows a simplified month filter flow without the old booking form', async () => {
    render(<JourneysScreen />);

    await waitFor(() => {
      expect(screen.getByText('Browse published departures by month.')).toBeTruthy();
    });

    expect(screen.queryByText('Compare departures before you message the team.')).toBeNull();
    expect(screen.queryByText('Request booking help')).toBeNull();
    expect(screen.queryByPlaceholderText('Journey name, city, or month')).toBeNull();

    expect(screen.getByText('July Umrah 2026')).toBeTruthy();
    expect(screen.getByText('August Umrah 2026')).toBeTruthy();
    expect(screen.getByText('Fenna Umrah')).toBeTruthy();
    expect(screen.getByText('Muharram Family Umrah')).toBeTruthy();

    fireEvent.press(screen.getByText('August Umrah 2026'));

    await waitFor(() => {
      expect(screen.queryByText('Fenna Umrah')).toBeNull();
    });

    expect(screen.getByText('Muharram Family Umrah')).toBeTruthy();
  });
});
