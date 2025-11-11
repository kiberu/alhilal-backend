import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { DocumentsService, type Document } from '@/lib/api';

const DOCUMENT_TYPE_CONFIG = {
  PASSPORT: {
    label: 'Passport',
    icon: 'document-text' as const,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  VISA: {
    label: 'Visa',
    icon: 'airplane' as const,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  VACCINATION: {
    label: 'Vaccination',
    icon: 'medical' as const,
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  OTHER: {
    label: 'Other',
    icon: 'document-attach' as const,
    color: '#6B7280',
    bgColor: '#F9FAFB',
  },
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#F59E0B' },
  VERIFIED: { label: 'Verified', color: '#10B981' },
  REJECTED: { label: 'Rejected', color: '#EF4444' },
};

export default function MyDocumentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, accessToken } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const fetchDocuments = async (isRefresh = false) => {
    if (!accessToken) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const response = await DocumentsService.getMyDocuments(accessToken);

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch documents');
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchDocuments(true);
  }, [accessToken]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDocumentPress = (documentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Navigate to document detail/preview screen
    console.log('View document:', documentId);
  };

  const handleUploadDocument = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Upload Document',
      'Document upload feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteDocument = (documentId: string, title: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              const response = await DocumentsService.deleteDocument(documentId, accessToken);
              
              if (response.success) {
                setDocuments(documents.filter((doc) => doc.id !== documentId));
              } else {
                throw new Error(response.error || 'Failed to delete document');
              }
            } catch (err: any) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', err.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  const renderDocumentCard = (document: Document) => {
    const typeConfig = DOCUMENT_TYPE_CONFIG[document.document_type];
    const statusConfig = document.status ? STATUS_CONFIG[document.status] : null;
    const uploadedDate = new Date(document.uploaded_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const isExpiringSoon = document.expiry_date
      ? new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : false;

    return (
      <TouchableOpacity
        key={document.id}
        style={[styles.documentCard, { backgroundColor: colors.card }, Shadow.medium]}
        onPress={() => handleDocumentPress(document.id)}
        activeOpacity={0.95}
      >
        {/* Document Icon & Type */}
        <View style={styles.documentHeader}>
          <View
            style={[styles.documentIcon, { backgroundColor: typeConfig.bgColor }]}
          >
            <Ionicons name={typeConfig.icon} size={28} color={typeConfig.color} />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={[styles.documentTitle, { color: colors.text }]}>
                {document.title}
              </Text>
              {statusConfig && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: `${statusConfig.color}25`, borderColor: statusConfig.color },
                  ]}
                >
                  <View style={[styles.statusDotInner, { backgroundColor: statusConfig.color }]} />
                </View>
              )}
            </View>
            <Text style={[styles.documentType, { color: colors.mutedForeground }]}>
              {typeConfig.label}
            </Text>
          </View>
        </View>

        {/* Document Details */}
        <View style={styles.documentDetails}>
          {document.document_number && (
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
                {document.document_number}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
              Uploaded: {uploadedDate}
            </Text>
          </View>
          {document.expiry_date && (
            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={isExpiringSoon ? '#F59E0B' : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.detailText,
                  { color: isExpiringSoon ? '#F59E0B' : colors.mutedForeground },
                ]}
              >
                Expires: {new Date(document.expiry_date).toLocaleDateString()}
                {isExpiringSoon && ' (Soon)'}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.documentActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleDocumentPress(document.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleDeleteDocument(document.id, document.title)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Documents</Text>
        <TouchableOpacity onPress={handleUploadDocument} activeOpacity={0.8}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading documents...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Error</Text>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchDocuments()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : documents.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Ionicons name="document-text-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Documents Yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            You haven't uploaded any documents yet.{'\n'}
            Upload your passport, visa, and other travel documents for easy access.
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.primary }]}
            onPress={handleUploadDocument}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Keep your travel documents up-to-date. We'll notify you when documents are expiring.
            </Text>
          </View>

          {/* Documents List */}
          <View style={styles.documentsList}>
            {documents.map((document) => renderDocumentCard(document))}
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.floatingUploadButton, { backgroundColor: colors.primary }, Shadow.large]}
            onPress={handleUploadDocument}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
            <Text style={styles.floatingUploadText}>Upload New Document</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  documentsList: {
    gap: Spacing.md,
  },
  documentCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  documentIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  documentTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  documentType: {
    fontSize: Typography.fontSize.sm,
  },
  documentDetails: {
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
  },
  documentActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  floatingUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  floatingUploadText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

