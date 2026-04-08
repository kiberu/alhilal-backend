import type { GuidanceArticleDetail, GuidanceArticleSummary } from '@/lib/api/services';

const publishedAt = '2026-04-03T09:00:00Z';

const fallbackArticles: GuidanceArticleDetail[] = [
  {
    id: 'first-time-umrah-checklist',
    slug: 'first-time-umrah-checklist',
    title: 'First-Time Umrah Checklist From Uganda and East Africa',
    description:
      'A full step-by-step preparation path for first-time Umrah pilgrims travelling from Uganda and nearby East African countries.',
    category: 'Pilgrimage readiness',
    featured: true,
    featuredOrder: 1,
    imageUrl: '',
    readTime: '9 min read',
    publishedAt,
    updatedAt: publishedAt,
    authorName: 'Al-Hilal Team',
    authorRoleLabel: 'Pilgrim Support and Guidance',
    intro: [
      'Most first-time pilgrims do not fail because they are unserious. They struggle because information arrives in pieces.',
      'This article gives one clear preparation path for pilgrims in Uganda and East Africa, so you can move from intention to a practical, calm booking process.',
    ],
    sections: [
      {
        heading: '1) Start with readiness, not shopping',
        paragraphs: [
          'Before tickets, bags, or hotel comparisons, confirm your travel identity and timing.',
          'Check passport validity and make sure names are consistent across all documents you will use for booking and travel.',
        ],
        checklist: [
          'Passport validity confirmed and bio page ready',
          'Preferred month and backup month agreed with family or sponsor',
          'Clear budget range set before asking for package options',
        ],
      },
      {
        heading: '2) Understand permit and timing logic early',
        paragraphs: [
          'Saudi pilgrimage systems use permit timing and operational windows.',
          'Build a timeline that includes visa processing, vaccination prep, and a buffer for document corrections.',
        ],
      },
      {
        heading: '3) Build an ibadah-centered practical plan',
        paragraphs: [
          'A good first Umrah plan protects worship by reducing operational stress.',
          'Keep your plan simple: what you must carry daily, who you call in each phase, and what to do if group members are separated in crowds.',
        ],
        checklist: [
          'Written day-of-travel checklist for passport, medication, and contacts',
          'Group communication plan with one lead contact',
          'Simple spiritual and physical pace plan for the first two days',
        ],
      },
    ],
    takeaway:
      'First-time Umrah is easier when you sequence decisions correctly: readiness first, permit timing second, then travel logistics.',
    sources: [
      { label: 'Ministry of Hajj and Umrah FAQ', url: 'https://haj.gov.sa/en/FAQ' },
      { label: 'Nusuk Platform', url: 'https://www.nusuk.sa/' },
    ],
    keywords: [
      'first time umrah checklist uganda',
      'umrah planning east africa',
      'umrah preparation kampala',
    ],
  },
  {
    id: 'umrah-cost-planning-uganda',
    slug: 'umrah-cost-planning-uganda',
    title: 'Umrah Cost Planning From Uganda: A Practical 2026 Budget Framework',
    description:
      'How to estimate Umrah cost clearly from Uganda and East Africa without confusion between package price and real travel spend.',
    category: 'Budget and pricing',
    featured: true,
    featuredOrder: 2,
    imageUrl: '',
    readTime: '10 min read',
    publishedAt,
    updatedAt: publishedAt,
    authorName: 'Al-Hilal Team',
    authorRoleLabel: 'Pilgrim Support and Guidance',
    intro: [
      'A package quote is not the same thing as your final Umrah spend.',
      'Use this framework to build a complete, honest budget before paying deposits.',
    ],
    sections: [
      {
        heading: '1) Separate fixed costs from variable costs',
        paragraphs: [
          'Fixed costs usually include your core package items. Variable costs include personal spending patterns, local transport variance, and emergency buffers.',
          'Your first goal is not to find the cheapest quote. It is to compare like-for-like package structures so you can make a safe financial decision.',
        ],
        checklist: [
          'Package inclusions and exclusions written in plain language',
          'Currency assumptions documented before sending money',
          'Emergency reserve allocated for each traveler',
        ],
      },
      {
        heading: '2) Build a sponsor-safe payment flow',
        paragraphs: [
          'If a family member abroad is paying, agree in advance which portions they cover and which portions the traveler handles locally.',
          'Write this in one shared message thread so no one assumes a cost is covered when it is not.',
        ],
      },
      {
        heading: '3) Track three milestones',
        paragraphs: [
          'Budget discipline improves when you tie spending to milestones: booking, pre-departure completion, and travel week readiness.',
          'At each milestone, reconcile what changed, why it changed, and whether you are still inside the plan.',
        ],
      },
    ],
    takeaway:
      'Smart Umrah budgeting is less about chasing the lowest number and more about planning every expected cost before travel pressure starts.',
    sources: [
      { label: 'Ministry of Hajj and Umrah FAQ', url: 'https://haj.gov.sa/en/FAQ' },
      { label: 'Nusuk Platform', url: 'https://www.nusuk.sa/' },
    ],
    keywords: [
      'umrah cost uganda',
      'umrah package price kampala',
      'umrah budget east africa',
    ],
  },
  {
    id: 'family-travel-planning-umrah',
    slug: 'family-travel-planning-umrah',
    title: 'How to Plan Umrah for Families in Uganda and East Africa',
    description:
      'A full family-planning guide covering rooming, children, elders, and communication for smoother Umrah group travel.',
    category: 'Family and household',
    featured: true,
    featuredOrder: 3,
    imageUrl: '',
    readTime: '9 min read',
    publishedAt,
    updatedAt: publishedAt,
    authorName: 'Al-Hilal Team',
    authorRoleLabel: 'Pilgrim Support and Guidance',
    intro: [
      'Family Umrah planning succeeds when practical household realities are handled upfront.',
      'This structure helps families prepare in a way that protects both worship focus and wellbeing.',
    ],
    sections: [
      {
        heading: '1) Define your family travel profile',
        paragraphs: [
          'List ages, mobility considerations, medication needs, and likely stress points for each traveler.',
          'When these needs are known early, rooming and movement plans become much easier.',
        ],
      },
      {
        heading: '2) Set family communication rules',
        paragraphs: [
          'Assign one lead contact and one backup contact. Agree on check-in times and meeting points in both Makkah and Madinah.',
          'Small communication systems reduce panic in crowded spaces and keep group members aligned.',
        ],
        checklist: [
          'One lead contact and one deputy confirmed',
          'Meeting points saved on each phone',
          'Simple daily check-in schedule agreed',
        ],
      },
      {
        heading: '3) Pace ibadah with health realities',
        paragraphs: [
          'Family groups should avoid overloading day one. A soft landing plan helps children and elders settle before high-energy movement.',
          'Keep hydration, rest windows, and medication adherence central to your itinerary.',
        ],
      },
    ],
    takeaway:
      'A family Umrah plan should feel gentle, clear, and role-based. That is what allows worship to remain the center.',
    sources: [
      {
        label: 'Pilgrim Health Portal (Saudi MOH)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
      { label: 'Nusuk Platform', url: 'https://www.nusuk.sa/' },
    ],
    keywords: [
      'family umrah uganda',
      'umrah with children east africa',
      'umrah elders planning',
    ],
  },
  {
    id: 'sponsor-from-abroad-umrah',
    slug: 'sponsor-from-abroad-umrah',
    title: 'How to Book Umrah When a Relative Abroad Is Paying',
    description:
      'A sponsor-assisted booking playbook for Uganda and East Africa households managing cross-border money and approvals.',
    category: 'Planning and stewardship',
    featured: false,
    featuredOrder: 0,
    imageUrl: '',
    readTime: '8 min read',
    publishedAt,
    updatedAt: publishedAt,
    authorName: 'Al-Hilal Team',
    authorRoleLabel: 'Pilgrim Support and Guidance',
    intro: [
      'Sponsor-assisted Umrah is common in East Africa.',
      'The risk is not generosity. The risk is unclear responsibility. This article helps families define responsibilities before funds move.',
    ],
    sections: [
      {
        heading: '1) Clarify financial roles before booking',
        paragraphs: [
          'Document who is paying deposits, who is covering personal spending, and how exchange-rate differences will be handled.',
          'If this is not defined, frustration appears late in the process when options are narrower.',
        ],
      },
      {
        heading: '2) Keep one decision thread',
        paragraphs: [
          'Use one shared communication channel for approvals and package decisions.',
          'A single thread protects trust and keeps records clear for all parties.',
        ],
      },
      {
        heading: '3) Lock timelines around paperwork and health prep',
        paragraphs: [
          'Sponsor funding should follow readiness milestones, not emotions.',
          'Release funds in phases tied to document completeness and travel readiness.',
        ],
      },
    ],
    takeaway:
      'Sponsor-assisted Umrah works best when financial generosity is paired with disciplined, written process.',
    sources: [
      { label: 'Ministry of Hajj and Umrah FAQ', url: 'https://haj.gov.sa/en/FAQ' },
      { label: 'Ministry of Foreign Affairs Visa Platform', url: 'https://visa.mofa.gov.sa/' },
    ],
    keywords: [
      'sponsor umrah uganda',
      'umrah paid from abroad',
      'family remittance umrah booking',
    ],
  },
  {
    id: 'nusuk-app-and-rawdah-booking',
    slug: 'nusuk-app-and-rawdah-booking',
    title: 'Nusuk App Guide for East African Pilgrims: Permits, Timing, and Common Mistakes',
    description:
      'How Uganda and East Africa pilgrims can use Nusuk better for permit timing and visit planning, including common rebooking pitfalls.',
    category: 'Digital pilgrimage tools',
    featured: false,
    featuredOrder: 0,
    imageUrl: '',
    readTime: '8 min read',
    publishedAt,
    updatedAt: publishedAt,
    authorName: 'Al-Hilal Team',
    authorRoleLabel: 'Pilgrim Support and Guidance',
    intro: [
      'Nusuk is now central to the pilgrimage experience for many travelers.',
      'Pilgrims who understand how permit timing works usually avoid the stress that others face on arrival.',
    ],
    sections: [
      {
        heading: '1) Understand active permit behavior',
        paragraphs: [
          'Permit systems are time-bound. If your time has started, you may need to wait for expiry before issuing a fresh one depending on the action.',
          'This is why you should confirm schedules before locking group movement plans.',
        ],
      },
      {
        heading: '2) Build a low-friction phone setup',
        paragraphs: [
          'Before travel, verify app install, account access, and device updates.',
          'Save screenshots and key identifiers in case network conditions are poor.',
        ],
      },
      {
        heading: '3) Use a permit buffer, not exact-edge timing',
        paragraphs: [
          'Do not schedule your entire day with no cushion around permit times.',
          'Build transport and crowd buffers so worship is not rushed.',
        ],
      },
    ],
    takeaway:
      'Treat Nusuk as an operational tool, not an afterthought. Permit timing discipline protects your entire journey flow.',
    sources: [
      { label: 'Ministry of Hajj and Umrah FAQ', url: 'https://haj.gov.sa/en/FAQ' },
      { label: 'Nusuk Platform', url: 'https://www.nusuk.sa/' },
      {
        label: 'MOHU News: Nusuk app service activation',
        url: 'https://haj.gov.sa/en/Media-Center/Ministry-News/Ministry-of-Hajj-and-Umrah-activates-the-Nusuk-application-without-internet-consumption-to-serve-the',
      },
    ],
    keywords: [
      'nusuk app uganda',
      'rawdah booking east africa',
      'umrah permit timing',
    ],
  },
];

function toSummary(article: GuidanceArticleDetail): GuidanceArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
    featured: article.featured,
    featuredOrder: article.featuredOrder,
    imageUrl: article.imageUrl,
    readTime: article.readTime,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: article.authorName,
    authorRoleLabel: article.authorRoleLabel,
  };
}

export function getGuestFallbackGuidanceArticles(): GuidanceArticleDetail[] {
  return fallbackArticles;
}

export function getGuestFallbackGuidanceSummaries(): GuidanceArticleSummary[] {
  return fallbackArticles.map(toSummary);
}

export function getGuestFallbackGuidanceArticleBySlug(slug: string): GuidanceArticleDetail | null {
  return fallbackArticles.find((article) => article.slug === slug) || null;
}
