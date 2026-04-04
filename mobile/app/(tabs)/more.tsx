import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MenuListItem, PrimaryPillButton, TopBar } from '@/components/guest/primitives';
import { guestMoreMenu } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { useAuth } from '@/contexts/auth-context';

export default function MoreScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)' as never);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: 120,
            gap: theme.spacing.sectionGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar title="More" subtitle="Support, trust pages, preferences, and pilgrim access" />

        <View style={[styles.menuStack, { borderColor: theme.palette.border }]}>
          {guestMoreMenu.map((item) => (
            <MenuListItem
              key={item.label}
              label={item.label}
              description={item.description}
              icon={item.icon}
              variant="list"
              onPress={() => router.push(item.target as never)}
            />
          ))}
        </View>

        {isAuthenticated ? (
          <View style={[styles.accountCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
            <View style={styles.accountRow}>
              <View style={[styles.accountIcon, { backgroundColor: theme.palette.primarySoft }]}>
                <Ionicons name="person-circle-outline" size={22} color={theme.palette.primary} />
              </View>
              <View style={styles.accountCopy}>
                <Text style={[styles.accountTitle, { color: theme.palette.text }]} numberOfLines={1}>
                  {user?.name || 'Signed in pilgrim'}
                </Text>
                <Text style={[styles.accountMeta, { color: theme.palette.mutedText }]} numberOfLines={1}>
                  {user?.phone || ''}
                </Text>
              </View>
            </View>
            <PrimaryPillButton label="Logout" icon="log-out-outline" onPress={handleLogout} fullWidth />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  menuStack: {
    borderTopWidth: 1,
  },
  accountCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCopy: {
    flex: 1,
    gap: 2,
  },
  accountTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  accountMeta: {
    fontSize: 13,
  },
});
