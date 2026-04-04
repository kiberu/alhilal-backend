import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import GuidanceDetailScreen from '@/app/guidance/[slug]';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { syncPublicGuidanceArticles, syncPublicGuidanceDetail } from '@/lib/support/public-cache';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/lib/support/public-cache', () => ({
  syncPublicGuidanceDetail: jest.fn(),
  syncPublicGuidanceArticles: jest.fn(),
  buildPublicFallbackNotice: jest.fn(() => ''),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

describe('Guidance Detail Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ slug: 'first-time-umrah-checklist' });
    (useColorScheme as jest.Mock).mockReturnValue('light');

    (syncPublicGuidanceDetail as jest.Mock).mockResolvedValue({
      source: 'network',
      error: null,
      data: {
        id: 'guide-1',
        slug: 'first-time-umrah-checklist',
        title: 'First-Time Umrah Checklist',
        description: 'A practical guide',
        category: 'Pilgrimage readiness',
        featured: false,
        featuredOrder: 0,
        imageUrl: '',
        readTime: '9 min read',
        publishedAt: '2026-04-03T09:00:00Z',
        updatedAt: '2026-04-03T09:00:00Z',
        authorName: 'Al Hilal Team',
        authorRoleLabel: '',
        intro: ['Intro paragraph'],
        sections: [
          {
            heading: 'Prepare your documents',
            paragraphs: ['Check passport validity early.'],
            checklist: ['Passport valid for at least 6 months'],
          },
        ],
        takeaway: 'Readiness first, then booking.',
        sources: [{ label: 'Ministry FAQ', url: 'https://haj.gov.sa/en/FAQ' }],
        keywords: [],
      },
    });

    (syncPublicGuidanceArticles as jest.Mock).mockResolvedValue({
      source: 'network',
      error: null,
      data: [],
    });
  });

  it('renders the new article reader and opens reference links', async () => {
    const openSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    render(<GuidanceDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('First-Time Umrah Checklist')).toBeTruthy();
    });

    expect(screen.getByText('Prepare your documents')).toBeTruthy();
    expect(screen.getByText('Checklist')).toBeTruthy();
    expect(screen.getByText('Key takeaway')).toBeTruthy();

    fireEvent.press(screen.getByText('Ministry FAQ'));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('https://haj.gov.sa/en/FAQ');
    });

    openSpy.mockRestore();
  });
});
