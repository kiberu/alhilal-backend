import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import type { GuidanceArticleSummary, PublicTrip } from '@/lib/api/services';
import { formatPublicDateRange, formatPublicMoney } from '@/lib/public-format';
import { guestImages } from '@/lib/guest/config';
import { useGuestTheme } from '@/lib/guest/theme';
import { PrimaryPillButton, SecondaryPillButton } from '@/components/guest/primitives';

function resolveImageSource(uri: string | null | undefined, fallback: any) {
  if (uri) {
    return { uri };
  }

  return fallback;
}

export function KaabaHeroPanel({
  headline,
  subtext,
  proofChips,
  primaryLabel,
  secondaryLabel,
  onPrimaryPress,
  onSecondaryPress,
}: {
  headline: string;
  subtext: string;
  proofChips: readonly string[] | string[];
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <ImageBackground
      source={guestImages.hero}
      resizeMode="cover"
      imageStyle={styles.heroImage}
      style={[styles.kaabaHero, { backgroundColor: theme.palette.primaryStrong }]}
    >
      <LinearGradient
        colors={[`${theme.palette.primaryStrong}D9`, `${theme.palette.primary}A6`, `${theme.palette.accent}66`]}
        style={styles.heroGradient}
      >
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowBadge, { backgroundColor: `${theme.palette.primaryForeground}26` }]}>
            <Text style={[styles.eyebrowText, { color: theme.palette.primaryForeground }]}>Al Hilal</Text>
          </View>
          <View style={[styles.eyebrowBadge, { backgroundColor: `${theme.palette.accent}26` }]}>
            <Text style={[styles.eyebrowText, { color: theme.palette.primaryForeground }]}>Umrah and Hajj</Text>
          </View>
        </View>
        <Text style={[styles.heroHeadline, { color: theme.palette.primaryForeground }]}>{headline}</Text>
        <Text style={[styles.heroSubtext, { color: '#FBEFF5' }]}>{subtext}</Text>
        <View style={styles.heroChipWrap}>
          {proofChips.map((chip) => (
            <View
              key={chip}
              style={[styles.heroChip, { backgroundColor: `${theme.palette.primaryForeground}1F` }]}
            >
              <Text style={[styles.heroChipText, { color: theme.palette.primaryForeground }]}>{chip}</Text>
            </View>
          ))}
        </View>
        <View style={styles.heroActions}>
          <PrimaryPillButton
            label={primaryLabel}
            icon="arrow-forward-outline"
            onPress={onPrimaryPress}
            size="lg"
          />
          {secondaryLabel && onSecondaryPress ? (
            <SecondaryPillButton
              label={secondaryLabel}
              icon="compass-outline"
              onPress={onSecondaryPress}
              size="lg"
            />
          ) : null}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

