import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import JourneyDetailScreen from '@/app/journey/[id]';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncPublicGuidanceArticles, syncPublicTripDetail } from '@/lib/support/public-cache';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/support/public-cache', () => ({
  syncPublicTripDetail: jest.fn(),
  syncPublicGuidanceArticles: jest.fn(),
  buildPublicFallbackNotice: jest.fn(() => ''),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Journey Detail Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'trip-1' });
    (useColorScheme as jest.Mock).mockReturnValue('light');

    (syncPublicTripDetail as jest.Mock).mockResolvedValue({
      source: 'network',
      error: null,
      data: {
        id: 'trip-1',
        slug: 'july-fenna-umrah-2026',
        name: 'Fenna Umrah',
        excerpt: 'Featured Fenna departure for July pilgrims.',
        status: 'OPEN_FOR_SALES',
        starting_price_minor_units: 4650000,
        starting_price_currency: 'UGX',
        start_date: '2026-07-12',
        end_date: '2026-07-20',
        default_nights: 8,
        cities: ['Makkah', 'Madinah'],
        packages: [
          {
            id: 'pkg-1',
            package_code: 'FENNA-STD',
            name: 'Standard Package',
            start_date: '2026-07-12',
            end_date: '2026-07-20',
            nights: 8,
            price_minor_units: 4650000,
            currency: 'UGX',
            status: 'SELLING',
            capacity: 24,
            sales_target: 20,
            hotel_booking_month: 'APRIL',
            airline_booking_month: 'MARCH',
            flights: [],
            hotels: [],
          },
        ],
        guide_sections: [],
        faqs: [],
        milestones: [],
      },
    });

    (syncPublicGuidanceArticles as jest.Mock).mockResolvedValue({
      source: 'network',
      error: null,
      data: [
        {
          id: 'guide-2',
          slug: 'umrah-documents',
          title: 'Umrah document guide',
          description: 'Checklist for documents.',
          category: 'Preparation',
          featured: false,
          featuredOrder: 0,
          readTime: '5 min read',
          updatedAt: '2026-04-03T09:00:00Z',
          publishedAt: '2026-04-03T09:00:00Z',
          authorName: 'Al Hilal Team',
          imageUrl: '',
        },
      ],
    });
  });

  it('renders redesigned journey detail with how-to-book and booking actions', async () => {
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    render(<JourneyDetailScreen />);

    expect(await screen.findByText('Pricing and booking window')).toBeTruthy();

    expect(screen.getByText('Standard Package')).toBeTruthy();
    expect(screen.getByText('Read how to book')).toBeTruthy();
    expect(screen.getAllByText('Plan This Trip').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Book Trip').length).toBeGreaterThan(0);

    fireEvent.press(screen.getByText('Read how to book'));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('https://www.alhilaltravels.com/how-to-book');
    });

    fireEvent.press(screen.getAllByText('Book Trip')[0]);

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('phone=256700773535'));
    });

    openSpy.mockRestore();
  });
});
