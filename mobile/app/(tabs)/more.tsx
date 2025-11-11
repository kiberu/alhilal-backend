import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Linking,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeContext } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import { Colors, Spacing, Typography, BorderRadius, Shadow } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

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
  const theme = useThemeContext();
  const { isAuthenticated, user, profile, logout } = useAuth();

  const [settings, setSettings] = React.useState({
    pushNotifications: true,
    emailUpdates: false,
  });

  // Menu items for authenticated users
  const authenticatedMenuItems = [
    {
      id: 'profile',
      icon: 'person-outline',
      title: 'My Profile',
      subtitle: 'View and edit your information',
      route: '/my-profile',
      color: '#970246',
    },
    {
      id: 'bookings',
      icon: 'calendar-outline',
      title: 'My Bookings',
      subtitle: 'View your trip bookings',
      route: '/my-bookings',
      color: '#F9A028',
    },
    {
      id: 'documents',
      icon: 'document-text-outline',
      title: 'My Documents',
      subtitle: 'Manage travel paperwork',
      route: '/my-documents',
      color: '#10B981',
    },
  ];

  // Menu items for all users
  const generalMenuItems = [
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: 'About Al-Hilal',
      subtitle: 'Learn more about us',
      route: '/about',
      color: '#3B82F6',
    },
  ];

  const handleMenuPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isAuthenticated || route === '/about') {
      router.push(route as any);
    } else {
      router.push('/(auth)/login');
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

  const handleUserCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isAuthenticated) {
      router.push('/my-profile' as any);
    } else {
      router.push('/(auth)/login');
    }
  };

  const toggleSetting = (key: keyof typeof settings, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    theme.setTheme(value ? 'dark' : 'light');
    Alert.alert('Theme updated', value ? 'Dark mode enabled for this session.' : 'Light mode enabled for this session.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await logout();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.name && user.name !== user?.phone) return user.name;
    return 'Guest User';
  };

  const getUserSubtitle = () => {
    if (isAuthenticated) return user?.phone || 'Verified Account';
    return 'Tap to sign in';
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
          onPress={handleUserCardPress}
          activeOpacity={0.95}
        >
          <LinearGradient
            colors={[colors.primary, '#A8024E']}
            style={styles.userGradient}
          >
            <View style={styles.avatarContainer}>
              {isAuthenticated ? (
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              ) : (
                <Ionicons name="person" size={48} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getUserName()}</Text>
              <Text style={styles.userSubtitle}>{getUserSubtitle()}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Authenticated Menu Items */}
        {isAuthenticated && (
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Account</Text>
            {authenticatedMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: colors.card }, Shadow.small]}
                onPress={() => handleMenuPress(item.route)}
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
        )}

        {/* Settings Section */}
        <View style={[styles.settingsSection, { backgroundColor: colors.card }, Shadow.small]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Receive booking reminders and updates
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => toggleSetting('pushNotifications', value)}
              thumbColor={settings.pushNotifications ? colors.primary : colors.border}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Email Updates</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Monthly highlights and travel tips
              </Text>
            </View>
            <Switch
              value={settings.emailUpdates}
              onValueChange={(value) => toggleSetting('emailUpdates', value)}
              thumbColor={settings.emailUpdates ? colors.primary : colors.border}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>
                Preview the upcoming dark theme
              </Text>
            </View>
            <Switch
              value={theme.colorScheme === 'dark'}
              onValueChange={handleThemeChange}
              thumbColor={theme.colorScheme === 'dark' ? colors.primary : colors.border}
            />
          </View>
        </View>

        {/* General Menu Items */}
        <View style={styles.menuSection}>
          {generalMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card }, Shadow.small]}
              onPress={() => handleMenuPress(item.route)}
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

        {/* Logout Button (Authenticated Users Only) - Temporary for testing */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: '#EF4444' }, Shadow.small]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Logout (Dev Only)</Text>
          </TouchableOpacity>
        )}

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
  avatarText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
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
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  settingsSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  settingTextGroup: {
    flex: 1,
    gap: Spacing.xs,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  contactSection: {
    marginBottom: Spacing.xl,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#EF4444',
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