export function WelcomeHeroCard({
  eyebrow,
  title,
  subtitle,
  buttonLabel,
  onPress,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onPress: () => void;
}) {
  const theme = useGuestTheme();
  const eyebrowColor = theme.colorScheme === 'dark' ? '#5A3005' : '#FDE7F0';
  const subtitleColor = theme.colorScheme === 'dark' ? '#6A3B08' : '#F9EDF3';

  return (
    <LinearGradient
      colors={[theme.palette.primaryStrong, theme.palette.primary, theme.palette.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.welcomeCard}
    >
      <Text style={[styles.smallEyebrow, { color: eyebrowColor }]}>{eyebrow}</Text>
      <Text style={[styles.welcomeTitle, { color: theme.palette.primaryForeground }]}>{title}</Text>
      <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>{subtitle}</Text>
      <PrimaryPillButton label={buttonLabel} icon="arrow-forward-outline" onPress={onPress} size="lg" />
    </LinearGradient>
  );
}

export function JourneyMiniCard({
  journey,
  onPress,
}: {
  journey: PublicTrip;
  onPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[styles.journeyMiniCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={resolveImageSource(journey.cover_image, guestImages.journeyFallback)}
        style={styles.journeyMiniImage}
        resizeMode="cover"
      />
      <View style={styles.journeyMiniBody}>
        <View style={styles.cardMetaRow}>
          {journey.featured ? <Badge text="Featured" tone="primary" /> : null}
          <Badge text={journey.status.replaceAll('_', ' ')} tone="gold" />
        </View>
        <Text style={[styles.journeyTitle, { color: theme.palette.text }]} numberOfLines={2}>
          {journey.name}
        </Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]} numberOfLines={1}>
          {formatPublicDateRange(journey.start_date, journey.end_date)}
        </Text>
        <Text style={[styles.priceCopy, { color: theme.palette.primary }]}>
          {journey.starting_price_minor_units
            ? `From ${formatPublicMoney(
                journey.starting_price_minor_units,
                journey.starting_price_currency || 'UGX'
              )}`
            : 'Price on request'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function JourneyHorizontalCard({
  journey,
  subtitle,
  onPress,
}: {
  journey: PublicTrip;
  subtitle?: string;
  onPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[styles.horizontalCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={resolveImageSource(journey.cover_image, guestImages.journeyFallback)}
        style={styles.horizontalImage}
        resizeMode="cover"
      />
      <View style={styles.horizontalBody}>
        <View style={styles.cardMetaRow}>
          {journey.featured ? <Badge text="Featured" tone="primary" /> : null}
          <Badge text={journey.status.replaceAll('_', ' ')} tone="gold" />
        </View>
        <Text style={[styles.horizontalTitle, { color: theme.palette.text }]}>{journey.name}</Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]}>
          {formatPublicDateRange(journey.start_date, journey.end_date)}
        </Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]} numberOfLines={1}>
          {journey.cities.join(', ') || 'Cities to be confirmed'}
        </Text>
        {subtitle ? <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]}>{subtitle}</Text> : null}
        <Text style={[styles.priceCopy, { color: theme.palette.primary }]}>
          {journey.starting_price_minor_units
            ? `Starting from ${formatPublicMoney(
                journey.starting_price_minor_units,
                journey.starting_price_currency || 'UGX'
              )}`
            : 'Pricing available on request'}
        </Text>
        <SecondaryPillButton label="View Details" icon="arrow-forward-outline" onPress={onPress} />
      </View>
    </TouchableOpacity>
  );
}

