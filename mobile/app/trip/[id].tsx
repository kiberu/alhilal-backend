import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type {
  DailyProgram,
  TripDetail,
  TripFeedbackState,
  TripMilestone,
  TripReadiness,
  TripResource,
  TripSupportUpdate,
} from "@/lib/api/services";
import { TripsService } from "@/lib/api/services";
import {
  getCachedResource,
  openSupportResource,
} from "@/lib/support/file-cache";
import {
  readCachedDailyProgram,
  readCachedTripDetail,
  readCachedTripFeedback,
  readCachedTripMilestones,
  readCachedTripReadiness,
  readCachedTripResources,
  readCachedTripUpdates,
  syncDailyProgram,
  syncTripDetail,
  syncTripFeedback,
  syncTripMilestones,
  syncTripReadiness,
  syncTripResources,
  syncTripUpdates,
} from "@/lib/support/cache-sync";

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return "Travel dates will appear after the next sync.";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} to ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return "Waiting for the first sync";
  }

  return `Last sync ${new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

type CachedResourceRecord = NonNullable<DailyProgram["pinned_resource"]> | TripResource;

export default function TripSupportScreen() {
  const { id } = useLocalSearchParams();
  const tripId = typeof id === "string" ? id : null;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [publicTrip, setPublicTrip] = useState<TripDetail | null>(null);
  const [readiness, setReadiness] = useState<TripReadiness | null>(null);
  const [milestones, setMilestones] = useState<TripMilestone[]>([]);
  const [resources, setResources] = useState<TripResource[]>([]);
  const [updates, setUpdates] = useState<TripSupportUpdate[]>([]);
  const [dailyProgram, setDailyProgram] = useState<DailyProgram | null>(null);
  const [feedbackState, setFeedbackState] = useState<TripFeedbackState | null>(null);
  const [cachedFiles, setCachedFiles] = useState<Record<string, boolean>>({});
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const supportEnabled = Boolean(isAuthenticated && accessToken && tripId);

  const refreshCachedFileFlags = useCallback(
    async (resourceList: TripResource[], pinnedResource: DailyProgram["pinned_resource"]) => {
      const trackedResources: CachedResourceRecord[] = pinnedResource
        ? [pinnedResource, ...resourceList]
        : resourceList;

      const flags = await Promise.all(
        trackedResources.map(async (resource) => [
          resource.id,
          Boolean(await getCachedResource(resource.id)),
        ] as const)
      );

      setCachedFiles(Object.fromEntries(flags));
    },
    []
  );

  const hydrateSupportCache = useCallback(async () => {
    if (!tripId) {
      return false;
    }

    const [
      cachedTrip,
      cachedReadiness,
      cachedMilestones,
      cachedResources,
      cachedUpdates,
      cachedDailyProgram,
      cachedFeedbackState,
    ] = await Promise.all([
      readCachedTripDetail(tripId),
      readCachedTripReadiness(tripId),
      readCachedTripMilestones(tripId),
      readCachedTripResources(tripId),
      readCachedTripUpdates(tripId),
      readCachedDailyProgram(tripId),
      readCachedTripFeedback(tripId),
    ]);

    setTrip(cachedTrip);
    setReadiness(cachedReadiness);
    setMilestones(cachedMilestones || []);
    setResources(cachedResources || []);
    setUpdates(cachedUpdates || []);
    setDailyProgram(cachedDailyProgram);
    setFeedbackState(cachedFeedbackState);
    await refreshCachedFileFlags(cachedResources || [], cachedDailyProgram?.pinned_resource || null);
    return Boolean(cachedTrip);
  }, [refreshCachedFileFlags, tripId]);

  const loadPublicTrip = useCallback(async () => {
    if (!tripId) {
      return;
    }

    const response = await TripsService.getPublicTripDetail(tripId);
    if (response.success && response.data) {
      setPublicTrip(response.data);
      return;
    }

    setPublicTrip(null);
    setError(response.error || "Unable to load this trip right now.");
  }, [tripId]);

  const refreshSupport = useCallback(async () => {
    if (!accessToken || !tripId) {
      return false;
    }

    const results = await Promise.all([
      syncTripDetail(tripId, accessToken),
      syncTripReadiness(tripId, accessToken),
      syncTripMilestones(tripId, accessToken),
      syncTripResources(tripId, accessToken),
      syncTripUpdates(tripId, accessToken),
      syncDailyProgram(tripId, accessToken),
      syncTripFeedback(tripId, accessToken),
    ]);

    const hasSupportTrip = await hydrateSupportCache();
    const timestamps = results
      .map((result) => result.syncMetadata.lastSuccessfulSync)
      .filter((value): value is string => Boolean(value));

    setLastSync(timestamps[0] || null);
    setStale(results.some((result) => result.syncMetadata.stale || result.source === "cache"));
    setError(results.map((result) => result.error).find(Boolean) || null);
    return hasSupportTrip || Boolean(results[0].data);
  }, [accessToken, hydrateSupportCache, tripId]);

  const refreshScreen = useCallback(async () => {
    if (!tripId) {
      return;
    }

    setRefreshing(true);

    if (supportEnabled) {
      const hasSupportTrip = await refreshSupport();
      if (!hasSupportTrip) {
        await loadPublicTrip();
      } else {
        setPublicTrip(null);
      }
    } else {
      await loadPublicTrip();
    }

    setRefreshing(false);
    setInitialized(true);
  }, [loadPublicTrip, refreshSupport, supportEnabled, tripId]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!tripId) {
        setInitialized(true);
        return;
      }

      if (supportEnabled) {
        await hydrateSupportCache();
      }

      if (!cancelled) {
        await refreshScreen();
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [hydrateSupportCache, refreshScreen, supportEnabled, tripId]);

  const displayTrip = trip || publicTrip;
  const showSupportSurfaces = Boolean(trip);

  const accessMessage = useMemo(() => {
    if (showSupportSurfaces) {
      return stale
        ? error || "Showing your last known good support snapshot while the refresh recovers."
        : "This trip opens from cache first and refreshes the latest support snapshot in the background.";
    }

    if (isAuthenticated) {
      return error || "Support surfaces unlock once this trip is linked to one of your booked pilgrimages.";
    }

    return "Sign in with your pilgrim account to unlock readiness, document truth, updates, and daily-program support.";
  }, [error, isAuthenticated, showSupportSurfaces, stale]);

  const openDocuments = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/my-documents");
  };

  const openDailyProgram = async () => {
    if (!tripId) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/daily-program/${tripId}` as never);
  };

  const openFeedback = async () => {
    if (!tripId) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/trip-feedback/${tripId}` as never);
  };

  const openResource = async (resource: CachedResourceRecord) => {
    if (!resource.file_url_signed) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await openSupportResource({
      resourceId: resource.id,
      remoteUrl: resource.file_url_signed,
      fileFormat: resource.file_format,
      updatedAt: "updated_at" in resource ? resource.updated_at : resource.published_at,
    });
    setCachedFiles((current) => ({ ...current, [resource.id]: true }));
  };

  const renderEmptySupportState = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
      <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Pilgrim Support</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Support access is not active for this trip yet.</Text>
      <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
        {isAuthenticated
          ? "Once Al Hilal links this trip to one of your bookings, readiness, daily program, resources, and feedback will appear here."
          : "Sign in to see support surfaces for your booked pilgrimages."}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(isAuthenticated ? "/my-bookings" : "/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>{isAuthenticated ? "My Bookings" : "Sign In"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/trips")}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Browse Trips</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResources = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
      <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Guides and Resources</Text>
      {resources.length ? (
        resources.slice(0, 6).map((resource) => (
          <View key={resource.id} style={styles.listItem}>
            <View style={styles.listContent}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{resource.title}</Text>
              <Text style={[styles.listMeta, { color: colors.mutedForeground }]}>
                {resource.resource_type} · {cachedFiles[resource.id] ? "Cached offline" : resource.file_url_signed ? "Not downloaded yet" : "No file attached"}
              </Text>
            </View>
            {resource.file_url_signed ? (
              <TouchableOpacity
                style={[styles.inlineAction, { borderColor: colors.border }]}
                onPress={() => void openResource(resource)}
              >
                <Text style={[styles.inlineActionText, { color: colors.text }]}>
                  {cachedFiles[resource.id] ? "Open" : "Download"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      ) : (
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          No trip resources have been published yet. This section will show an explicit resource list as soon as operations posts guides or PDFs.
        </Text>
      )}
    </View>
  );

  const renderMilestones = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
      <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Milestones</Text>
      {milestones.length ? (
        milestones.slice(0, 6).map((milestone) => (
          <View key={milestone.id} style={styles.listItem}>
            <View style={styles.listContent}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{milestone.title}</Text>
              <Text style={[styles.listMeta, { color: colors.mutedForeground }]}>
                {milestone.status} · {milestone.target_date ? new Date(milestone.target_date).toLocaleDateString("en-US") : "No target date"}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          No milestones are cached yet for this trip.
        </Text>
      )}
    </View>
  );

  const renderUpdates = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
      <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Support Updates</Text>
      {updates.length ? (
        updates.slice(0, 5).map((update) => (
          <View key={update.id} style={styles.feedItem}>
            <Text style={[styles.listTitle, { color: colors.text }]}>{update.title}</Text>
            <Text style={[styles.listMeta, { color: colors.mutedForeground }]}>
              {update.urgency} · {new Date(update.publish_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Text>
            <Text style={[styles.feedBody, { color: colors.mutedForeground }]} numberOfLines={4}>
              {update.body_md}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          Support announcements will appear here after the next published update.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Support</Text>
        <TouchableOpacity onPress={() => void refreshScreen()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshScreen} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>
            {initialized ? formatTimestamp(lastSync) : "Loading your first trip support snapshot"}
          </Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>{accessMessage}</Text>
        </View>

        {displayTrip ? (
          <View style={[styles.heroCard, { backgroundColor: colors.card }, Shadow.large]}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
              {showSupportSurfaces ? "Booked Pilgrim Journey" : "Trip Overview"}
            </Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{displayTrip.name}</Text>
            <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
              {formatDateRange(displayTrip.start_date, displayTrip.end_date)}
            </Text>
            <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
              {(displayTrip.cities || []).join(" • ")}
            </Text>
            <View style={styles.actionRow}>
              {showSupportSurfaces ? (
                <>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => void openDailyProgram()}
                  >
                    <Text style={styles.primaryButtonText}>Daily Program</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={() => void openDocuments()}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Documents</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(isAuthenticated ? "/my-bookings" : "/(auth)/login")}
                  >
                    <Text style={styles.primaryButtonText}>{isAuthenticated ? "My Bookings" : "Sign In"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={() => router.push("/notifications")}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Alerts</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip details are not cached yet.</Text>
            <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
              Pull to refresh to retry this trip snapshot.
            </Text>
          </View>
        )}

        {showSupportSurfaces ? (
          <>
            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
              <View style={styles.inlineHeader}>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Readiness</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    { color: readiness?.ready_for_travel ? colors.success : colors.warning },
                  ]}
                >
                  {readiness?.status || "Syncing"}
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {readiness?.ready_for_travel
                  ? "You are cleared for travel."
                  : readiness?.missing_items?.length
                    ? `${readiness.missing_items.length} readiness item${readiness.missing_items.length === 1 ? "" : "s"} still need attention.`
                    : "Readiness details will appear as soon as this booking sync completes."}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                Payment progress: {readiness?.payment_progress_percent ?? 0}% of the target
              </Text>
              {readiness?.missing_items?.length ? (
                <View style={styles.tagList}>
                  {readiness.missing_items.slice(0, 4).map((item) => (
                    <View key={item} style={[styles.tag, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.tagText, { color: colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {readiness?.blockers?.length ? (
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  Blockers: {readiness.blockers.join(" · ")}
                </Text>
              ) : null}
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={() => void openDocuments()}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Open Document Center</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Pinned Daily Program</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {dailyProgram?.pinned_resource?.title || `Day ${dailyProgram?.current_day_index || 1}`}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {dailyProgram?.days?.length
                  ? `${dailyProgram.days.length} day${dailyProgram.days.length === 1 ? "" : "s"} cached for support access`
                  : "No daily program has been published for this trip yet."}
              </Text>
              {dailyProgram?.days?.[0]?.items?.length ? (
                <View style={styles.previewBlock}>
                  {dailyProgram.days[0].items.slice(0, 3).map((item) => (
                    <Text key={item.id} style={[styles.listMeta, { color: colors.text }]}>
                      {item.start_time ? `${item.start_time} · ` : ""}
                      {item.title}
                    </Text>
                  ))}
                </View>
              ) : null}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => void openDailyProgram()}
                >
                  <Text style={styles.primaryButtonText}>Open Daily Program</Text>
                </TouchableOpacity>
                {dailyProgram?.pinned_resource?.file_url_signed ? (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={() => void openResource(dailyProgram.pinned_resource!)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                      {cachedFiles[dailyProgram.pinned_resource.id] ? "Open Guide" : "Download Guide"}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {renderResources()}
            {renderMilestones()}
            {renderUpdates()}

            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Post-Trip Feedback</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {feedbackState?.feedback?.status === "SUBMITTED"
                  ? "Your feedback has been submitted."
                  : feedbackState?.eligible
                    ? "Share your support, travel, and accommodation feedback."
                    : "Feedback unlocks after your trip completes."}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {feedbackState?.eligible
                  ? feedbackState.feedback?.status === "DRAFT"
                    ? "A draft is already in progress and can be resumed."
                    : "You can save a draft, come back later, and submit when you are ready."
                  : feedbackState?.reason || "This feedback form becomes available once the booking reaches its return state."}
              </Text>
              {feedbackState?.eligible ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => void openFeedback()}
                >
                  <Text style={styles.primaryButtonText}>
                    {feedbackState.feedback?.status === "SUBMITTED"
                      ? "View Feedback"
                      : feedbackState.feedback?.status === "DRAFT"
                        ? "Resume Draft"
                        : "Start Feedback"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : (
          renderEmptySupportState()
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
  heroTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  sectionEyebrow: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionMeta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginTop: Spacing.xs,
  },
  primaryButton: {
    minWidth: 140,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  secondaryButton: {
    minWidth: 140,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  statusBadge: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 20,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  previewBlock: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  listContent: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  listMeta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  inlineAction: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  inlineActionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  feedItem: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  feedBody: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});
