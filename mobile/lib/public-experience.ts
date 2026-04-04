import type { ImageSourcePropType } from 'react-native';

export const publicMarketingPalette = {
  background: '#F6EFE8',
  surface: '#FFF8F1',
  surfaceStrong: '#F3E5D6',
  card: '#FFFFFF',
  text: '#231815',
  mutedText: '#6F6257',
  border: '#E2D2C2',
  primary: '#7F003A',
  primaryStrong: '#5E002B',
  primaryForeground: '#FFFFFF',
  gold: '#F2AD43',
  goldForeground: '#2A1A0A',
  success: '#2E7D5B',
  warning: '#B7791F',
  info: '#8A6F5A',
} as const;

export const publicMarketingImages: {
  heroBackground: ImageSourcePropType;
  journeyFallback: ImageSourcePropType;
  guidanceFallback: ImageSourcePropType;
  reassurance: ImageSourcePropType;
} = {
  heroBackground: require('../assets/alhilal-assets/Kaaba-hero.png'),
  journeyFallback: require('../assets/alhilal-assets/Kaaba-hero1.jpg'),
  guidanceFallback: require('../assets/alhilal-assets/about-image.jpg'),
  reassurance: require('../assets/alhilal-assets/about-image.jpg'),
};

export const publicSupport = {
  phone: '+256 700 773535',
  phoneHref: 'tel:+256700773535',
  whatsappHref: 'https://wa.me/256700773535',
  email: 'info@alhilaltravels.com',
  emailHref: 'mailto:info@alhilaltravels.com',
  office: 'Kyato Complex, Suite B5-18, Bombo Road, Kampala, Uganda',
  officeMapHref: 'https://maps.google.com/?q=Kyato+Complex+Bombo+Road+Kampala',
  hours: 'Monday to Friday: 9:00 AM to 6:00 PM · Saturday: 10:00 AM to 4:00 PM',
  websiteHowToBookHref: 'https://www.alhilaltravels.com/how-to-book',
};

export const publicHero = {
  eyebrow: "Answer Allah's Call with us...",
  title: 'Best Umrah and Hajj\nServices In Uganda',
  subtitle: 'Plan your Umrah or Hajj with a dedicated team based in Uganda with clarity and professionalism.',
  description:
    'Al Hilal helps Muslim pilgrims move from first question to final booking with clear dates, family-aware care, and real human support.',
  primaryCta: 'See Journey Packages',
  secondaryCta: 'About Al-hilal',
};

export const publicHeroHighlights = [
  { number: '01', label: 'Trusted and licensed operator' },
  { number: '02', label: 'End-to-end pilgrimage logistics' },
  { number: '03', label: 'Professional and experienced team' },
  { number: '04', label: 'Based in Kampala, Uganda' },
];

export const publicBookingStrip = {
  eyebrow: 'Quick booking form',
  title: 'Start a trip booking request',
  submitCta: 'Check availability',
};

export const publicWhyAlHilal = {
  eyebrow: 'Why Al Hilal',
  title: 'Clear planning matters before you ever reach the airport.',
  description:
    'People trust Al Hilal when the communication is clear, the support feels human, and the journey is organised in a way that protects worship instead of crowding it out.',
  supporting:
    'The site is built to help pilgrims compare journeys, understand booking, and ask better questions before they commit.',
  aboutCta: 'Why pilgrims in Uganda trust Al Hilal',
  stats: [
    {
      label: 'Licensed and accountable',
      value: 'Trusted operator',
      description:
        'Pilgrimage operations are run by a licensed team with clear processes and visible responsibility.',
      icon: 'shield-checkmark-outline' as const,
    },
    {
      label: 'Clarity before commitment',
      value: 'Transparent information',
      description:
        'Departure timing, package direction, and booking expectations are published early for better decisions.',
      icon: 'calendar-outline' as const,
    },
    {
      label: 'Human support throughout',
      value: 'Real conversations',
      description:
        'Pilgrims can ask practical questions and reach a real team that guides them with care from enquiry to departure.',
      icon: 'chatbubble-ellipses-outline' as const,
    },
  ],
};

