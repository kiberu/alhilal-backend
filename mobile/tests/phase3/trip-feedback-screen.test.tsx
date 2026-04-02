import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import TripFeedbackScreen from "@/app/trip-feedback/[tripId]";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SupportService } from "@/lib/api/services/support";
import { cacheDraft, clearDraft, readDraft } from "@/lib/storage";
import { readCachedTripFeedback, syncTripFeedback } from "@/lib/support/cache-sync";

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(),
}));

jest.mock("@/lib/api/services/support", () => ({
  SupportService: {
    saveTripFeedback: jest.fn(),
  },
}));

jest.mock("@/lib/storage", () => ({
  cacheDraft: jest.fn(),
  clearDraft: jest.fn(),
  readDraft: jest.fn(),
}));

jest.mock("@/lib/support/cache-sync", () => ({
  readCachedTripFeedback: jest.fn(),
  syncTripFeedback: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

const eligibleState = {
  eligible: true,
  reason: null,
  feedback: null,
};

describe("TripFeedbackScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ tripId: "trip-1" });
    (useAuth as jest.Mock).mockReturnValue({ accessToken: "test-token", isAuthenticated: true });
    (useColorScheme as jest.Mock).mockReturnValue("light");
    (readDraft as jest.Mock).mockResolvedValue(null);
    (readCachedTripFeedback as jest.Mock).mockResolvedValue(eligibleState);
    (syncTripFeedback as jest.Mock).mockResolvedValue({
      data: eligibleState,
      source: "network",
      syncMetadata: {
        entitySet: "feedback",
        lastSuccessfulSync: "2026-04-03T12:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: JSON.stringify(eligibleState),
        updatedAt: "2026-04-03T12:00:00Z",
      },
      error: null,
    });
    (SupportService.saveTripFeedback as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: "feedback-1",
        status: "SUBMITTED",
      },
    });
  });

  it("shows the ineligible state when the trip is not yet ready for feedback", async () => {
    (readCachedTripFeedback as jest.Mock).mockResolvedValue({
      eligible: false,
      reason: "Feedback opens after the trip has returned.",
      feedback: null,
    });
    (syncTripFeedback as jest.Mock).mockResolvedValue({
      data: {
        eligible: false,
        reason: "Feedback opens after the trip has returned.",
        feedback: null,
      },
      source: "network",
      syncMetadata: {
        entitySet: "feedback",
        lastSuccessfulSync: "2026-04-03T12:00:00Z",
        stale: false,
        hardFailure: false,
        lastError: null,
        lastKnownGoodPayload: null,
        updatedAt: "2026-04-03T12:00:00Z",
      },
      error: null,
    });

    render(<TripFeedbackScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Feedback is not available yet/i)).toBeTruthy();
    });
  });

  it("submits feedback and clears the local draft cache", async () => {
    render(<TripFeedbackScreen />);

    await waitFor(() => {
      expect(screen.getByText("Trip Feedback")).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("What stood out positively during your journey?"),
      "Support was calm and the guide stayed clear throughout."
    );

    await waitFor(() => {
      expect(cacheDraft).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByText("Submit Feedback"));

    await waitFor(() => {
      expect(SupportService.saveTripFeedback).toHaveBeenCalledWith(
        "trip-1",
        expect.objectContaining({
          status: "SUBMITTED",
          highlights: "Support was calm and the guide stayed clear throughout.",
        }),
        "test-token"
      );
      expect(clearDraft).toHaveBeenCalledWith("feedback_draft", "trip-1");
    });
  });
});
