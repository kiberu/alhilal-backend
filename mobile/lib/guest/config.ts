import type { ImageSourcePropType } from 'react-native';

export const guestFeatureFlags = {
  bookingHelpForm: false,
  featuredGuidanceCarousel: true,
  pilgrimAccessV2: false,
} as const;

export const guestSupport = {
  phone: '+256 700 773535',
  phoneHref: 'tel:+256700773535',
  whatsapp: '+256 700 773535',
  whatsappHref: 'https://wa.me/256700773535',
  email: 'info@alhilaltravels.com',
  emailHref: 'mailto:info@alhilaltravels.com',
  address: 'Kyato Complex, Suite B5-18, Bombo Road, Kampala, Uganda',
  mapHref: 'https://maps.google.com/?q=Kyato+Complex+Bombo+Road+Kampala',
  website: 'https://www.alhilaltravels.com',
  privacyHref: 'https://www.alhilaltravels.com/privacy',
  termsHref: 'https://www.alhilaltravels.com/terms',
  howToBookHref: 'https://www.alhilaltravels.com/how-to-book',
  hours: 'Monday to Friday: 9:00 AM to 6:00 PM · Saturday: 10:00 AM to 4:00 PM',
} as const;

export const guestImages = {
  hero: require('@/assets/alhilal-assets/Kaaba-hero.png'),
  journeyFallback: require('@/assets/alhilal-assets/Kaaba-hero1.jpg'),
  guidanceFallback: require('@/assets/alhilal-assets/about-image.jpg'),
  about: require('@/assets/alhilal-assets/about-image.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export const guestContent = {
  getStarted: {
    title: 'Al Hilal Umrah and Hajj',
    headline: 'Plan sacred travel with calmer guidance and clear next steps.',
    description:
      'Browse departures, understand what is published, and speak to Al Hilal with confidence before you book.',
    proofChips: [
      'Official guidance',
      'Clear departures',
      'Trusted support',
      'Worship-first planning',
    ],
    primaryCta: 'Get Started',
    secondaryCta: 'Browse Journeys',
  },
  home: {
    greeting: "Answer Allah's Call",
    title: 'Plan your pilgrimage with clarity and care.',
    subtitle:
      'Compare journeys, read guidance, and reach a real Al Hilal team when you are ready for help.',
    primaryCta: 'Plan Your Pilgrimage',
    pilgrimAccessTitle: 'Booked pilgrim?',
    pilgrimAccessBody:
      'Pilgrim Access gives booked travellers the official entry point for login, updates, and support surfaces.',
  },
  journeys: {
    title: 'Journeys',
    introTitle: 'Compare departures before you message the team.',
    introBody:
      'Start with the published date window, city mix, and truthful price direction. Then ask Al Hilal for help choosing the right fit.',
    bookingHelpTitle: 'Request booking help',
    bookingHelpBody:
      'Share your preferred timing and the team will follow up with the next best journey options.',
  },
  guidance: {
    title: 'Guidance',
    introTitle: 'Start with the question already on your mind.',
    introBody:
      'Read practical guidance for first-time pilgrims, families, and households planning Umrah or Hajj from Uganda and East Africa.',
  },
  about: {
    title: 'About Al Hilal',
    story:
      'Al Hilal exists to help pilgrims move from intention to safe, organised sacred travel with clearer communication, respectful support, and accountable planning.',
    values: [
      {
        title: 'Service with care',
        body: 'Pilgrims should feel supported before departure, during travel, and after return.',
      },
      {
        title: 'Truth before pressure',
        body: 'Published journeys, support language, and next steps should help people decide well, not rush them.',
      },
      {
        title: 'Worship-first planning',
        body: 'Operational decisions should protect focus, dignity, and spiritual purpose throughout the journey.',
      },
    ],
  },
} as const;

export const guestQuickActions = [
  { icon: 'calendar-outline', label: 'Browse Journeys', target: '/(tabs)/journeys' },
  { icon: 'book-outline', label: 'Read Guidance', target: '/(tabs)/guidance' },
  { icon: 'compass-outline', label: 'How to Book', target: guestSupport.howToBookHref },
  { icon: 'call-outline', label: 'Contact Us', target: '/contact' },
  { icon: 'information-circle-outline', label: 'About Al Hilal', target: '/about' },
  { icon: 'person-circle-outline', label: 'Pilgrim Access', target: '/pilgrim-access' },
] as const;

export const guestMoreMenu = [
  {
    icon: 'information-circle-outline',
    label: 'About Al Hilal',
    description: 'Who we are and how we guide pilgrims',
    target: '/about',
  },
  {
    icon: 'call-outline',
    label: 'Contact Us',
    description: 'Phone, WhatsApp, email, and office details',
    target: '/contact',
  },
  {
    icon: 'settings-outline',
    label: 'Settings and Preferences',
    description: 'Theme, legal links, and app details',
    target: '/settings',
  },
  {
    icon: 'person-circle-outline',
    label: 'Pilgrim Access Login',
    description: 'Official entry for booked pilgrims',
    target: '/pilgrim-access',
  },
] as const;

export const guestPartners = [
  {
    name: 'IATA',
    source: require('@/assets/partners/iata-logo-photoroom.png'),
  },
  {
    name: 'Ministry of Hajj and Umrah',
    source: require('@/assets/partners/ministry-of-hajj-photoroom.png'),
  },
  {
    name: 'Nusuk',
    source: require('@/assets/partners/nusuk-logo-photoroom.png'),
  },
  {
    name: 'Saudi Vision 2030',
    source: require('@/assets/partners/vision-2030-photoroom.png'),
  },
] as const;

export const guestSettingsLinks = [
  { label: 'Privacy policy', href: guestSupport.privacyHref },
  { label: 'Terms of use', href: guestSupport.termsHref },
  { label: 'How to book', href: guestSupport.howToBookHref },
] as const;
