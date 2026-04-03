import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { AlHilalLogo } from "@/components/AlHilalLogo";
import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { readCachedDailyProgram, readCachedNextTrip, readCachedTripMilestones, readCachedTripReadiness, readCachedTripResources, readCachedTripUpdates, syncHomeSupport } from "@/lib/support/cache-sync";

function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return "Dates will appear after the next sync";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} to ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function formatSyncTime(value?: string | null) {
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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated, profile, user } = useAuth();

  const [nextTrip, setNextTrip] = useState<any | null>(null);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [dailyProgram, setDailyProgram] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || "Pilgrim";

  const hydrateFromCache = useCallback(async () => {
    const cachedNextTrip = await readCachedNextTrip();
    setNextTrip(cachedNextTrip);

    if (!cachedNextTrip?.id) {
      setReadiness(null);
      setDailyProgram(null);
      setMilestones([]);
      setResources([]);
      setUpdates([]);
      return;
    }

    const [cachedReadiness, cachedDailyProgram, cachedMilestones, cachedResources, cachedUpdates] = await Promise.all([
      readCachedTripReadiness(cachedNextTrip.id),
      readCachedDailyProgram(cachedNextTrip.id),
      readCachedTripMilestones(cachedNextTrip.id),
      readCachedTripResources(cachedNextTrip.id),
      readCachedTripUpdates(cachedNextTrip.id),
    ]);

    setReadiness(cachedReadiness);
    setDailyProgram(cachedDailyProgram);
    setMilestones(cachedMilestones || []);
    setResources(cachedResources || []);
    setUpdates(cachedUpdates || []);
  }, []);

  const refreshSupport = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setRefreshing(true);
    const support = await syncHomeSupport(accessToken);
    await hydrateFromCache();
    setLastSync(support.trips.syncMetadata.lastSuccessfulSync);
    setStale(support.trips.syncMetadata.stale || support.trips.source === "cache");
    setError(support.trips.error);
    setRefreshing(false);
  }, [accessToken, hydrateFromCache]);

  useEffect(() => {
    void hydrateFromCache();
  }, [hydrateFromCache]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      void refreshSupport();
    }
  }, [accessToken, isAuthenticated, refreshSupport]);

  const openNotifications = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/notifications");
  };

  const openTripSupport = () => {
    if (!nextTrip?.id) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/trip/${nextTrip.id}` as never);
  };

  const openDailyProgram = () => {
    if (!nextTrip?.id) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/daily-program/${nextTrip.id}` as never);
  };

  const openBookings = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/my-bookings" as never);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <AlHilalLogo width={180} height={32} />
          </View>
          <LinearGradient colors={[colors.primary, "#A8024E"]} style={[styles.heroCard, Shadow.large]}>
            <Text style={styles.heroEyebrow}>Pilgrim Support, Ready When You Are</Text>
            <Text style={styles.heroTitle}>Sign in to see your readiness, trip program, and support updates.</Text>
            <TouchableOpacity style={[styles.heroButton, { backgroundColor: colors.gold }]} onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.heroButtonText, { color: colors.goldForeground }]}>Sign In</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshSupport} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AlHilalLogo width={180} height={32} />
          <TouchableOpacity
            onPress={openNotifications}
            style={[styles.iconButton, { backgroundColor: colors.muted }]}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <LinearGradient colors={[colors.primary, "#A8024E"]} style={[styles.heroCard, Shadow.large]}>
          <Text style={styles.heroEyebrow}>Pilgrim Support Home</Text>
          <Text style={styles.heroTitle}>Assalamu alaikum, {firstName}.</Text>
          <Text style={styles.heroSubtitle}>
            Your next trip, readiness state, and support updates appear here first, even after the app has been offline.
          </Text>
          <View style={styles.heroActionRow}>
            <TouchableOpacity style={[styles.heroButton, { backgroundColor: colors.gold }]} onPress={openBookings}>
              <Text style={[styles.heroButtonText, { color: colors.goldForeground }]}>My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroGhostButton} onPress={openNotifications}>
              <Text style={styles.heroGhostButtonText}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <View style={styles.syncRow}>
            <Ionicons
              name={stale ? "cloud-offline-outline" : "sync-outline"}
              size={18}
              color={stale ? colors.warning : colors.primary}
            />
            <Text style={[styles.syncText, { color: colors.text }]}>{formatSyncTime(lastSync)}</Text>
          </View>
          <Text style={[styles.syncSubtext, { color: colors.mutedForeground }]}>
            {stale
              ? error || "Showing the last known good support snapshot while the network refresh recovers."
              : "The app opens from cache first and refreshes this support snapshot in the background."}
          </Text>
        </View>

        {nextTrip ? (
          <>
            <TouchableOpacity
              style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}
              onPress={openTripSupport}
              activeOpacity={0.92}
            >
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Next Booked Trip</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{nextTrip.name}</Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {formatDateRange(nextTrip.start_date, nextTrip.end_date)}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {(nextTrip.cities || []).join(" • ")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}
              onPress={openTripSupport}
              activeOpacity={0.92}
            >
              <View style={styles.inlineHeader}>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Readiness Summary</Text>
                <Text style={[styles.statusBadge, { color: readiness?.ready_for_travel ? colors.success : colors.warning }]}>
                  {readiness?.status || "Syncing"}
                </Text>
              </View>
              <Text style={[styles.readinessHeadline, { color: colors.text }]}>
                {readiness?.ready_for_travel
                  ? "You are cleared for travel."
                  : readiness?.missing_items?.length
                    ? `${readiness.missing_items.length} item${readiness.missing_items.length === 1 ? "" : "s"} still need attention.`
                    : "Readiness details will appear after the next sync."}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                Payment progress: {readiness?.payment_progress_percent ?? 0}% of the required target
              </Text>
              {!!readiness?.blockers?.length && (
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  Blockers: {readiness.blockers.join(" · ")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}
              onPress={openDailyProgram}
              activeOpacity={0.92}
            >
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Pinned Daily Program</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {dailyProgram?.pinned_resource?.title || `Day ${dailyProgram?.current_day_index || 1}`}
              </Text>
              <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
                {dailyProgram?.days?.length
                  ? `${dailyProgram.days.length} program day${dailyProgram.days.length === 1 ? "" : "s"} cached for offline reading`
                  : "Program details will appear once operations publish them."}
              </Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.compactCard, { backgroundColor: colors.card }, Shadow.medium]}>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Latest Updates</Text>
                {updates.length ? (
                  updates.slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.compactItem}>
                      <Text style={[styles.compactTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>{item.urgency}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
                    No trip updates have been cached yet.
                  </Text>
                )}
              </View>

              <View style={[styles.compactCard, { backgroundColor: colors.card }, Shadow.medium]}>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Guides and Resources</Text>
                {resources.length ? (
                  resources.slice(0, 2).map((item) => (
                    <View key={item.id} style={styles.compactItem}>
                      <Text style={[styles.compactTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>{item.resource_type}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
                    Published guides will appear here once staff pins them to your trip.
                  </Text>
                )}
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Milestones</Text>
              {milestones.length ? (
                milestones.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.milestoneRow}>
                    <View style={[styles.milestoneDot, { backgroundColor: item.status === "DONE" ? colors.success : colors.gold }]} />
                    <View style={styles.milestoneCopy}>
                      <Text style={[styles.compactTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
                        {item.target_date || "Schedule to be confirmed"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
                  Milestones will appear once operations publishes the next support checkpoint.
                </Text>
              )}
            </View>
          </>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="calendar-outline" size={32} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>No booked trip cached yet</Text>
            <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
              Your booked trip will appear here after the first successful sync. Pull to refresh if you have just signed in or completed a booking.
            </Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={refreshSupport}>
              <Text style={styles.retryButtonText}>Refresh Support Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 24,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  heroActionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  heroButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
  },
  heroButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  heroGhostButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  heroGhostButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  syncCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  syncText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  syncSubtext: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  sectionEyebrow: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionMeta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 19,
  },
  inlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  readinessHeadline: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: 24,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  compactCard: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  compactItem: {
    gap: 2,
  },
  compactTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  compactMeta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  milestoneCopy: {
    flex: 1,
    gap: 2,
  },
  emptyCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  retryButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
});
