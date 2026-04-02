import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SupportService, type TripFeedbackPayload, type TripFeedbackState } from "@/lib/api/services";
import { cacheDraft, clearDraft, readDraft } from "@/lib/storage";
import { readCachedTripFeedback, syncTripFeedback } from "@/lib/support/cache-sync";

interface FeedbackFormState {
  overall_rating: number | null;
  support_rating: number | null;
  accommodation_rating: number | null;
  transport_rating: number | null;
  highlights: string;
  improvements: string;
  testimonial_opt_in: boolean;
  follow_up_requested: boolean;
}

function emptyForm(): FeedbackFormState {
  return {
    overall_rating: null,
    support_rating: null,
    accommodation_rating: null,
    transport_rating: null,
    highlights: "",
    improvements: "",
    testimonial_opt_in: false,
    follow_up_requested: false,
  };
}

function formatSyncTime(value?: string | null) {
  if (!value) {
    return "Waiting for the first feedback sync";
  }

  return `Last sync ${new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function buildPayload(form: FeedbackFormState, status: "DRAFT" | "SUBMITTED"): TripFeedbackPayload {
  const payload: TripFeedbackPayload = {
    status,
    highlights: form.highlights,
    improvements: form.improvements,
    testimonial_opt_in: form.testimonial_opt_in,
    follow_up_requested: form.follow_up_requested,
  };

  if (form.overall_rating) payload.overall_rating = form.overall_rating;
  if (form.support_rating) payload.support_rating = form.support_rating;
  if (form.accommodation_rating) payload.accommodation_rating = form.accommodation_rating;
  if (form.transport_rating) payload.transport_rating = form.transport_rating;

  return payload;
}

export default function TripFeedbackScreen() {
  const { tripId } = useLocalSearchParams();
  const resolvedTripId = typeof tripId === "string" ? tripId : null;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [feedbackState, setFeedbackState] = useState<TripFeedbackState | null>(null);
  const [form, setForm] = useState<FeedbackFormState>(emptyForm());
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savingMode, setSavingMode] = useState<"DRAFT" | "SUBMITTED" | null>(null);

  const feedbackDraftKey = resolvedTripId || "feedback";

  const hydrateFromCache = useCallback(async () => {
    if (!resolvedTripId) {
      return;
    }

    const [cachedState, cachedDraft] = await Promise.all([
      readCachedTripFeedback(resolvedTripId),
      readDraft<FeedbackFormState>("feedback_draft", feedbackDraftKey),
    ]);

    setFeedbackState(cachedState);

    if (cachedDraft) {
      setForm(cachedDraft);
      setHasLocalDraft(true);
      return;
    }

    if (cachedState?.feedback) {
      setForm({
        overall_rating: cachedState.feedback.overall_rating,
        support_rating: cachedState.feedback.support_rating,
        accommodation_rating: cachedState.feedback.accommodation_rating,
        transport_rating: cachedState.feedback.transport_rating,
        highlights: cachedState.feedback.highlights || "",
        improvements: cachedState.feedback.improvements || "",
        testimonial_opt_in: cachedState.feedback.testimonial_opt_in,
        follow_up_requested: cachedState.feedback.follow_up_requested,
      });
      setHasLocalDraft(false);
      return;
    }

    setForm(emptyForm());
    setHasLocalDraft(false);
  }, [feedbackDraftKey, resolvedTripId]);

  const refreshFeedback = useCallback(async () => {
    if (!accessToken || !resolvedTripId) {
      return;
    }

    setRefreshing(true);
    const result = await syncTripFeedback(resolvedTripId, accessToken);
    await hydrateFromCache();
    setLastSync(result.syncMetadata.lastSuccessfulSync);
    setStale(result.syncMetadata.stale || result.source === "cache");
    setError(result.error);
    setRefreshing(false);
  }, [accessToken, hydrateFromCache, resolvedTripId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }
    void hydrateFromCache();
  }, [hydrateFromCache, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && accessToken && resolvedTripId) {
      void refreshFeedback();
    }
  }, [accessToken, isAuthenticated, refreshFeedback, resolvedTripId]);

  const updateForm = useCallback(
    async (patch: Partial<FeedbackFormState>) => {
      const next = { ...form, ...patch };
      setForm(next);
      setHasLocalDraft(true);
      setMessage(null);
      await cacheDraft("feedback_draft", feedbackDraftKey, next);
    },
    [feedbackDraftKey, form]
  );

  const saveFeedback = useCallback(
    async (status: "DRAFT" | "SUBMITTED") => {
      if (!accessToken || !resolvedTripId) {
        return;
      }

      setSavingMode(status);
      setError(null);
      setMessage(null);

      const response = await SupportService.saveTripFeedback(
        resolvedTripId,
        buildPayload(form, status),
        accessToken
      );

      if (!response.success) {
        setError(response.error || "Unable to save feedback right now.");
        setSavingMode(null);
        return;
      }

      if (status === "SUBMITTED") {
        await clearDraft("feedback_draft", feedbackDraftKey);
        setHasLocalDraft(false);
        setMessage("Your feedback has been submitted. Thank you for sharing your journey.");
      } else {
        await cacheDraft("feedback_draft", feedbackDraftKey, form);
        setHasLocalDraft(true);
        setMessage("Draft saved. You can leave and come back later.");
      }

      await refreshFeedback();
      setSavingMode(null);
    },
    [accessToken, feedbackDraftKey, form, refreshFeedback, resolvedTripId]
  );

  const isSubmitted = feedbackState?.feedback?.status === "SUBMITTED" && !hasLocalDraft;
  const canSubmit = Boolean(form.highlights.trim() || form.improvements.trim() || form.overall_rating);

  const ratingRows = useMemo(
    () => [
      ["overall_rating", "Overall journey"],
      ["support_rating", "Support team"],
      ["accommodation_rating", "Accommodation"],
      ["transport_rating", "Transport"],
    ] as const,
    []
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Feedback</Text>
        <TouchableOpacity onPress={() => void refreshFeedback()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFeedback} tintColor={colors.primary} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>{formatSyncTime(lastSync)}</Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>
            {stale
              ? error || "Showing the last known feedback state while the network refresh recovers."
              : "Feedback drafts stay resumable in the app and sync back to the support system when you save or submit."}
          </Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card }, Shadow.large]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Post-Trip Reflection</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {feedbackState?.feedback?.trip_name || "Share your pilgrim experience"}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {feedbackState?.eligible
              ? feedbackState.feedback?.status === "DRAFT"
                ? "A draft already exists. Keep editing and submit when you are ready."
                : "Tell Al Hilal what worked well and where the journey can improve."
              : feedbackState?.reason || "This form opens after your booking reaches its return state."}
          </Text>
          {message ? <Text style={[styles.successText, { color: colors.success }]}>{message}</Text> : null}
        </View>

        {!feedbackState?.eligible ? (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="checkmark-done-outline" size={28} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Feedback is not available yet</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {feedbackState?.reason || "This trip becomes eligible for feedback after completion."}
            </Text>
          </View>
        ) : isSubmitted ? (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="heart-circle-outline" size={32} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Feedback submitted</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Submitted {feedbackState.feedback?.submitted_at ? new Date(feedbackState.feedback.submitted_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }) : "recently"}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Thank you. Your response is now visible to the support team inside the admin review queue.
            </Text>
            <View style={styles.summaryGrid}>
              {ratingRows.map(([field, label]) => (
                <View key={field} style={[styles.summaryChip, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {feedbackState.feedback?.[field] || "Not rated"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {ratingRows.map(([field, label]) => (
              <View key={field} style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{label}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((value) => {
                    const selected = form[field] === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.ratingPill,
                          {
                            backgroundColor: selected ? colors.primary : colors.muted,
                          },
                        ]}
                        onPress={() => void updateForm({ [field]: value } as Partial<FeedbackFormState>)}
                      >
                        <Text
                          style={[
                            styles.ratingText,
                            { color: selected ? colors.primaryForeground : colors.text },
                          ]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Highlights</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                multiline
                numberOfLines={5}
                placeholder="What stood out positively during your journey?"
                placeholderTextColor={colors.mutedForeground}
                value={form.highlights}
                onChangeText={(value) => void updateForm({ highlights: value })}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Improvements</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                multiline
                numberOfLines={5}
                placeholder="What should Al Hilal improve for future pilgrims?"
                placeholderTextColor={colors.mutedForeground}
                value={form.improvements}
                onChangeText={(value) => void updateForm({ improvements: value })}
              />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Allow a testimonial follow-up</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    Let the team contact you if your comments can be used as a public testimonial later.
                  </Text>
                </View>
                <Switch
                  value={form.testimonial_opt_in}
                  onValueChange={(value) => void updateForm({ testimonial_opt_in: value })}
                  thumbColor={form.testimonial_opt_in ? colors.primary : colors.border}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Request a follow-up</Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    Use this if you want Al Hilal to reach out directly about unresolved issues.
                  </Text>
                </View>
                <Switch
                  value={form.follow_up_requested}
                  onValueChange={(value) => void updateForm({ follow_up_requested: value })}
                  thumbColor={form.follow_up_requested ? colors.primary : colors.border}
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: colors.border, opacity: savingMode ? 0.7 : 1 },
                ]}
                disabled={Boolean(savingMode)}
                onPress={() => void saveFeedback("DRAFT")}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  {savingMode === "DRAFT" ? "Saving..." : "Save Draft"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: canSubmit ? colors.primary : colors.mutedForeground,
                    opacity: savingMode ? 0.7 : 1,
                  },
                ]}
                disabled={!canSubmit || Boolean(savingMode)}
                onPress={() => void saveFeedback("SUBMITTED")}
              >
                <Text style={styles.primaryButtonText}>
                  {savingMode === "SUBMITTED" ? "Submitting..." : "Submit Feedback"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 120,
  },
  syncCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  syncTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  syncText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  heroCard: {
    borderRadius: 24,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  successText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 20,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  ratingRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  ratingPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    textAlignVertical: "top",
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  switchCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  summaryChip: {
    minWidth: "47%",
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
