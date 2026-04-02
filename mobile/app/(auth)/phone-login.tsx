import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { AlHilalLogo } from '@/components/AlHilalLogo';
import type { OTPFallback } from '@/lib/api/types';

// Country type
interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Supported East African countries
const COUNTRIES: Country[] = [
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
];

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { requestOTP } = useAuth();
  const colorScheme = useColorScheme();
  
  // Default to Uganda
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState<OTPFallback | null>(null);

  // Handle phone number input - remove leading zeros and non-digits
  const handlePhoneChange = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    // Remove leading zeros
    const withoutLeadingZeros = digits.replace(/^0+/, '');
    setPhoneNumber(withoutLeadingZeros);
  };

  const handleSendOTP = async () => {
    setError('');
    
    // Validate phone number (should be 9-10 digits without country code)
    if (phoneNumber.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    // Combine country code and phone number
    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;

    setIsLoading(true);
    try {
      const result = await requestOTP(fullPhoneNumber);
      setFallback(result.fallback || null);
      
      if (result.success) {
        // Navigate to OTP verification screen
        router.push({
          pathname: '/(auth)/verify-otp',
          params: {
            phone: fullPhoneNumber,
            supportPhone: result.fallback?.supportPhone || '',
            supportWhatsApp: result.fallback?.supportWhatsApp || '',
            fallbackMessage: result.fallback?.message || '',
            retryAfterSeconds: String(result.retryAfterSeconds || 60),
          }
        });
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo/Icon */}
          <AlHilalLogo width={180} height={32} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Welcome to Al-Hilal</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
              {/* Country Code Selector */}
              <TouchableOpacity
                style={[styles.countrySelector, { borderRightColor: colors.border }]}
                onPress={() => setShowCountryPicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={[styles.dialCode, { color: colors.text }]}>{selectedCountry.dialCode}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              {/* Phone Number Input */}
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="712345678"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                editable={!isLoading}
                autoFocus
                maxLength={10}
              />
            </View>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Enter your phone number without the leading zero
            </Text>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorContainer, { 
                backgroundColor: colorScheme === 'dark' ? '#4C1D1D' : '#FEE2E2',
                borderLeftColor: colors.error 
              }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, isLoading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              We&apos;ll send you a one-time password to verify your number
            </Text>
          </View>

          {fallback && (fallback.supportPhone || fallback.supportWhatsApp || fallback.message) ? (
            <View style={[styles.supportCard, { backgroundColor: colors.card }, Shadow.small]}>
              <View style={styles.supportHeader}>
                <Ionicons name="help-buoy" size={18} color={colors.primary} />
                <Text style={[styles.supportTitle, { color: colors.text }]}>
                  Having trouble receiving the code?
                </Text>
              </View>
              {fallback.message ? (
                <Text style={[styles.supportText, { color: colors.mutedForeground }]}>
                  {fallback.message}
                </Text>
              ) : null}
              <View style={styles.supportActions}>
                {fallback.supportPhone ? (
                  <TouchableOpacity
                    style={[styles.supportButton, { borderColor: colors.border }]}
                    onPress={() => Linking.openURL(`tel:${fallback.supportPhone}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                    <Text style={[styles.supportButtonText, { color: colors.primary }]}>Call Support</Text>
                  </TouchableOpacity>
                ) : null}
                {fallback.supportWhatsApp ? (
                  <TouchableOpacity
                    style={[styles.supportButton, { borderColor: colors.border }]}
                    onPress={() => Linking.openURL(`https://wa.me/${fallback.supportWhatsApp.replace(/\D/g, '')}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color={colors.primary} />
                    <Text style={[styles.supportButtonText, { color: colors.primary }]}>WhatsApp</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryOption,
                  { borderBottomColor: colors.border },
                  selectedCountry.code === country.code && { backgroundColor: colors.muted }
                ]}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
                <Text style={[styles.countryDialCode, { color: colors.mutedForeground }]}>
                  {country.dialCode}
                </Text>
                {selectedCountry.code === country.code && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  header: {
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
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
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderRightWidth: 1,
  },
  flag: {
    fontSize: 24,
  },
  dialCode: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.fontSize.lg,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 4,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  button: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.small,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportCard: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  supportTitle: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  supportText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  supportActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  supportButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
    ...Shadow.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
  },
  countryFlag: {
    fontSize: 32,
  },
  countryName: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  countryDialCode: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
  },
});
