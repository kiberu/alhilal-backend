import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FooterInfoCard, KaabaHeroPanel } from '@/components/guest/cards';
import { guestContent, guestSupport } from '@/lib/guest/config';
import { markGuestOnboardingSeen } from '@/lib/guest/onboarding';
import { useGuestTheme } from '@/lib/guest/theme';

export default function GetStartedScreen() {
  const theme = useGuestTheme();
  const router = useRouter();

  const continueTo = async (target: '/(tabs)' | '/(tabs)/journeys') => {
    await markGuestOnboardingSeen();
    router.replace(target);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.palette.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: theme.spacing.pageHorizontal,
            paddingBottom: theme.spacing.heroGap * 2,
            gap: theme.spacing.sectionGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <KaabaHeroPanel
          headline={guestContent.getStarted.headline}
          subtext={guestContent.getStarted.description}
          proofChips={guestContent.getStarted.proofChips}
          primaryLabel={guestContent.getStarted.primaryCta}
          secondaryLabel={guestContent.getStarted.secondaryCta}
          onPrimaryPress={() => void continueTo('/(tabs)')}
          onSecondaryPress={() => void continueTo('/(tabs)/journeys')}
        />

        <View style={styles.stack}>
          <FooterInfoCard
            title="Trusted support, before you travel"
            body="Browse published journeys, read guidance, and speak to Al Hilal through WhatsApp, phone, or the Kampala office when you need help choosing."
          />
          <FooterInfoCard
            title="Need help right away?"
            body={`${guestSupport.phone} · ${guestSupport.email}\n${guestSupport.address}`}
          />
        </View>
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
  stack: {
    gap: 16,
  },
});
