import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ContactRows, FooterInfoCard, PrimaryContactActionRow } from '@/components/guest/cards';
import { TopBar } from '@/components/guest/primitives';
import { guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { openExternalUrl, openWhatsAppConversation } from '@/lib/support/open-external';

export default function ContactScreen() {
  const theme = useGuestTheme();
  const router = useRouter();

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
        <TopBar title="Contact Us" subtitle="Put help one tap away" leadingIcon="arrow-back" onLeadingPress={() => router.back()} />

        <PrimaryContactActionRow
          actions={[
            { label: 'Call', icon: 'call-outline', onPress: () => void openExternalUrl(guestSupport.phoneHref) },
            {
              label: 'WhatsApp',
              icon: 'logo-whatsapp',
              onPress: () => void openWhatsAppConversation({ phone: guestSupport.whatsapp }),
            },
            { label: 'Email', icon: 'mail-outline', onPress: () => void openExternalUrl(guestSupport.emailHref) },
          ]}
        />

        <ContactRows
          rows={[
            { label: 'Phone', value: guestSupport.phone, icon: 'call-outline', onPress: () => void openExternalUrl(guestSupport.phoneHref) },
            {
              label: 'WhatsApp',
              value: guestSupport.whatsapp,
              icon: 'logo-whatsapp',
              onPress: () => void openWhatsAppConversation({ phone: guestSupport.whatsapp }),
            },
            { label: 'Email', value: guestSupport.email, icon: 'mail-outline', onPress: () => void openExternalUrl(guestSupport.emailHref) },
            { label: 'Website', value: guestSupport.website, icon: 'globe-outline', onPress: () => void openExternalUrl(guestSupport.website) },
          ]}
        />

        <FooterInfoCard
          title="Office information"
          body={`${guestSupport.address}\n${guestSupport.hours}`}
          linkLabel="Open map"
          onPress={() => void openExternalUrl(guestSupport.mapHref)}
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
