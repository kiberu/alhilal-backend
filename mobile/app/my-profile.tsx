import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { AuthService } from '@/lib/api';

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const COUNTRIES = [
  { code: 'UG', name: 'Uganda' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
];

export default function MyProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, user, profile, accessToken, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.name || '',
    dob: profile?.dob ? new Date(profile.dob) : new Date(2000, 0, 1),
    gender: (profile?.gender || '') as 'MALE' | 'FEMALE' | 'OTHER' | '',
    nationality: profile?.nationality || '',
    passport_number: profile?.passport_number || '',
    address: profile?.address || '',
    emergency_name: profile?.emergency_contact?.name || '',
    emergency_phone: profile?.emergency_contact?.phone || '',
    emergency_relationship: profile?.emergency_contact?.relationship || '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset form data
    setFormData({
      full_name: profile?.full_name || user?.name || '',
      dob: profile?.dob ? new Date(profile.dob) : new Date(2000, 0, 1),
      gender: (profile?.gender || '') as 'MALE' | 'FEMALE' | 'OTHER' | '',
      nationality: profile?.nationality || '',
      passport_number: profile?.passport_number || '',
      address: profile?.address || '',
      emergency_name: profile?.emergency_contact?.name || '',
      emergency_phone: profile?.emergency_contact?.phone || '',
      emergency_relationship: profile?.emergency_contact?.relationship || '',
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const updateData = {
        full_name: formData.full_name,
        dob: formData.dob.toISOString().split('T')[0],
        gender: formData.gender,
        nationality: formData.nationality,
        passport_number: formData.passport_number || undefined,
        address: formData.address || undefined,
        emergency_name: formData.emergency_name || undefined,
        emergency_phone: formData.emergency_phone || undefined,
        emergency_relationship: formData.emergency_relationship || undefined,
      };

      const response = await AuthService.updateProfile(updateData, accessToken);

      if (response.success && response.data) {
        // Update profile in context
        // Backend returns { success, message, data: profileData }
        const profileData = response.data.data || response.data;
        await updateProfile(profileData);
        
        // Also update local form data
        if (profileData.full_name) {
          setFormData(prev => ({
            ...prev,
            full_name: profileData.full_name || profileData.name || prev.full_name,
          }));
        }
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit} activeOpacity={0.8}>
            <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: colors.card }, Shadow.medium]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {formData.full_name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {formData.full_name || 'User'}
          </Text>
          <Text style={[styles.userPhone, { color: colors.mutedForeground }]}>
            {user?.phone}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.full_name || '-'}
              </Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Date of Birth</Text>
            {isEditing ? (
              <TouchableOpacity
                style={[styles.dateButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formData.dob.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.dob.toLocaleDateString()}
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dob}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Gender */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Gender</Text>
            {isEditing ? (
              <View style={styles.radioGroup}>
                {GENDERS.map((gender) => (
                  <TouchableOpacity
                    key={gender.value}
                    style={[
                      styles.radioButton,
                      { borderColor: colors.border, backgroundColor: colors.muted },
                      formData.gender === gender.value && {
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, gender: gender.value as any })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: colors.mutedForeground },
                        formData.gender === gender.value && { color: colors.primary, fontWeight: '600' },
                      ]}
                    >
                      {gender.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {GENDERS.find((g) => g.value === formData.gender)?.label || '-'}
              </Text>
            )}
          </View>

          {/* Nationality */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Nationality</Text>
            {isEditing ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
                <View style={styles.countryScrollContent}>
                  {COUNTRIES.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      style={[
                        styles.countryChip,
                        { borderColor: colors.border, backgroundColor: colors.muted },
                        formData.nationality === country.code && {
                          borderColor: colors.primary,
                          backgroundColor: colors.primary,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, nationality: country.code })}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.countryChipText,
                          { color: colors.mutedForeground },
                          formData.nationality === country.code && { color: '#FFFFFF', fontWeight: '600' },
                        ]}
                      >
                        {country.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {COUNTRIES.find((c) => c.code === formData.nationality)?.name || '-'}
              </Text>
            )}
          </View>

          {/* Passport Number */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Passport Number</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.passport_number}
                onChangeText={(text) => setFormData({ ...formData, passport_number: text })}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.passport_number || '-'}
              </Text>
            )}
          </View>

          {/* Address */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={2}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.address || '-'}
              </Text>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={[styles.section, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Contact Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.emergency_name}
                onChangeText={(text) => setFormData({ ...formData, emergency_name: text })}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.emergency_name || '-'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Contact Phone</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.emergency_phone}
                onChangeText={(text) => setFormData({ ...formData, emergency_phone: text })}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.emergency_phone || '-'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Relationship</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.text, borderColor: colors.border }]}
                value={formData.emergency_relationship}
                onChangeText={(text) => setFormData({ ...formData, emergency_relationship: text })}
                placeholder="Optional"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <Text style={[styles.value, { color: colors.text }]}>
                {formData.emergency_relationship || '-'}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
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
  editButton: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography.fontSize['5xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  userPhone: {
    fontSize: Typography.fontSize.base,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  value: {
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  radioButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  radioText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  countryScroll: {
    marginVertical: Spacing.xs,
  },
  countryScrollContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  countryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  countryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  saveButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

