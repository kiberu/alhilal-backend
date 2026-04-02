import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import MyDocumentsScreen from "@/app/my-documents";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  readCachedDocuments,
  readCachedNotificationPreferences,
  syncDocuments,
  syncNotificationPreferences,
} from "@/lib/support/cache-sync";
import { getCachedResource, openSupportResource } from "@/lib/support/file-cache";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("@/lib/support/cache-sync", () => ({
  readCachedDocuments: jest.fn(),
  readCachedNotificationPreferences: jest.fn(),
  syncDocuments: jest.fn(),
  syncNotificationPreferences: jest.fn(),
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

const cachedDocuments = [
  {
    id: "document-1",
    document_type: "PASSPORT",
    title: "Ugandan Passport",
    document_number: "A1234567",
    expiry_date: "2026-10-01",
    missing_item: false,
    is_expired: false,
    is_expiring_soon: true,
    verification_status: "VERIFIED",
    support_next_step: "Passport is expiring soon. Contact Al Hilal support.",
    file_url: "https://example.com/passport.pdf",
    file_format: "pdf",
    last_changed_at: "2026-04-03T10:00:00Z",
  },
  {
    id: "document-2",
    document_type: "VISA",
    title: "Umrah Visa",
    document_number: null,
    expiry_date: null,
    missing_item: true,
    is_expired: false,
    is_expiring_soon: false,
    verification_status: "MISSING",
    support_next_step: "Contact Al Hilal support to hand off the missing visa item.",
    file_url: null,
    file_format: null,
    last_changed_at: "2026-04-03T10:00:00Z",
  },
];

describe("MyDocumentsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ accessToken: "test-token", isAuthenticated: true });
    (useColorScheme as jest.Mock).mockReturnValue("light");
    (readCachedDocuments as jest.Mock).mockResolvedValue(cachedDocuments);
    (readCachedNotificationPreferences as jest.Mock).mockResolvedValue({
      support_phone: "+256700111111",
      support_whatsapp: "+256700222222",
      support_message: "Use support for document replacement handoff.",
    });
    (syncDocuments as jest.Mock).mockResolvedValue({
      data: cachedDocuments,
      source: "cache",
      syncMetadata: {
        entitySet: "documents",
        lastSuccessfulSync: "2026-04-03T10:00:00Z",
        stale: true,
        hardFailure: false,
        lastError: "Offline",
        lastKnownGoodPayload: JSON.stringify(cachedDocuments),
        updatedAt: "2026-04-03T10:10:00Z",
      },
      error: "Offline",
    });
    (syncNotificationPreferences as jest.Mock).mockResolvedValue({
      data: {},
      source: "network",
      syncMetadata: {
        entitySet: "notification_preferences",
        lastSuccessfulSync: "2026-04-03T10:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: "{}",
        updatedAt: "2026-04-03T10:10:00Z",
      },
      error: null,
    });
    (getCachedResource as jest.Mock).mockResolvedValue({ local_uri: "/tmp/passport.pdf" });
    (openSupportResource as jest.Mock).mockResolvedValue({ source: "cache" });
  });

  it("renders read-only document truth with cached reopen behavior", async () => {
    render(<MyDocumentsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Document Center")).toBeTruthy();
    });

    expect(screen.getByText("Offline")).toBeTruthy();
    expect(screen.getByText(/Use support for document replacement handoff/i)).toBeTruthy();
    expect(screen.getByText("Ugandan Passport")).toBeTruthy();
    expect(screen.getByText("Cached for offline reopen")).toBeTruthy();
    expect(screen.getByText(/Contact Al Hilal support to hand off the missing visa item/i)).toBeTruthy();

    fireEvent.press(screen.getByText("Open Cached Copy"));

    await waitFor(() => {
      expect(openSupportResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: "document-1",
          remoteUrl: "https://example.com/passport.pdf",
        })
      );
    });
  });
});
