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
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { Colors, Shadow, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { readCachedBookings, syncBookings } from "@/lib/support/cache-sync";

function formatMoney(minorUnits: number, currencyCode: string) {
  const majorUnits = minorUnits / 100;
  if (currencyCode === "UGX") {
    return `UGX ${majorUnits.toLocaleString("en-UG", { maximumFractionDigits: 0 })}`;
  }
  return `${currencyCode} ${majorUnits.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MyBookingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hydrateFromCache = useCallback(async () => {
    setBookings(await readCachedBookings());
  }, []);

  const refreshBookings = useCallback(async () => {
    if (!accessToken) return;
    setRefreshing(true);
    const result = await syncBookings(accessToken);
    await hydrateFromCache();
    setLastSync(result.syncMetadata.lastSuccessfulSync);
    setStale(result.syncMetadata.stale || result.source === "cache");
    setError(result.error);
    setRefreshing(false);
  }, [accessToken, hydrateFromCache]);

  useEffect(() => {
    void hydrateFromCache();
  }, [hydrateFromCache]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }
    if (accessToken) {
      void refreshBookings();
    }
  }, [accessToken, isAuthenticated, refreshBookings, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <TouchableOpacity onPress={refreshBookings} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshBookings} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>
            {lastSync
              ? `Last sync ${new Date(lastSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
              : "Waiting for the first bookings sync"}
          </Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>
            {stale
              ? error || "Showing cached booking truth while the connection refresh catches up."
              : "Bookings open from cache first so you can reach your support journey even on weak connectivity."}
          </Text>
        </View>

        {bookings.length ? (
          bookings.map((booking) => (
            <View key={booking.id} style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>{booking.reference_number}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{booking.trip_name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{booking.package_name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {new Date(booking.trip_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Text>

              <View style={styles.paymentRow}>
                <View>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>Paid</Text>
                  <Text style={[styles.amount, { color: colors.primary }]}>
                    {formatMoney(booking.amount_paid_minor_units, booking.currency_code)}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>Balance Due</Text>
                  <Text style={[styles.amount, { color: booking.balance_due > 0 ? colors.warning : colors.success }]}>
                    {formatMoney(booking.balance_due, booking.currency_code)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.border }]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/booking/${booking.id}` as never);
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Booking Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/trip/${booking.trip_id}` as never);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Trip Support</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="calendar-clear-outline" size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>No bookings cached yet</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Once a booking is saved and synced, it will stay available here for quick access to readiness, documents, and trip support.
            </Text>
          </View>
        )}
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
  card: {
    borderRadius: 20,
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
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  amount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
});
