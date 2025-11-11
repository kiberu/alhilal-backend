import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/lib/api';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';

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
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SA', name: 'Saudi Arabia' },
  // Add more as needed
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { accessToken, updateProfile } = useAuth();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState({
    full_name: '',
    dob: new Date(2000, 0, 1),
    gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    nationality: '',
    passport_number: '',
    has_passport: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Please select your nationality';
    }

    if (formData.has_passport && !formData.passport_number.trim()) {
      newErrors.passport_number = 'Passport number is required when passport option is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Format date as YYYY-MM-DD in local timezone (not UTC)
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const profileData = {
        full_name: formData.full_name,
        dob: formatDateForAPI(formData.dob),
        gender: formData.gender,
        nationality: formData.nationality,
        passport_number: formData.has_passport ? formData.passport_number : undefined,
        has_passport: formData.has_passport,
      };

      const response = await AuthService.updateProfile(profileData, accessToken!);

      if (response.success && response.data) {
        // Update local profile in auth context
        // Backend returns { success, message, data: profileData }
        await updateProfile(response.data.data || response.data);
        
        // Navigate to main app
        router.replace('/(tabs)');
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const colors = Colors[colorScheme];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.muted }]}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Complete Your Profile</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We need a few more details to set up your account
          </Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name <Text style={[styles.required, { color: colors.primary }]}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, backgroundColor: colors.muted, color: colors.text },
                errors.full_name && { borderColor: colors.error }
              ]}
              placeholder="As per passport"
              placeholderTextColor={colors.mutedForeground}
              value={formData.full_name}
              onChangeText={(text) => {
                setFormData({ ...formData, full_name: text });
                setErrors({ ...errors, full_name: '' });
              }}
              autoCapitalize="words"
            />
            {errors.full_name ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.full_name}</Text>
            ) : null}
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Date of Birth <Text style={[styles.required, { color: colors.primary }]}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.muted }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(formData.dob)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.dob}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setFormData({ ...formData, dob: selectedDate });
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Gender <Text style={[styles.required, { color: colors.primary }]}>*</Text>
            </Text>
            <View style={styles.radioGroup}>
              {GENDERS.map((gender) => (
                <TouchableOpacity
                  key={gender.value}
                  style={[
                    styles.radioButton,
                    { borderColor: colors.border, backgroundColor: colors.muted },
                    formData.gender === gender.value && { 
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}10` 
                    },
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, gender: gender.value as any });
                    setErrors({ ...errors, gender: '' });
                  }}
                >
                  <Text
                    style={[
                      styles.radioText,
                      { color: colors.mutedForeground },
                      formData.gender === gender.value && { color: colors.primary },
                    ]}
                  >
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.gender}</Text>
            ) : null}
          </View>

          {/* Nationality */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Nationality <Text style={[styles.required, { color: colors.primary }]}>*</Text>
            </Text>
            <View style={styles.selectContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.countryScroll}
                contentContainerStyle={styles.countryScrollContent}
              >
                {COUNTRIES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryChip,
                      { borderColor: colors.border, backgroundColor: colors.muted },
                      formData.nationality === country.code && { 
                        borderColor: colors.primary,
                        backgroundColor: colors.primary 
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, nationality: country.code });
                      setErrors({ ...errors, nationality: '' });
                    }}
                  >
                    <Text
                      style={[
                        styles.countryChipText,
                        { color: colors.mutedForeground },
                        formData.nationality === country.code && styles.countryChipTextActive,
                      ]}
                    >
                      {country.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {errors.nationality ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.nationality}</Text>
            ) : null}
          </View>

          {/* Has Passport Toggle */}
          <View style={styles.fieldContainer}>
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: colors.text }]}>I have a passport</Text>
              <Switch
                value={formData.has_passport}
                onValueChange={(value) =>
                  setFormData({ ...formData, has_passport: value })
                }
                trackColor={{ false: '#E0E0E0', true: colors.primary }}
                thumbColor="#FFF"
              />
            </View>
          </View>

          {/* Passport Number (conditional) */}
          {formData.has_passport && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Passport Number <Text style={[styles.required, { color: colors.primary }]}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, backgroundColor: colors.muted, color: colors.text },
                  errors.passport_number && { borderColor: colors.error }
                ]}
                placeholder="Enter passport number"
                placeholderTextColor={colors.mutedForeground}
                value={formData.passport_number}
                onChangeText={(text) => {
                  setFormData({ ...formData, passport_number: text });
                  setErrors({ ...errors, passport_number: '' });
                }}
                autoCapitalize="characters"
              />
              {errors.passport_number ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.passport_number}</Text>
              ) : null}
            </View>
          )}

          {error ? (
            <View style={[styles.errorContainer, {
              backgroundColor: colorScheme === 'dark' ? '#4C1D1D' : '#FEE2E2',
              borderLeftColor: colors.error
            }]}>
              <Text style={[styles.errorMessage, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Complete Registration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  required: {},
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  inputError: {},
  errorText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  dateButton: {
    height: 56,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
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
    height: 48,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {},
  radioText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  radioTextActive: {},
  selectContainer: {
    height: 56,
  },
  countryScroll: {
    flex: 1,
  },
  countryScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  countryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    justifyContent: 'center',
  },
  countryChipActive: {},
  countryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  countryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
  },
  errorMessage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadow.small,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});

