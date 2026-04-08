import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import GuidanceScreen from '@/app/(tabs)/guidance';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncPublicGuidanceArticles } from '@/lib/support/public-cache';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/support/public-cache', () => ({
  syncPublicGuidanceArticles: jest.fn(),
  buildPublicFallbackNotice: jest.fn(() => ''),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Guidance Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useColorScheme as jest.Mock).mockReturnValue('light');

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

  it('renders search, featured guidance, and article navigation', async () => {
    render(<GuidanceScreen />);

    await waitFor(() => {
      expect(screen.getByText('Latest guidance')).toBeTruthy();
    });

    expect(screen.getByPlaceholderText('Search guidance')).toBeTruthy();
    expect(screen.getByText('Featured guidance')).toBeTruthy();
    expect(screen.getAllByText('First-Time Umrah Checklist').length).toBeGreaterThan(0);

    fireEvent.press(screen.getAllByText('First-Time Umrah Checklist')[0]);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/guidance/first-time-umrah-checklist');
    });
  });
});
