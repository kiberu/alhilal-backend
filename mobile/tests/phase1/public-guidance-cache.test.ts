import {
  syncPublicGuidanceArticles,
  syncPublicGuidanceDetail,
} from '@/lib/support/public-cache';
import { syncCollection, syncSingleton } from '@/lib/storage';

jest.mock('@/lib/storage', () => ({
  syncCollection: jest.fn(),
  syncSingleton: jest.fn(),
  readCollection: jest.fn(),
  readSingleton: jest.fn(),
}));

describe('public guidance cache fallbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns bundled guidance summaries when live guidance is unavailable', async () => {
    (syncCollection as jest.Mock).mockResolvedValue({
      data: [],
      source: 'empty',
      syncMetadata: {},
      error: 'Published guidance is unavailable right now.',
    });

    const result = await syncPublicGuidanceArticles();

    expect(result.source).toBe('fallback');
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.slug).toBe('first-time-umrah-checklist');
  });

  it('returns a bundled guidance detail when the live article is unavailable', async () => {
    (syncSingleton as jest.Mock).mockResolvedValue({
      data: null,
      source: 'empty',
      syncMetadata: {},
      error: 'Published guidance is unavailable right now.',
    });

    const result = await syncPublicGuidanceDetail('first-time-umrah-checklist');

    expect(result.source).toBe('fallback');
    expect(result.data?.slug).toBe('first-time-umrah-checklist');
    expect(result.data?.sections.length).toBeGreaterThan(0);
  });
});
