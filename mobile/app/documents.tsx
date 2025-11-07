import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const documentSections = [
  {
    title: 'Required Documents',
    items: [
      {
        id: 'passport',
        label: 'Passport Bio Page',
        status: 'Approved',
        updated: 'Reviewed 2 days ago',
        icon: 'earth',
        color: '#10B981',
      },
      {
        id: 'vaccination',
        label: 'Vaccination Certificate',
        status: 'Pending Upload',
        updated: 'Upload before 01 Oct 2025',
        icon: 'medkit',
        color: '#F59E0B',
      },
      {
        id: 'passport-photo',
        label: 'Passport Photo',
        status: 'Needs Review',
        updated: 'Low resolution detected',
        icon: 'camera',
        color: '#EF4444',
      },
    ],
  },
  {
    title: 'Optional Documents',
    items: [
      {
        id: 'employment-letter',
        label: 'Employment Letter',
        status: 'Not Required',
        updated: 'Optional for this itinerary',
        icon: 'briefcase',
        color: '#6B7280',
      },
    ],
  },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleUpload = (documentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Upload document:', documentId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: colors.card }, Shadow.medium]}>
          <Ionicons name="cloud-upload" size={28} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Keep your travel documents ready</Text>
            <Text style={[styles.infoSubtitle, { color: colors.mutedForeground }]}>Upload clear scans of your passport and supporting documents to speed up visa processing.</Text>
          </View>
        </View>

        {documentSections.map((section) => (
          <View key={section.title} style={[styles.sectionCard, { backgroundColor: colors.card }, Shadow.small]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <View style={styles.documentList}>
              {section.items.map((doc) => (
                <View key={doc.id} style={[styles.documentRow, { borderColor: colors.border }]}> 
                  <View style={[styles.iconCircle, { backgroundColor: `${doc.color}15` }]}> 
                    <Ionicons name={doc.icon as any} size={20} color={doc.color} />
                  </View>
                  <View style={styles.documentContent}>
                    <Text style={[styles.documentLabel, { color: colors.text }]}>{doc.label}</Text>
                    <Text style={[styles.documentStatus, { color: doc.color }]}>{doc.status}</Text>
                    <Text style={[styles.documentUpdated, { color: colors.mutedForeground }]}>{doc.updated}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.muted }]}
                    onPress={() => handleUpload(doc.id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="cloud-upload" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={[styles.tipCard, { backgroundColor: colors.muted }]}> 
          <Ionicons name="bulb" size={20} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>Tip: Submit all mandatory documents at least 45 days before departure to avoid delays.</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  infoSubtitle: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  documentList: {
    gap: Spacing.md,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentContent: {
    flex: 1,
    gap: 4,
  },
  documentLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  documentStatus: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  documentUpdated: {
    fontSize: Typography.fontSize.xs,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
});


