import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import DailyProgramScreen from "@/app/daily-program/[tripId]";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  readCachedDailyProgram,
  readCachedTripDetail,
  syncDailyProgram,
  syncTripDetail,
} from "@/lib/support/cache-sync";
import { getCachedResource, openSupportResource } from "@/lib/support/file-cache";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("@/lib/support/cache-sync", () => ({
  readCachedDailyProgram: jest.fn(),
  readCachedTripDetail: jest.fn(),
  syncDailyProgram: jest.fn(),
  syncTripDetail: jest.fn(),
}));

jest.mock("@/lib/support/file-cache", () => ({
  getCachedResource: jest.fn(),
  openSupportResource: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

const cachedProgram = {
  trip_id: "trip-1",
  trip_code: "UMR-001",
  trip_name: "July Umrah",
  trip_status: "LIVE",
  current_day_index: 2,
  is_trip_live: true,
  pinned_resource: {
    id: "guide-1",
    title: "Pinned daily program",
    description: "",
    resource_type: "DAILY_PROGRAM",
    viewer_mode: "PDF",
    is_pinned: true,
    published_at: "2026-04-03T08:00:00Z",
    file_format: "pdf",
    metadata: {},
    package_name: "Standard",
    file_url_signed: "https://example.com/guide.pdf",
  },
  days: [
    {
      id: "day-1",
      day_index: 1,
      label: "Day 1",
      date: "2026-04-03",
      items: [
        {
          id: "item-1",
          day_index: 1,
          title: "Departure briefing",
          location: "Kampala",
          notes: "Arrive early.",
          start_time: "08:00",
          end_time: null,
        },
      ],
    },
  ],
  updated_at: "2026-04-03T09:00:00Z",
};

const staleSyncResult = {
  data: cachedProgram,
  source: "cache" as const,
  syncMetadata: {
    entitySet: "trip_daily_program" as const,
    lastSuccessfulSync: "2026-04-03T09:00:00Z",
    stale: true,
    hardFailure: false,
    lastError: "Network unavailable",
    lastKnownGoodPayload: JSON.stringify(cachedProgram),
    updatedAt: "2026-04-03T09:05:00Z",
  },
  error: "Network unavailable",
};

describe("DailyProgramScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tripId: "trip-1" });
    (useAuth as jest.Mock).mockReturnValue({ accessToken: "test-token", isAuthenticated: true });
    (useColorScheme as jest.Mock).mockReturnValue("light");
    (readCachedTripDetail as jest.Mock).mockResolvedValue({ id: "trip-1", name: "July Umrah" });
    (readCachedDailyProgram as jest.Mock).mockResolvedValue(cachedProgram);
    (syncTripDetail as jest.Mock).mockResolvedValue({
      ...staleSyncResult,
      syncMetadata: { ...staleSyncResult.syncMetadata, entitySet: "trip_detail" },
    });
    (syncDailyProgram as jest.Mock).mockResolvedValue(staleSyncResult);
    (getCachedResource as jest.Mock).mockResolvedValue({ local_uri: "/tmp/guide.pdf" });
    (openSupportResource as jest.Mock).mockResolvedValue({ source: "cache" });
  });

  it("renders stale cache messaging and reopens a cached guide", async () => {
    render(<DailyProgramScreen />);

    await waitFor(() => {
      expect(screen.getByText("Daily Program")).toBeTruthy();
    });

    expect(screen.getByText("Network unavailable")).toBeTruthy();
    expect(screen.getByText("Open Cached Guide")).toBeTruthy();
    expect(screen.getByText("Departure briefing")).toBeTruthy();

    fireEvent.press(screen.getByText("Open Cached Guide"));

    await waitFor(() => {
      expect(openSupportResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: "guide-1",
          remoteUrl: "https://example.com/guide.pdf",
        })
      );
    });
  });

  it("shows the unpublished empty state when no cached program exists", async () => {
    (readCachedDailyProgram as jest.Mock).mockResolvedValue(null);
    (syncDailyProgram as jest.Mock).mockResolvedValue({
      data: null,
      source: "empty",
      syncMetadata: {
        entitySet: "trip_daily_program",
        lastSuccessfulSync: null,
        stale: false,
        hardFailure: true,
        lastError: "No published daily program",
        lastKnownGoodPayload: null,
        updatedAt: "2026-04-03T10:00:00Z",
      },
      error: "No published daily program",
    });

    render(<DailyProgramScreen />);

    await waitFor(() => {
      expect(screen.getByText(/No daily program cached yet/i)).toBeTruthy();
    });
  });
});