export const publicHomeJourneyPreview = {
  eyebrow: 'Journeys',
  title: 'Upcoming journeys',
  description:
    'Al Hilal has a full season coverage for all of the months of the year. Choose the one that suits your schedule, budget and convenience.',
  actionLabel: 'Trip and booking information',
  viewAllLabel: 'View all journeys',
};

export const publicReassurance = {
  eyebrow: 'Need help choosing?',
  title: 'Compare confidently before you commit.',
  description:
    'Our team can help you compare dates, rooming, pricing, and travel fit for your household so your booking decision feels clear and well supported.',
  points: ['Date and package clarity', 'Family and rooming fit', 'Direct answers on WhatsApp'],
  contactTitle: 'Kampala office',
  contactIntro:
    'Call, email, or visit during office hours. WhatsApp is fastest for quick journey questions.',
  contactCta: 'Full contact form and map',
};

export const publicGuidancePreview = {
  eyebrow: 'Guidance',
  title: 'Start with the question you already have.',
  description: 'These editorial articles are written for Muslims planning Umrah and Hajj from Uganda and East Africa.',
  articleCta: 'Read article',
  hubCta: 'Visit the guidance hub',
};

export const publicJourneysPage = {
  eyebrow: 'Journeys',
  title: 'Compare Umrah and Hajj departures before you message the team.',
  description:
    'Start with dates, city mix, and price direction. Then speak to Al Hilal when you want help choosing the best fit for your household.',
  filtersTitle: 'Search and filter departures',
  searchLabel: 'Search',
  searchPlaceholder: 'Journey name, city, or month',
  statusLabel: 'Status',
  monthLabel: 'Departure month',
  resetLabel: 'Reset',
  allStatusesLabel: 'All statuses',
  allMonthsLabel: 'All departure months',
  featuredSectionEyebrow: 'Current departures',
  featuredSectionTitle: 'Featured first, then the rest.',
  featuredSectionDescription:
    'The featured journey gets the strongest emphasis, but every departure should still make it easy to compare dates, support, and the next step.',
  comparisonEyebrow: 'Comparison support',
  comparisonTitle: 'If two departures look close, ask before you book.',
  comparisonDescription:
    'A short WhatsApp conversation can help you compare dates, rooming, pricing, and whether a journey suits your household before you commit.',
  actionLabel: 'Trip and booking information',
  emptyTitle: 'No journeys matched your filters',
  emptyDescription:
    'Try resetting the filters or broadening your search to compare more published departures.',
};

export const publicJourneyDetailCopy = {
  packagesEyebrow: 'Packages',
  packagesTitle: 'Every package, with booking guidance',
  packagesDescription:
    'Use this to compare dates, pricing, flights, hotels, capacity, and the exact booking path for each package.',
  bookingCardTitle: 'How to book this package',
  bookingSteps: [
    'Step 1: Review this package details and travel dates.',
    'Step 2: Confirm rooming, travellers, and budget with Al Hilal.',
    'Step 3: Submit your consultation request with this package context, then complete booking confirmation.',
  ],
  readHowToBook: 'Read how to book',
  askOnWhatsApp: 'Ask on WhatsApp',
  supportEyebrow: 'Need help?',
  supportTitle: 'Talk to Al Hilal support',
  supportDescription:
    'Use the call line for urgent clarification, or open the contact page if you need the full office and email options.',
  supportCallCta: 'Call support',
  supportContactCta: 'View contact details',
};

export const publicGuidancePage = {
  eyebrow: 'Guidance',
  title: 'Umrah and Hajj guidance articles for Uganda and East Africa.',
  description:
    'Long-form editorial articles for first-timers, families, sponsors, and community groups preparing for sacred travel.',
  sectionEyebrow: 'Start here',
  sectionTitle: 'Read the article that matches the question already on your mind.',
  sectionDescription:
    'Start with your biggest question, then move into clearer planning with practical next steps.',
  emptyTitle: 'No guidance articles available yet',
  emptyDescription:
    'Published guidance is not available on this device yet. Refresh when connection returns or seed content in the local environment.',
  consultationTitle: 'Talk to Al Hilal if you want help after reading.',
  consultationDescription:
    'Start with the question already on your mind, and the team can help you move into the right journey or booking path.',
};
