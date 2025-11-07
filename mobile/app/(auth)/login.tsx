import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import { Button } from '@/components/ui';
import { AlHilalLogo } from '@/components/AlHilalLogo';
import * as Haptics from 'expo-haptics';

const COUNTRIES = [
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
];

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const formatPhoneNumber = (phoneNum: string) => {
    // Remove leading zero if present
    let formatted = phoneNum.replace(/^0+/, '');
    // Append country code
    return `${selectedCountry.dialCode}${formatted}`;
  };

  const handleRequestOTP = async () => {
    if (phone.length < 9) {
      setError('Please enter a valid phone number');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');
    
    const fullPhone = formatPhoneNumber(phone);
    console.log('Requesting OTP for:', fullPhone);
    
    // Simulate API call - Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);

    // TODO: Implement actual API call
    // try {
    //   const response = await fetch('API_URL/auth/request-otp/', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ phone: fullPhone }),
    //   });
    //   if (response.ok) {
    //     setStep('otp');
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //   } else {
    //     const data = await response.json();
    //     setError(data.error || 'Failed to send OTP');
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //   }
    // } catch (error) {
    //   setError('Network error. Please try again.');
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete OTP');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setError('');
    
    const fullPhone = formatPhoneNumber(phone);
    console.log('Verifying OTP for:', fullPhone);
    
    // Simulate API call - Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to dashboard (temporary - replace with actual navigation)
      router.replace('/(tabs)');
    }, 1500);

    // TODO: Implement actual API call
    // try {
    //   const response = await fetch('API_URL/auth/verify-otp/', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ phone: fullPhone, otp: otpCode }),
    //   });
    //   if (response.ok) {
    //     const data = await response.json();
    //     // Store tokens
    //     await AsyncStorage.setItem('access_token', data.access);
    //     await AsyncStorage.setItem('refresh_token', data.refresh);
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    //     router.replace('/(tabs)');
    //   } else {
    //     const data = await response.json();
    //     setError(data.error || 'Invalid OTP');
    //     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    //   }
    // } catch (error) {
    //   setError('Network error. Please try again.');
    //   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOTPKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <AlHilalLogo width={180} height={32} />
          </View>

          {/* Title & Instructions */}
          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Sign In</Text>
            <Text style={[styles.instructions, { color: colors.mutedForeground }]}>
              Sign in to access your bookings, manage your trips, and get personalized recommendations for your pilgrimage journey.
            </Text>
          </View>

          {/* Login Card */}
          <View style={[styles.loginCard, { backgroundColor: colors.card }, Shadow.medium]}>
            {step === 'phone' ? (
              <>
                <Text style={[styles.title, { color: colors.text }]}>Enter Your Phone Number</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  We&apos;ll send you a verification code
                </Text>

                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    style={[styles.countrySelector, { backgroundColor: colors.muted }]}
                    onPress={() => {
                      setShowCountryPicker(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.flag}>{selectedCountry.flag}</Text>
                    <Text style={[styles.dialCode, { color: colors.text }]}>
                      {selectedCountry.dialCode}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.phoneInput,
                      { backgroundColor: colors.muted, color: colors.text },
                    ]}
                    placeholder="700 000 000"
                    placeholderTextColor={colors.mutedForeground}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      setError('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={9}
                    autoFocus
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                  </View>
                ) : null}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleRequestOTP}
                  loading={loading}
                  disabled={phone.length < 9}
                  icon={<Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />}
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToPhone}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.text }]}>Enter Verification Code</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  We sent a 6-digit code to{'\n'}{selectedCountry.dialCode} {phone}
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputs.current[index] = ref!;
                      }}
                      style={[
                        styles.otpInput,
                        {
                          backgroundColor: colors.muted,
                          color: colors.text,
                          borderColor: digit ? colors.primary : colors.border,
                        },
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOTPChange(index, value)}
                      onKeyPress={({ nativeEvent: { key } }) => handleOTPKeyPress(index, key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                  </View>
                ) : null}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={otp.join('').length !== 6}
                  icon={<Ionicons name="checkmark" size={20} color={colors.primaryForeground} />}
                >
                  Verify & Login
                </Button>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleRequestOTP}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    Didn&apos;t receive code? Resend
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark" size={20} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Your information is secure and encrypted
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.countriesList}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    {
                      backgroundColor:
                        selectedCountry.code === country.code ? colors.muted : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={[styles.countryName, { color: colors.text }]}>{country.name}</Text>
                  <Text style={[styles.countryDialCode, { color: colors.mutedForeground }]}>
                    {country.dialCode}
                  </Text>
                  {selectedCountry.code === country.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingTop: Spacing.xxl,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  pageTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.black,
    textAlign: 'center',
  },
  instructions: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  loginCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  flag: {
    fontSize: 24,
  },
  dialCode: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  resendButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.fontSize.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  countriesList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryName: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  countryDialCode: {
    fontSize: Typography.fontSize.md,
    marginRight: Spacing.sm,
  },
});

