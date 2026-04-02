import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SupportService } from "@/lib/api/services/support";
import { readCachedDevices, readCachedNotificationPreferences, readCachedTripUpdates, readCachedTrips, syncDevices, syncNotificationPreferences, syncTripUpdates, syncTrips } from "@/lib/support/cache-sync";
import { registerCurrentDevice } from "@/lib/support/device-registration";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken } = useAuth();

  const [preferences, setPreferences] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [tripUpdates, setTripUpdates] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hydrateFromCache = useCallback(async () => {
    const [cachedPreferences, cachedDevices, cachedTrips] = await Promise.all([
      readCachedNotificationPreferences(),
      readCachedDevices(),
      readCachedTrips(),
    ]);

    setPreferences(cachedPreferences);
    setDevices(cachedDevices);

    const updateGroups = await Promise.all(
      cachedTrips.map((trip) => readCachedTripUpdates(trip.id))
    );
    const flattened = updateGroups.flatMap((group) => group || []);
    flattened.sort((left, right) => new Date(right.publish_at).getTime() - new Date(left.publish_at).getTime());
    setTripUpdates(flattened);
  }, []);

  const refreshAll = useCallback(async () => {
    if (!accessToken) return;
    setRefreshing(true);

    const [preferencesResult, devicesResult, tripsResult] = await Promise.all([
      syncNotificationPreferences(accessToken),
      syncDevices(accessToken),
      syncTrips(accessToken),
    ]);

    await Promise.all(
      tripsResult.data.map((trip) => syncTripUpdates(trip.id, accessToken))
    );

    await hydrateFromCache();
    setLastSync(preferencesResult.syncMetadata.lastSuccessfulSync || devicesResult.syncMetadata.lastSuccessfulSync || tripsResult.syncMetadata.lastSuccessfulSync);
    setError(preferencesResult.error || devicesResult.error || tripsResult.error);
    setRefreshing(false);
  }, [accessToken, hydrateFromCache]);

  useEffect(() => {
    void hydrateFromCache();
  }, [hydrateFromCache]);

  useEffect(() => {
    if (accessToken) {
      void refreshAll();
    }
  }, [accessToken, refreshAll]);

  const updatePreference = async (field: string, value: boolean) => {
    if (!accessToken || !preferences) return;
    const next = { ...preferences, [field]: value };
    setPreferences(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const response = await SupportService.updateNotificationPreferences({ [field]: value }, accessToken);
    if (response.success && response.data) {
      setPreferences(response.data);
      await registerCurrentDevice(accessToken, response.data);
    } else {
      setError(response.error || "Failed to save notification preference.");
    }
  };

  const activeDeviceCount = useMemo(
    () => devices.filter((device) => device.notifications_enabled).length,
    [devices]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity
          onPress={async () => {
            if (!accessToken) return;
            await registerCurrentDevice(accessToken, preferences || undefined);
            await refreshAll();
          }}
          style={styles.iconButton}
          activeOpacity={0.8}
        >
          <Ionicons name="phone-portrait-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>
            {lastSync
              ? `Last sync ${new Date(lastSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
              : "Waiting for the first notification sync"}
          </Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>
            {error || "The bell now opens a real support surface with device registration, preference toggles, and an in-app update feed."}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Delivery Preferences</Text>
          {[
            ["push_enabled", "Push delivery"],
            ["trip_updates", "Trip updates"],
            ["document_updates", "Document status"],
            ["readiness_updates", "Readiness blockers"],
            ["daily_program_updates", "Daily program changes"],
            ["support_updates", "Support announcements"],
          ].map(([field, label]) => (
            <View key={field} style={styles.preferenceRow}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>{label}</Text>
              <Switch
                value={Boolean(preferences?.[field])}
                onValueChange={(value) => void updatePreference(field, value)}
                thumbColor={Boolean(preferences?.[field]) ? colors.primary : colors.border}
              />
            </View>
          ))}
          <Text style={[styles.preferenceHint, { color: colors.mutedForeground }]}>
            Provider: {preferences?.notification_provider_name || "Not configured yet"}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Registered Devices</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {activeDeviceCount} active device{activeDeviceCount === 1 ? "" : "s"}
          </Text>
          {devices.length ? (
            devices.map((device) => (
              <View key={device.id} style={styles.deviceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                    {device.device_name || device.platform}
                  </Text>
                  <Text style={[styles.preferenceHint, { color: colors.mutedForeground }]}>
                    {device.platform} · v{device.app_version || "unknown"} · {device.notifications_enabled ? "Notifications on" : "Notifications off"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.preferenceHint, { color: colors.mutedForeground }]}>
              No device registration has been cached yet. Tap the phone icon in the header to register this device now.
            </Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Support Update Feed</Text>
          {tripUpdates.length ? (
            tripUpdates.slice(0, 8).map((item) => (
              <View key={item.id} style={styles.feedItem}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.preferenceHint, { color: colors.mutedForeground }]}>
                  {new Date(item.publish_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </Text>
                <Text style={[styles.feedBody, { color: colors.mutedForeground }]} numberOfLines={3}>
                  {item.body_md}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.preferenceHint, { color: colors.mutedForeground }]}>
              Trip announcements will appear here once your booked journeys publish updates.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: 20,
    padding: Spacing.lg,
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
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  preferenceLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  preferenceHint: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  deviceRow: {
    paddingVertical: Spacing.xs,
  },
  feedItem: {
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  feedBody: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
});
