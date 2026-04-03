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
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { DailyProgram, TripDetail } from "@/lib/api/services";
import {
  getCachedResource,
  openSupportResource,
} from "@/lib/support/file-cache";
import {
  readCachedDailyProgram,
  readCachedTripDetail,
  syncDailyProgram,
  syncTripDetail,
} from "@/lib/support/cache-sync";

function formatSyncTime(value?: string | null) {
  if (!value) {
    return "Waiting for the first daily-program sync";
  }

  return `Last sync ${new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function DailyProgramScreen() {
  const { tripId } = useLocalSearchParams();
  const resolvedTripId = typeof tripId === "string" ? tripId : null;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [program, setProgram] = useState<DailyProgram | null>(null);
  const [guideCached, setGuideCached] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hydrateFromCache = useCallback(async () => {
    if (!resolvedTripId) {
      return;
    }

    const [cachedTrip, cachedProgram] = await Promise.all([
      readCachedTripDetail(resolvedTripId),
      readCachedDailyProgram(resolvedTripId),
    ]);

    setTrip(cachedTrip);
    setProgram(cachedProgram);

    if (cachedProgram?.pinned_resource?.id) {
      setGuideCached(Boolean(await getCachedResource(cachedProgram.pinned_resource.id)));
    } else {
      setGuideCached(false);
    }
  }, [resolvedTripId]);

  const refreshProgram = useCallback(async () => {
    if (!accessToken || !resolvedTripId) {
      return;
    }

    setRefreshing(true);
    const [tripResult, programResult] = await Promise.all([
      syncTripDetail(resolvedTripId, accessToken),
      syncDailyProgram(resolvedTripId, accessToken),
    ]);

    await hydrateFromCache();
    setLastSync(programResult.syncMetadata.lastSuccessfulSync || tripResult.syncMetadata.lastSuccessfulSync);
    setStale(
      tripResult.syncMetadata.stale ||
        programResult.syncMetadata.stale ||
        tripResult.source === "cache" ||
        programResult.source === "cache"
    );
    setError(programResult.error || tripResult.error);
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
      void refreshProgram();
    }
  }, [accessToken, isAuthenticated, refreshProgram, resolvedTripId]);

  const openPinnedGuide = async () => {
    if (!program?.pinned_resource?.file_url_signed) {
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await openSupportResource({
      resourceId: program.pinned_resource.id,
      remoteUrl: program.pinned_resource.file_url_signed,
      fileFormat: program.pinned_resource.file_format,
      updatedAt: program.pinned_resource.published_at,
    });
    setGuideCached(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Program</Text>
        <TouchableOpacity onPress={() => void refreshProgram()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshProgram} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>{formatSyncTime(lastSync)}</Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>
            {stale
              ? error || "Showing the last known good daily program while the refresh recovers."
              : "This schedule opens from cache first so pilgrims can still review the program on weak or missing connectivity."}
          </Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card }, Shadow.large]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Trip Support Program</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {program?.trip_name || trip?.name || "Trip schedule"}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {program?.is_trip_live
              ? `Trip live · Day ${program.current_day_index}`
              : program?.days?.length
                ? `${program.days.length} program day${program.days.length === 1 ? "" : "s"} cached`
                : "Program details will appear here as soon as they are published."}
          </Text>
          {program?.pinned_resource ? (
            <View style={[styles.guideCard, { backgroundColor: colors.muted }]}>
              <Text style={[styles.guideTitle, { color: colors.text }]}>{program.pinned_resource.title}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {guideCached
                  ? "Guide downloaded for offline reopen"
                  : program.pinned_resource.file_url_signed
                    ? "Guide not downloaded yet"
                    : "Guide metadata published without a file attachment"}
              </Text>
              {program.pinned_resource.file_url_signed ? (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => void openPinnedGuide()}
                >
                  <Text style={styles.primaryButtonText}>{guideCached ? "Open Cached Guide" : "Download Guide"}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {program?.days?.length ? (
          program.days.map((day) => (
            <View key={day.id} style={[styles.dayCard, { backgroundColor: colors.card }, Shadow.medium]}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.eyebrow, { color: colors.primary }]}>{day.label}</Text>
                  <Text style={[styles.dayTitle, { color: colors.text }]}>Day {day.day_index}</Text>
                </View>
                <Text style={[styles.dayDate, { color: colors.mutedForeground }]}>
                  {day.date ? new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Date pending"}
                </Text>
              </View>

              {day.items.length ? (
                day.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={[styles.timePill, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.timeText, { color: colors.text }]}>
                        {item.start_time || "--:--"}
                      </Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                        {item.location || "Location shared by support"}
                      </Text>
                      {item.notes ? (
                        <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.notes}</Text>
                      ) : null}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  No timed items have been published for this day yet.
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={[styles.dayCard, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="calendar-outline" size={28} color={colors.primary} />
            <Text style={[styles.dayTitle, { color: colors.text }]}>No daily program cached yet</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Pilgrims will see each day as soon as operations publishes the program. If you are offline and the guide has not been downloaded yet, the screen will keep that truth visible here.
            </Text>
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
  meta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  guideCard: {
    borderRadius: 18,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  guideTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    marginTop: Spacing.xs,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  dayCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  dayTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  dayDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  itemRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  timePill: {
    minWidth: 68,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  itemMeta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
});
