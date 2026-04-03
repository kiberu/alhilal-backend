import React from "react";
import { Switch } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import NotificationsScreen from "@/app/notifications";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SupportService } from "@/lib/api/services/support";
import {
  readCachedDevices,
  readCachedNotificationPreferences,
  readCachedTripUpdates,
  readCachedTrips,
  syncDevices,
  syncNotificationPreferences,
  syncTripUpdates,
  syncTrips,
} from "@/lib/support/cache-sync";
import { registerCurrentDevice } from "@/lib/support/device-registration";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("@/lib/api/services/support", () => ({
  SupportService: {
    updateNotificationPreferences: jest.fn(),
  },
}));

jest.mock("@/lib/support/cache-sync", () => ({
  readCachedDevices: jest.fn(),
  readCachedNotificationPreferences: jest.fn(),
  readCachedTripUpdates: jest.fn(),
  readCachedTrips: jest.fn(),
  syncDevices: jest.fn(),
  syncNotificationPreferences: jest.fn(),
  syncTripUpdates: jest.fn(),
  syncTrips: jest.fn(),
}));

jest.mock("@/lib/support/device-registration", () => ({
  registerCurrentDevice: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

const cachedPreferences = {
  push_enabled: true,
  in_app_enabled: true,
  trip_updates: true,
  document_updates: true,
  readiness_updates: true,
  daily_program_updates: true,
  support_updates: true,
  marketing_updates: false,
  support_phone: "+256700111111",
  support_whatsapp: "+256700222222",
  support_email: "support@alhilaltravels.com",
  support_message: "Contact support for readiness blockers.",
  notification_provider_enabled: true,
  notification_provider_name: "native-apns-fcm",
  updated_at: "2026-04-03T08:00:00Z",
};

const cachedDevices = [
  {
    id: "device-1",
    installation_id: "install-1",
    platform: "IOS",
    device_name: "Pilgrim iPhone",
    device_model: "iPhone 15",
    os_version: "18.0",
    app_version: "3.0.0",
    locale: "en-UG",
    timezone: "Africa/Kampala",
    notifications_enabled: true,
    capability_flags: {},
    preference_state: {},
    provider_token_fields: {},
    last_seen_at: "2026-04-03T08:00:00Z",
    created_at: "2026-04-03T08:00:00Z",
    updated_at: "2026-04-03T08:00:00Z",
  },
];

describe("NotificationsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ accessToken: "test-token" });
    (useColorScheme as jest.Mock).mockReturnValue("light");
    (readCachedNotificationPreferences as jest.Mock).mockResolvedValue(cachedPreferences);
    (readCachedDevices as jest.Mock).mockResolvedValue(cachedDevices);
    (readCachedTrips as jest.Mock).mockResolvedValue([{ id: "trip-1" }]);
    (readCachedTripUpdates as jest.Mock).mockResolvedValue([
      {
        id: "update-1",
        title: "Coach arrival moved by 30 minutes",
        body_md: "Please stay in the lobby.",
        publish_at: "2026-04-03T11:00:00Z",
      },
    ]);
    (syncNotificationPreferences as jest.Mock).mockResolvedValue({
      data: cachedPreferences,
      source: "network",
      syncMetadata: {
        entitySet: "notification_preferences",
        lastSuccessfulSync: "2026-04-03T11:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: JSON.stringify(cachedPreferences),
        updatedAt: "2026-04-03T11:00:00Z",
      },
      error: null,
    });
    (syncDevices as jest.Mock).mockResolvedValue({
      data: cachedDevices,
      source: "network",
      syncMetadata: {
        entitySet: "devices",
        lastSuccessfulSync: "2026-04-03T11:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: JSON.stringify(cachedDevices),
        updatedAt: "2026-04-03T11:00:00Z",
      },
      error: null,
    });
    (syncTrips as jest.Mock).mockResolvedValue({
      data: [{ id: "trip-1" }],
      source: "network",
      syncMetadata: {
        entitySet: "trips",
        lastSuccessfulSync: "2026-04-03T11:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: JSON.stringify([{ id: "trip-1" }]),
        updatedAt: "2026-04-03T11:00:00Z",
      },
      error: null,
    });
    (syncTripUpdates as jest.Mock).mockResolvedValue({
      data: [],
      source: "network",
      syncMetadata: {
        entitySet: "trip_updates",
        lastSuccessfulSync: "2026-04-03T11:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: "[]",
        updatedAt: "2026-04-03T11:00:00Z",
      },
      error: null,
    });
    (SupportService.updateNotificationPreferences as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...cachedPreferences, push_enabled: false },
    });
    (registerCurrentDevice as jest.Mock).mockResolvedValue({ success: true });
  });

  it("renders the device list and support update feed from cached support data", async () => {
    render(<NotificationsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeTruthy();
    });

    expect(screen.getByText("Pilgrim iPhone")).toBeTruthy();
    expect(screen.getByText(/Coach arrival moved by 30 minutes/i)).toBeTruthy();
    expect(screen.getByText(/Provider: native-apns-fcm/i)).toBeTruthy();
  });

  it("persists preference changes and refreshes device registration context", async () => {
    render(<NotificationsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Push delivery")).toBeTruthy();
    });

    const switches = screen.UNSAFE_getAllByType(Switch);
    fireEvent(switches[0], "valueChange", false);

    await waitFor(() => {
      expect(SupportService.updateNotificationPreferences).toHaveBeenCalledWith(
        { push_enabled: false },
        "test-token"
      );
      expect(registerCurrentDevice).toHaveBeenCalledWith(
        "test-token",
        expect.objectContaining({ push_enabled: false })
      );
    });
  });
});
