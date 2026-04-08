import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  ChecklistCard,
  FooterInfoCard,
  InlineCalloutCard,
  PartnerLogoStrip,
} from '@/components/guest/cards';
import { TopBar } from '@/components/guest/primitives';
import { guestImages, guestPartners, guestSupport } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';

const aboutIntro = {
  eyebrow: 'About Al Hilal',
  title: 'A professional team you can trust for Hajj and Umrah',
  description:
    'Al Hilal helps pilgrims book, prepare, and travel with clearer communication, reachable support, and practical care before departure, during travel, and after return.',
};

const aboutReasons = [
  'Choose Al Hilal when you want one team to handle the full pilgrimage path with discipline, not guesswork. From first enquiry to return day, the process is built to protect worship and reduce travel stress.',
  'Pilgrims get clear package guidance before payment, practical planning support for families and sponsor-led bookings, and responsive communication when decisions need to be made quickly.',
  'You are not buying a ticket only. You are getting a professional operating team based in Uganda that coordinates visas, flights, accommodation, and on-ground support so your journey can stay focused on ibadah.',
];

const aboutBiography = {
  eyebrow: 'Our story',
  title: "Built to serve Allah's guests with clarity and discipline.",
  description:
    'Al Hilal is a licensed Hajj and Umrah operator focused on spiritual integrity, operational quality, and practical support from enquiry to return.',
  paragraphs: [
    'Al Hilal, as a professional pilgrimage operator, handles key travel operations including visa support, flights, accommodation, transport, and guided ziyarah coordination.',
    'We are registered as an authorized agent with the Ministry of Hajj and Umrah in Saudi Arabia and verified on Nusuk to issue Umrah visas for pilgrims in Uganda. We are also registered with the Uganda Bureau of Hajj Affairs to operate Hajj pilgrimage for our pilgrims.',
  ],
  highlights: [
    'Trusted and licensed Hajj and Umrah operator in Uganda',
    'End-to-end pilgrimage logistics and documentation support',
    'Authorized agent with Ministry of Hajj and Umrah Saudi Arabia',
    'Professional and experienced team operating with clarity',
  ],
};

const aboutLeadSheikh = {
  eyebrow: 'Word from the lead sheikh',
  name: 'Sheikh Hamza Saidi',
  role: 'Lead Sheikh and Pilgrim Guidance, Al Hilal Travels',
  quote:
    'When Allah invites a servant to His House, that journey is an honour and a trust. Our responsibility is to help you arrive with a heart ready for ibadah—supported by clear guidance, timely preparation, and a team that remembers we are serving guests of the Most Merciful, not merely moving passengers.',
  supporting:
    "The outward steps of visa, travel, and lodging exist so the inward work—tawaf, sa'i, du'a, and presence with Allah—can remain undivided. We begin with your circumstances and readiness, not with pressure to book; if a path is not right for your family or your state, we say so and help you toward what is.",
  commitments: [
    'Sacred priority: what strengthens your worship and peace of mind is explained before talk turns only to schedules and payments.',
    'Walking with you: preparation that respects the rank of the journey, attentive support while you are away, and care that continues when you return.',
    'Unity at home: families and sponsors kept in one clear plan so trust is preserved and distractions are fewer.',
  ],
};

const maqasidPrinciples = [
  {
    title: 'Din',
    description:
      'Keep worship central. Do not let the package, the sales language, or the schedule distract from why the pilgrim is travelling.',
  },
  {
    title: 'Nafs',
    description:
      'Protect pilgrims through calmer planning, better communication, and practical care when travel becomes stressful or tiring.',
  },
  {
    title: 'Aql',
    description:
      'Reduce confusion. Explain documents, timing, rooming, and next steps clearly so people can make better decisions.',
  },
  {
    title: 'Nasl',
    description:
      'Respect family realities. Support couples, elders, children, and sponsor-led households in a way that preserves trust and reduces friction.',
  },
  {
    title: 'Mal',
    description:
      'Handle money honestly. Be disciplined about pricing, what is included, and what a pilgrim still needs to budget for.',
  },
];

export default function AboutScreen() {
  const theme = useGuestTheme();
  const router = useRouter();
  const heroBodyColor = theme.colorScheme === 'dark' ? '#F9E7D7' : '#FCEFF5';

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
        <TopBar
          title="About Al Hilal"
          subtitle="A Kampala team for Umrah and Hajj"
          leadingIcon="arrow-back"
          onLeadingPress={() => router.back()}
        />

        <ImageBackground
          source={guestImages.about}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={[styles.hero, { backgroundColor: theme.palette.primaryStrong }]}
        >
          <View style={[styles.heroOverlay, { backgroundColor: `${theme.palette.primaryStrong}B5` }]}>
            <Text style={[styles.heroEyebrow, { color: theme.palette.accent }]}>{aboutIntro.eyebrow}</Text>
            <Text style={[styles.heroTitle, { color: theme.palette.primaryForeground }]}>{aboutIntro.title}</Text>
            <Text style={[styles.heroBody, { color: heroBodyColor }]}>{aboutIntro.description}</Text>
          </View>
        </ImageBackground>

        <FooterInfoCard
          title="Answer Allah's call with Al-Hilal"
          body="If you want a team that can guide decisions, coordinate logistics, and keep worship central, this is what Al Hilal is built to deliver."
        />

        <FooterInfoCard title="Why pilgrims choose Al Hilal" body={aboutReasons.join('\n\n')} />

        <FooterInfoCard
          title={aboutBiography.title}
          body={`${aboutBiography.description}\n\n${aboutBiography.paragraphs.join('\n\n')}`}
        />

        <ChecklistCard title="What that looks like in practice" items={aboutBiography.highlights} />

        <FooterInfoCard title={aboutLeadSheikh.name} body={aboutLeadSheikh.role} />
        <InlineCalloutCard title={aboutLeadSheikh.eyebrow} body={aboutLeadSheikh.quote} />
        <FooterInfoCard title="Guidance" body={aboutLeadSheikh.supporting} />
        <ChecklistCard title="Commitments" items={aboutLeadSheikh.commitments} />

        <View style={styles.stack}>
          <Text style={[styles.sectionTitle, { color: theme.palette.text }]}>What shapes the service</Text>
          <Text style={[styles.sectionBody, { color: theme.palette.mutedText }]}>
            Worship, safety, understanding, family, and honest money handling.
          </Text>
          <Text style={[styles.sectionBody, { color: theme.palette.mutedText }]}>
            The Maqasid are not just theory for Al Hilal. They are a practical standard for how a pilgrimage service should speak, plan, and care for people.
          </Text>
        </View>

        <View style={styles.stack}>
          {maqasidPrinciples.map((item) => (
            <FooterInfoCard key={item.title} title={item.title} body={item.description} />
          ))}
        </View>

        <View style={styles.stack}>
          <Text style={[styles.sectionTitle, { color: theme.palette.text }]}>Partners and trust signals</Text>
          <PartnerLogoStrip logos={guestPartners} />
        </View>

        <FooterInfoCard
          title="Talk to Al Hilal"
          body={`Talk to a Kampala team that helps pilgrims compare journeys, understand what is included, and prepare properly before they commit.\n\n${guestSupport.phone}\n${guestSupport.email}\n${guestSupport.address}`}
          linkLabel="Contact us"
          onPress={() => router.push('/contact' as never)}
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
  hero: {
    minHeight: 260,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroImage: {
    opacity: 0.48,
  },
  heroOverlay: {
    flex: 1,
    padding: 22,
    justifyContent: 'flex-end',
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  stack: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
});
