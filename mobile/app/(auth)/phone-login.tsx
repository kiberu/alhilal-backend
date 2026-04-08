import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FooterInfoCard } from '@/components/guest/cards';
import { TopBar } from '@/components/guest/primitives';
import { useGuestTheme } from '@/lib/guest/theme';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const theme = useGuestTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: theme.spacing.compact,
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: theme.spacing.heroGap * 2,
            gap: theme.spacing.sectionGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar
          title="Pilgrim Access"
          subtitle="Coming soon"
          leadingIcon="arrow-back"
          onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)' as never))}
        />

        <FooterInfoCard
          title="Coming soon"
          body="Pilgrim dashboard features like trip updates, self-service tools, and richer in app support coming in next versions"
        />
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
});
