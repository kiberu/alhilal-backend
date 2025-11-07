import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const menuItems = [
  {
    id: 'profile',
    icon: 'person',
    title: 'My Profile',
    subtitle: 'View and edit your information',
    route: '/profile',
    color: '#970246',
  },
  {
    id: 'bookings',
    icon: 'bookmark',
    title: 'My Bookings',
    subtitle: 'View your trip bookings',
    route: '/bookings',
    color: '#F9A028',
  },
  {
    id: 'visas',
    icon: 'document-text',
    title: 'My Visas',
    subtitle: 'Track visa processing',
    route: '/visas',
    color: '#10B981',
  },
  {
    id: 'about',
    icon: 'information-circle',
    title: 'About Al-Hilal',
    subtitle: 'Learn more about us',
    route: '/about',
    color: '#3B82F6',
  },
  {
    id: 'contact',
    icon: 'call',
    title: 'Contact Us',
    subtitle: 'Get in touch with our team',
    action: 'contact',
    color: '#8B5CF6',
  },
  {
    id: 'settings',
    icon: 'settings',
    title: 'Settings',
    subtitle: 'App preferences',
    route: '/settings',
    color: '#6B7280',
  },
];

const contactMethods = [
  {
    icon: 'call',
    title: 'Phone',
    value: '+256 700 773535',
    action: 'tel:+256700773535',
    color: '#10B981',
  },
  {
    icon: 'logo-whatsapp',
    title: 'WhatsApp',
    value: 'Chat with us',
    action: 'https://wa.me/256700773535',
    color: '#25D366',
  },
  {
    icon: 'mail',
    title: 'Email',
    value: 'info@alhilaltravels.com',
    action: 'mailto:info@alhilaltravels.com',
    color: '#3B82F6',
  },
  {
    icon: 'location',
    title: 'Visit Us',
    value: 'Kyato Complex, Bombo Rd',
    action: 'https://maps.google.com/?q=Kyato+Complex+Bombo+Road+Kampala',
    color: '#EF4444',
  },
];

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleMenuPress = (item: typeof menuItems[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.action === 'contact') {
      // Show contact options
      return;
    }
    if (item.route) {
      // TODO: Navigate when these screens are created
      console.log('Navigate to:', item.route);
    }
  };

  const handleContactPress = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(url);
  };

  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Section / Login CTA */}
        <TouchableOpacity
          style={[styles.userCard, Shadow.large]}
          onPress={handleLoginPress}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={[colors.primary, '#A8024E']}
            style={styles.userGradient}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userSubtitle}>Tap to sign in</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card }, Shadow.small]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Get in Touch</Text>
          <View style={styles.contactGrid}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactCard, { backgroundColor: colors.card }, Shadow.small]}
                onPress={() => handleContactPress(method.action)}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIconBox, { backgroundColor: `${method.color}15` }]}>
                  <Ionicons name={method.icon as any} size={24} color={method.color} />
                </View>
                <Text style={[styles.contactLabel, { color: colors.mutedForeground }]}>
                  {method.title}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]} numberOfLines={1}>
                  {method.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: colors.muted }]}>
          <Ionicons name="moon" size={32} color={colors.primary} />
          <Text style={[styles.appInfoText, { color: colors.mutedForeground }]}>
            Al-Hilal Travels App v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.mutedForeground }]}>
            © 2025 Al-Hilal Tours & Travel
          </Text>
        </View>

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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  userCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  userGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  userSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.sm,
  },
  menuSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Typography.fontSize.xs,
  },
  contactSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  contactCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  contactIconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  contactLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  appInfo: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  appInfoText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
});