export function FeaturedGuidanceCard({
  article,
  width,
  onPress,
}: {
  article: GuidanceArticleSummary;
  width?: number;
  onPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[
        styles.featuredGuidanceCard,
        { backgroundColor: theme.palette.card, borderColor: theme.palette.border, width: width || 300 },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={resolveImageSource(article.imageUrl, guestImages.guidanceFallback)}
        style={styles.featuredGuidanceImage}
        resizeMode="cover"
      />
      <View style={styles.featuredGuidanceBody}>
        <Badge text={article.category || 'Guidance'} tone="primary" />
        <Text style={[styles.journeyTitle, { color: theme.palette.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]} numberOfLines={2}>
          {article.description}
        </Text>
        <Text style={[styles.inlineAction, { color: theme.palette.primary }]}>Read article</Text>
      </View>
    </TouchableOpacity>
  );
}

export function GuidanceArticleCard({
  article,
  onPress,
}: {
  article: GuidanceArticleSummary;
  onPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[styles.guidanceCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={resolveImageSource(article.imageUrl, guestImages.guidanceFallback)}
        style={styles.guidanceImage}
        resizeMode="cover"
      />
      <View style={styles.guidanceBody}>
        <View style={styles.cardMetaRow}>
          <Badge text={article.category || 'Guidance'} tone="primary" />
          {article.featured ? <Badge text="Featured" tone="gold" /> : null}
        </View>
        <Text style={[styles.horizontalTitle, { color: theme.palette.text }]}>{article.title}</Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]} numberOfLines={3}>
          {article.description}
        </Text>
        <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]}>
          {[article.readTime, article.authorName || 'Al Hilal Team'].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function GuidanceMiniCard({
  title,
  date,
  onPress,
}: {
  title: string;
  date: string;
  onPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <TouchableOpacity
      style={[styles.guidanceMiniCard, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Text style={[styles.guidanceMiniTitle, { color: theme.palette.text }]}>{title}</Text>
      <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]}>{date}</Text>
    </TouchableOpacity>
  );
}

export function FooterInfoCard({
  title,
  body,
  linkLabel,
  onPress,
}: {
  title: string;
  body: string;
  linkLabel?: string;
  onPress?: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.footerCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
      <Text style={[styles.footerTitle, { color: theme.palette.text }]}>{title}</Text>
      <Text style={[styles.footerBody, { color: theme.palette.mutedText }]}>{body}</Text>
      {linkLabel && onPress ? (
        <SecondaryPillButton label={linkLabel} icon="arrow-forward-outline" onPress={onPress} />
      ) : null}
    </View>
  );
}

export function ContactRows({
  rows,
}: {
  rows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }[];
}) {
  const theme = useGuestTheme();

  return (
    <View style={styles.contactRows}>
      {rows.map((row) => (
        <TouchableOpacity
          key={`${row.label}-${row.value}`}
          style={[styles.contactRow, { borderColor: theme.palette.border, backgroundColor: theme.palette.surface }]}
          onPress={row.onPress}
          activeOpacity={row.onPress ? 0.88 : 1}
          disabled={!row.onPress}
        >
          <View style={[styles.contactIconWrap, { backgroundColor: theme.palette.primarySoft }]}>
            <Ionicons name={row.icon} size={18} color={theme.palette.primary} />
          </View>
          <View style={styles.contactCopy}>
            <Text style={[styles.contactLabel, { color: theme.palette.mutedText }]}>{row.label}</Text>
            <Text style={[styles.contactValue, { color: theme.palette.text }]}>{row.value}</Text>
          </View>
          {row.onPress ? <Ionicons name="open-outline" size={16} color={theme.palette.primary} /> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function PrimaryContactActionRow({
  actions,
}: {
  actions: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[];
}) {
  const theme = useGuestTheme();

  return (
    <View style={styles.actionRow}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={[styles.actionButton, { backgroundColor: theme.palette.primary }]}
          onPress={action.onPress}
          activeOpacity={0.9}
        >
          <Ionicons name={action.icon} size={18} color={theme.palette.primaryForeground} />
          <Text style={[styles.actionButtonText, { color: theme.palette.primaryForeground }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function SupportActionCard({
  title,
  body,
  actions,
}: {
  title: string;
  body?: string;
  actions: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[];
}) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.supportCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
      <Text style={[styles.footerTitle, { color: theme.palette.text }]}>{title}</Text>
      {body ? <Text style={[styles.footerBody, { color: theme.palette.mutedText }]}>{body}</Text> : null}
      <View style={styles.supportActions}>
        {actions.map((action) => (
          <SecondaryPillButton key={action.label} label={action.label} icon={action.icon} onPress={action.onPress} fullWidth />
        ))}
      </View>
    </View>
  );
}

export function ChecklistCard({
  title,
  items,
  tone = 'surface',
}: {
  title: string;
  items: string[];
  tone?: 'surface' | 'accent';
}) {
  const theme = useGuestTheme();
  const backgroundColor = tone === 'accent' ? theme.palette.accentSoft : theme.palette.surface;

  return (
    <View style={[styles.checklistCard, { backgroundColor, borderColor: theme.palette.border }]}>
      <Text style={[styles.footerTitle, { color: theme.palette.text }]}>{title}</Text>
      <View style={styles.checklistItems}>
        {items.map((item) => (
          <View key={item} style={styles.checklistRow}>
            <Ionicons name="checkmark-circle" size={18} color={theme.palette.primary} />
            <Text style={[styles.footerBody, { color: theme.palette.mutedText, flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function InlineCalloutCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.inlineCallout, { backgroundColor: theme.palette.accentSoft, borderColor: theme.palette.accent }]}>
      <Text style={[styles.footerTitle, { color: theme.palette.text }]}>{title}</Text>
      <Text style={[styles.footerBody, { color: theme.palette.mutedText }]}>{body}</Text>
    </View>
  );
}

export function ArticleHeader({
  title,
  meta,
  imageUri,
}: {
  title: string;
  meta: string;
  imageUri?: string | null;
}) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.articleHeader, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
      <Image source={resolveImageSource(imageUri, guestImages.guidanceFallback)} style={styles.articleImage} resizeMode="cover" />
      <Text style={[styles.welcomeTitle, { color: theme.palette.text }]}>{title}</Text>
      <Text style={[styles.metaCopy, { color: theme.palette.mutedText }]}>{meta}</Text>
    </View>
  );
}

export function RichTextArticleBody({ paragraphs }: { paragraphs: string[] }) {
  const theme = useGuestTheme();

  return (
    <View style={[styles.articleBodyCard, { backgroundColor: theme.palette.card, borderColor: theme.palette.border }]}>
      {paragraphs.map((paragraph) => (
        <Text key={paragraph} style={[styles.articleParagraph, { color: theme.palette.text }]}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

export function PartnerLogoStrip({
  logos,
}: {
  logos: { name: string; source?: any }[] | readonly { name: string; source?: any }[];
}) {
  const theme = useGuestTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partnerStrip}>
      {logos.map((logo) => (
        <View
          key={logo.name}
          style={[styles.partnerTile, { backgroundColor: theme.palette.surface, borderColor: theme.palette.border }]}
        >
          {logo.source ? (
            <Image source={logo.source} style={styles.partnerLogo} resizeMode="contain" />
          ) : (
            <Text style={[styles.partnerText, { color: theme.palette.text }]}>{logo.name}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export function StickyBottomActionBar({
  primaryLabel,
  secondaryLabel,
  onPrimaryPress,
  onSecondaryPress,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  const theme = useGuestTheme();

  return (
    <View
      style={[
        styles.stickyBar,
        {
          backgroundColor: theme.palette.card,
          borderColor: theme.palette.border,
        },
      ]}
    >
      <SecondaryPillButton
        label={secondaryLabel}
        icon="calendar-outline"
        onPress={onSecondaryPress}
        fullWidth
      />
      <PrimaryPillButton
        label={primaryLabel}
        icon="logo-whatsapp"
        onPress={onPrimaryPress}
        fullWidth
      />
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: 'primary' | 'gold' }) {
  const theme = useGuestTheme();
  const backgroundColor = tone === 'primary' ? theme.palette.primarySoft : theme.palette.accentSoft;
  const color = tone === 'primary' ? theme.palette.primary : theme.palette.accentForeground;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kaabaHero: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 420,
  },
  heroImage: {
    opacity: 0.58,
  },
  heroGradient: {
    flex: 1,
    padding: 22,
    justifyContent: 'space-between',
    gap: 20,
  },
  eyebrowRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  eyebrowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroHeadline: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
  },
  heroSubtext: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: '92%',
  },
  heroChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroActions: {
    gap: 10,
  },
  welcomeCard: {
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  smallEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  journeyMiniCard: {
    width: 232,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  journeyMiniImage: {
    width: '100%',
    height: 132,
  },
  journeyMiniBody: {
    padding: 14,
    gap: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  journeyTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  metaCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
  priceCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  horizontalCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  horizontalImage: {
    width: '100%',
    height: 180,
  },
  horizontalBody: {
    padding: 16,
    gap: 10,
  },
  horizontalTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  featuredGuidanceCard: {
    width: 300,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredGuidanceImage: {
    width: '100%',
    height: 156,
  },
  featuredGuidanceBody: {
    padding: 16,
    gap: 10,
  },
  inlineAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  guidanceCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  guidanceImage: {
    width: '100%',
    height: 170,
  },
  guidanceBody: {
    padding: 16,
    gap: 10,
  },
  guidanceMiniCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  guidanceMiniTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  footerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  footerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  footerBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  contactRows: {
    gap: 10,
  },
  contactRow: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    minHeight: 54,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  supportCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  supportActions: {
    gap: 10,
  },
  checklistCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  checklistItems: {
    gap: 10,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  inlineCallout: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  articleHeader: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
    gap: 12,
  },
  articleImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
  },
  articleBodyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  articleParagraph: {
    fontSize: 15,
    lineHeight: 25,
  },
  partnerStrip: {
    gap: 12,
    paddingRight: 20,
  },
  partnerTile: {
    width: 132,
    height: 78,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerLogo: {
    width: '100%',
    height: '100%',
  },
  partnerText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  stickyBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 30,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
});
