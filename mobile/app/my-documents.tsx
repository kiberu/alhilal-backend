import React, { useCallback, useEffect, useState } from "react";
import {
  Linking,
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
import { readCachedDocuments, readCachedNotificationPreferences, syncDocuments, syncNotificationPreferences } from "@/lib/support/cache-sync";
import { getCachedResource, openSupportResource } from "@/lib/support/file-cache";

const DOCUMENT_LABELS: Record<string, string> = {
  PASSPORT: "Passport",
  VISA: "Visa",
  VACCINATION: "Vaccination",
  ID_CARD: "ID Card",
  BIRTH_CERTIFICATE: "Birth Certificate",
  TRAVEL_PERMIT: "Travel Permit",
  OTHER: "Other Document",
};

export default function MyDocumentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();

  const [documents, setDocuments] = useState<any[]>([]);
  const [supportContacts, setSupportContacts] = useState<any | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cachedFiles, setCachedFiles] = useState<Record<string, boolean>>({});

  const hydrateFromCache = useCallback(async () => {
    const [cachedDocuments, cachedPreferences] = await Promise.all([
      readCachedDocuments(),
      readCachedNotificationPreferences(),
    ]);
    setDocuments(cachedDocuments);
    setSupportContacts(cachedPreferences);

    const entries = await Promise.all(
      cachedDocuments.map(async (document) => [
        document.id,
        Boolean(document.file_url) && Boolean(await getCachedResource(document.id)),
      ] as const)
    );
    setCachedFiles(Object.fromEntries(entries));
  }, []);

  const refreshDocuments = useCallback(async () => {
    if (!accessToken) return;
    setRefreshing(true);
    const [documentsResult, preferencesResult] = await Promise.all([
      syncDocuments(accessToken),
      syncNotificationPreferences(accessToken),
    ]);
    await hydrateFromCache();
    setLastSync(documentsResult.syncMetadata.lastSuccessfulSync || preferencesResult.syncMetadata.lastSuccessfulSync);
    setStale(documentsResult.syncMetadata.stale || documentsResult.source === "cache");
    setError(documentsResult.error || preferencesResult.error);
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
      void refreshDocuments();
    }
  }, [accessToken, isAuthenticated, refreshDocuments, router]);

  const callSupport = async (value?: string) => {
    if (!value) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL(`tel:${value.replace(/\s+/g, "")}`);
  };

  const chatSupport = async (value?: string) => {
    if (!value) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL(`https://wa.me/${value.replace(/[^\d]/g, "")}`);
  };

  const openDocument = async (document: any) => {
    if (!document.file_url) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await openSupportResource({
      resourceId: document.id,
      remoteUrl: document.file_url,
      fileFormat: document.file_format,
      updatedAt: document.last_changed_at,
    });
    setCachedFiles((current) => ({ ...current, [document.id]: true }));
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Document Center</Text>
        <TouchableOpacity onPress={refreshDocuments} style={styles.iconButton} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshDocuments} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.syncCard, { backgroundColor: colors.card, borderColor: stale ? colors.warning : colors.border }]}>
          <Text style={[styles.syncTitle, { color: colors.text }]}>
            {lastSync
              ? `Last sync ${new Date(lastSync).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
              : "Waiting for the first document sync"}
          </Text>
          <Text style={[styles.syncText, { color: colors.mutedForeground }]}>
            {stale
              ? error || "Showing the last known good document truth while the network refresh recovers."
              : "This is a read-only document truth center. Al Hilal support handles upload and replacement handoff outside the app."}
          </Text>
        </View>

        <View style={[styles.supportCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Support Handoff</Text>
          <Text style={[styles.supportTitle, { color: colors.text }]}>Need to fix a document or send a replacement?</Text>
          <Text style={[styles.supportText, { color: colors.mutedForeground }]}>
            {supportContacts?.support_message || "Use your Al Hilal support contact for document review, expiry follow-up, and readiness blockers."}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => callSupport(supportContacts?.support_phone)}
            >
              <Text style={styles.primaryButtonText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={() => chatSupport(supportContacts?.support_whatsapp)}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {documents.length ? (
          documents.map((document) => {
            const warningColor = document.missing_item || document.is_expired
              ? colors.error
              : document.is_expiring_soon
                ? colors.warning
                : document.verification_status === "VERIFIED"
                  ? colors.success
                  : colors.primary;

            return (
              <View key={document.id} style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
                <View style={styles.inlineHeader}>
                  <View style={styles.titleGroup}>
                    <Text style={[styles.eyebrow, { color: colors.primary }]}>
                      {DOCUMENT_LABELS[document.document_type] || document.document_type}
                    </Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{document.title}</Text>
                  </View>
                  <Text style={[styles.statusBadge, { color: warningColor }]}>{document.verification_status}</Text>
                </View>

                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {document.document_number || "No document number recorded yet"}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {document.expiry_date
                    ? `Expiry ${new Date(document.expiry_date).toLocaleDateString("en-US")}`
                    : "No expiry date recorded"}
                </Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {cachedFiles[document.id]
                    ? "Cached for offline reopen"
                    : document.file_url
                      ? "Not downloaded yet for offline use"
                      : "No file is attached in the mobile truth view"}
                </Text>

                <Text style={[styles.guidance, { color: warningColor }]}>{document.support_next_step}</Text>

                {Boolean(document.file_url) && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={() => void openDocument(document)}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                      {cachedFiles[document.id] ? "Open Cached Copy" : "Download and Open"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card }, Shadow.medium]}>
            <Ionicons name="document-text-outline" size={32} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>No document truth cached yet</Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Once support links your passport, visa, or vaccination records, this screen will keep the status, expiry risk, and next-step guidance available here.
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
  supportCard: {
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
  supportTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  supportText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  inlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  guidance: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 19,
    fontWeight: Typography.fontWeight.medium,
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
});
