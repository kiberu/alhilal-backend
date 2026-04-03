import { appEnv } from '../lib/env'

export type NavItem = {
  label: string
  href: string
}

export type Journey = {
  slug: string
  title: string
  window: string
  destination: string
  duration: string
  price: string
  category: string
  description: string
  details: string[]
  image: string
  highlights: string[]
}

export type Guide = {
  slug: string
  category: string
  readTime: string
  title: string
  description: string
  image: string
  keywords: string[]
  publishedAt: string
  updatedAt: string
  author: string
  authorRole: string
  intro: string[]
  sections: {
    heading: string
    paragraphs: string[]
    checklist?: string[]
  }[]
  takeaway: string
  sources: {
    label: string
    url: string
  }[]
}

export type FaqItem = {
  question: string
  answer: string
}

export type Principle = {
  title: string
  description: string
  icon?: string
}

export type ContactMethod = {
  label: string
  value: string
  href?: string
  icon?: string
}

export type PartnerLogo = {
  name: string
  src: string
  className?: string
}

export const brand = {
  name: 'Al Hilal Travels Uganda',
  shortName: 'Al Hilal',
  logo: '/assets/brand/al-hilal-portrait-logo.png',
  lightLogo: '/assets/brand/al-hilal-light-logo.png',
  whatsappNumber: appEnv.contactPhone,
  whatsappUrl: appEnv.whatsappUrl,
  phone: appEnv.contactPhone,
  phoneUrl: `tel:${appEnv.contactPhone.replace(/\s+/g, '')}`,
  email: appEnv.contactEmail,
  emailUrl: `mailto:${appEnv.contactEmail}`,
  office: 'Kyato Complex, Suite B5-18, Bombo Road, Kampala, Uganda',
  hours:
    'Monday to Friday: 9:00 AM to 6:00 PM · Saturday: 10:00 AM to 4:00 PM',
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Journeys', href: '/journeys' },
  { label: 'How to Book', href: '/how-to-book' },
  { label: 'Guidance', href: '/guidance' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const footerLinks: NavItem[] = [
  { label: 'Journeys', href: '/journeys' },
  { label: 'How to Book', href: '/how-to-book' },
  { label: 'Guidance', href: '/guidance' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export const contactMethods: ContactMethod[] = [
  {
    label: 'Phone / WhatsApp',
    value: brand.phone,
    href: brand.phoneUrl,
    icon: 'phone',
  },
  {
    label: 'Email',
    value: brand.email,
    href: brand.emailUrl,
    icon: 'email',
  },
  {
    label: 'Office',
    value: brand.office,
    icon: 'location',
  },
  {
    label: 'Hours',
    value: brand.hours,
    icon: 'clock',
  },
]

export const heroHighlights = [
  { number: '01', label: 'Trusted and licensed operator' },
  { number: '02', label: 'End-to-end pilgrimage logistics' },
  { number: '03', label: 'Professional and experienced team' },
  { number: '04', label: 'Based in Kampala, Uganda' },
]

export const partnerLogos: PartnerLogo[] = [
  {
    name: 'IATA',
    src: '/assets/partners/iata-logo-photoroom.png',
  },
  {
    name: 'Ministry of Hajj and Umrah',
    src: '/assets/partners/ministry-of-hajj-photoroom.png',
  },
  {
    name: 'Nusuk',
    src: '/assets/partners/nusuk-logo-photoroom.png',
  },
  {
    name: 'Saudi Vision 2030',
    src: '/assets/partners/vision-2030-photoroom.png',
  },
]

export const imagery = {
  hero: '/assets/hero/kaaba-hero-user.png',
  featured: '/assets/fenna/main.png',
  journey: '/assets/hero/kaaba-bg-large.jpg',
  guidance: '/assets/journeys/guidance.jpg',
  about: '/assets/hero/kaaba-bg-large.jpg',
  contact: '/assets/hero/kaaba-bg-large.jpg',
}

export const featuredDeparture = {
  eyebrow: 'Featured Journey',
  title: 'Fenna Umrah Season II, This July',
  description:
    'Fenna Umrah is Al Hilal’s seasonal group departure to Makkah and Madinah—structured dates, scholar-led guidance, and hands-on support so visas, flights, and hotels do not crowd out your ibadah. Season II departs this July with places planned for pilgrims who want clarity from enquiry to return.',
  departure: '12 Jul 2026',
  returnDate: '20 Jul 2026',
  duration: '8 nights',
  destination: 'Makkah, Madinah',
  price: 'UGX 4.65M',
  cta: 'Trip and booking information',
}

export const whyAlHilalIntro = {
  eyebrow: 'Why Al Hilal',
  title: 'Clear planning matters before you ever reach the airport.',
  description:
    'People trust Al Hilal when the communication is clear, the support feels human, and the journey is organised in a way that protects worship instead of crowding it out.',
  supporting:
    'The site is built to help pilgrims compare journeys, understand booking, and ask better questions before they commit.',
}

export const whyAlHilalStats = [
  {
    label: 'Licensed and accountable',
    value: 'Trusted operator',
    icon: 'shield',
    description:
      'Pilgrimage operations are run by a licensed team with clear processes and visible responsibility.',
  },
  {
    label: 'Clarity before commitment',
    value: 'Transparent information',
    icon: 'calendar',
    description:
      'Departure timing, package direction, and booking expectations are published early for better decisions.',
  },
  {
    label: 'Human support throughout',
    value: 'Real conversations',
    icon: 'chat',
    description:
      'Pilgrims can ask practical questions and reach a real team that guides them with care from enquiry to departure.',
  },
]

export const journeys: Journey[] = [
  {
    slug: 'july-fenna-umrah-2026',
    title: 'Fenna Umrah Season II, This July',
    window: '12–20 Jul 2026',
    destination: 'Makkah, Madinah',
    duration: '8 nights',
    price: 'UGX 4.65M',
    category: 'Featured departure',
    description:
      'Fenna Umrah is Al Hilal’s seasonal group departure to Makkah and Madinah—structured dates, scholar-led guidance, and hands-on support so visas, flights, and hotels do not crowd out your ibadah. Season II departs this July.',
    details: [
      'This departure is built for pilgrims who want a focused July route with clear communication from the first question to the final briefing.',
      'It suits first-timers, couples, households, and sponsor-assisted travellers who need rooming, timing, and expectations explained plainly before booking.',
    ],
    image: '/assets/fenna/main.png',
    highlights: [
      'Flights, hotels, and guidance handled with worship in mind',
      'Useful for families, first-timers, and sponsor-assisted bookings',
      'Early price direction before a long enquiry is needed',
    ],
  },
]

export const journeySupport = {
  eyebrow: 'Need help choosing?',
  title: 'Compare confidently before you commit.',
  description:
    'Our team can help you compare dates, rooming, pricing, and travel fit for your household so your booking decision feels clear and well supported.',
  contactTitle: 'Kampala office',
  contactIntro:
    'Call, email, or visit during office hours. WhatsApp is fastest for quick journey questions.',
}

export const serviceStyleItems: Principle[] = [
  {
    title: 'Licensed operator',
    icon: 'shield',
    description:
      'A serious pilgrimage journey starts with a team people can trust to organise the basics well.',
  },
  {
    title: 'Family-aware care',
    icon: 'users',
    description:
      'Rooming, sponsor questions, first-timer worries, and household planning are treated as normal, not as exceptions.',
  },
  {
    title: 'Clear timing',
    icon: 'calendar',
    description:
      'Dates, package direction, and travel windows are shown early so pilgrims can plan with more honesty.',
  },
  {
    title: 'Real human support',
    icon: 'chat',
    description:
      'When pilgrims ask on WhatsApp, they should reach a team that understands what they are trying to work out.',
  },
]

export const services = serviceStyleItems.map((item) => ({
  kicker: item.title,
  icon: item.icon,
  title: item.title,
  description: item.description,
}))

export const guidanceArticles: Guide[] = [
  {
    slug: 'first-time-umrah-checklist',
    category: 'Pilgrimage readiness',
    readTime: '9 min read',
    title: 'First-Time Umrah Checklist From Uganda and East Africa',
    description:
      'A full step-by-step preparation path for first-time Umrah pilgrims travelling from Uganda and nearby East African countries.',
    image: imagery.guidance,
    keywords: [
      'first time umrah checklist uganda',
      'umrah planning east africa',
      'umrah preparation kampala',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Most first-time pilgrims do not fail because they are unserious. They struggle because information arrives in pieces. One person gives visa advice, another gives packing tips, and a third gives budget numbers that do not match the route they actually need.',
      'This article gives one clear preparation path for pilgrims in Uganda and East Africa, so you can move from intention to a practical, calm booking process.',
    ],
    sections: [
      {
        heading: '1) Start with readiness, not shopping',
        paragraphs: [
          'Before tickets, bags, or hotel comparisons, confirm your travel identity and timing. Check passport validity and make sure names are consistent across all documents you will use for booking and travel.',
          'Then define your realistic travel window. Many avoidable mistakes happen when a pilgrim wants one month, a sponsor expects another, and leave from work is approved for a third period.',
        ],
        checklist: [
          'Passport validity confirmed and legible passport bio page ready',
          'Preferred month and backup month agreed with family/sponsor',
          'Clear budget range set before asking for package options',
        ],
      },
      {
        heading: '2) Understand permit and timing logic early',
        paragraphs: [
          'Saudi pilgrimage systems use permit timing and operational windows. Ministry FAQs note that Umrah permit timing matters, and changes are usually handled by canceling before start time and rebooking in allowed windows.',
          'For East African pilgrims, this means you should avoid last-minute assumptions. Build a timeline that includes visa processing, vaccination prep, and a buffer for document corrections.',
        ],
      },
      {
        heading: '3) Build an ibadah-centered practical plan',
        paragraphs: [
          'A good first Umrah plan protects worship by reducing operational stress. That means clear rooming expectations, transport expectations, and communication expectations for the whole group before departure.',
          'Keep your plan simple: what you must carry daily, who you call in each phase, and what to do if group members are separated in crowds.',
        ],
        checklist: [
          'Written day-of-travel checklist for passport, meds, and contacts',
          'Group communication plan with one lead contact',
          'Simple spiritual and physical pace plan for the first two days',
        ],
      },
    ],
    takeaway:
      'First-time Umrah is easier when you sequence decisions correctly: readiness first, permit timing second, then travel logistics.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'umrah-cost-planning-uganda',
    category: 'Budget and pricing',
    readTime: '10 min read',
    title: 'Umrah Cost Planning From Uganda: A Practical 2026 Budget Framework',
    description:
      'How to estimate Umrah cost clearly from Uganda and East Africa without confusion between package price and real travel spend.',
    image: imagery.guidance,
    keywords: [
      'umrah cost uganda',
      'umrah package price kampala',
      'umrah budget east africa',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'A package quote is not the same thing as your final Umrah spend. Pilgrims from Uganda and East Africa often budget for the headline number and then struggle with extra costs that were predictable.',
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
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'family-travel-planning-umrah',
    category: 'Family and household',
    readTime: '9 min read',
    title: 'How to Plan Umrah for Families in Uganda and East Africa',
    description:
      'A full family-planning guide covering rooming, children, elders, and communication for smoother Umrah group travel.',
    image: imagery.guidance,
    keywords: [
      'family umrah uganda',
      'umrah with children east africa',
      'umrah elders planning',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Family Umrah planning succeeds when practical household realities are handled upfront. Couples, children, and elders need different pacing and support.',
      'This structure helps families prepare in a way that protects both worship focus and wellbeing.',
    ],
    sections: [
      {
        heading: '1) Define your family travel profile',
        paragraphs: [
          'List ages, mobility considerations, medication needs, and likely stress points for each traveler. Do not wait for travel week to discover these details.',
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
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'sponsor-from-abroad-umrah',
    category: 'Planning and stewardship',
    readTime: '8 min read',
    title: 'How to Book Umrah When a Relative Abroad Is Paying',
    description:
      'A sponsor-assisted booking playbook for Uganda and East Africa households managing cross-border money and approvals.',
    image: imagery.guidance,
    keywords: [
      'sponsor umrah uganda',
      'umrah paid from abroad',
      'family remittance umrah booking',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Sponsor-assisted Umrah is common in East Africa. A son in London, a daughter in Toronto, or a brother in Doha may fund parents in Uganda.',
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
          'Use one shared communication channel for approvals and package decisions. Scattered voice notes across many groups create contradictions.',
          'A single thread protects trust and keeps records clear for all parties.',
        ],
      },
      {
        heading: '3) Lock timelines around paperwork and health prep',
        paragraphs: [
          'Sponsor funding should follow readiness milestones, not emotions. Release funds in phases tied to document completeness and travel readiness.',
          'This keeps the process transparent and reduces last-minute pressure.',
        ],
      },
    ],
    takeaway:
      'Sponsor-assisted Umrah works best when financial generosity is paired with disciplined, written process.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
      {
        label: 'Ministry of Foreign Affairs Visa Platform',
        url: 'https://visa.mofa.gov.sa/',
      },
    ],
  },
  {
    slug: 'nusuk-app-and-rawdah-booking',
    category: 'Digital pilgrimage tools',
    readTime: '8 min read',
    title: 'Nusuk App Guide for East African Pilgrims: Permits, Timing, and Common Mistakes',
    description:
      'How Uganda and East Africa pilgrims can use Nusuk better for permit timing and visit planning, including common rebooking pitfalls.',
    image: imagery.guidance,
    keywords: [
      'nusuk app uganda',
      'rawdah booking east africa',
      'umrah permit timing',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Nusuk is now central to the pilgrimage experience for many travelers. Pilgrims who understand how permit timing works usually avoid the stress that others face on arrival.',
      'Ministry FAQ guidance emphasizes respecting permit times and using cancellation/rebooking correctly when plans change.',
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
          'Before travel, verify app install, account access, and device updates. Save screenshots and key identifiers in case network conditions are poor.',
          'The Ministry has also announced initiatives around improving Nusuk accessibility, which shows how critical the app has become in pilgrim operations.',
        ],
      },
      {
        heading: '3) Use a permit buffer, not exact-edge timing',
        paragraphs: [
          'Do not schedule your entire day with no cushion around permit times. Build transport and crowd buffers so worship is not rushed.',
          'This is especially important for elderly travelers and families moving as a unit.',
        ],
      },
    ],
    takeaway:
      'Treat Nusuk as an operational tool, not an afterthought. Permit timing discipline protects your entire journey flow.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
      {
        label: 'MOHU News: Nusuk app service activation',
        url: 'https://haj.gov.sa/en/Media-Center/Ministry-News/Ministry-of-Hajj-and-Umrah-activates-the-Nusuk-application-without-internet-consumption-to-serve-the',
      },
    ],
  },
  {
    slug: 'umrah-visa-pathways-uganda-east-africa',
    category: 'Visa and entry',
    readTime: '11 min read',
    title: 'Umrah Visa Pathways for Uganda and East Africa: What to Verify Before You Apply',
    description:
      'A clear pre-application checklist for Umrah visa planning, external agents, and service package expectations.',
    image: imagery.guidance,
    keywords: [
      'umrah visa uganda',
      'umrah visa east africa',
      'saudi visa bio umrah',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Visa problems usually start before the form is submitted: mismatched names, weak documentation, or misunderstandings about package-linked requirements.',
      'Saudi Ministry FAQ guidance notes that Umrah visas and related processes follow specific ministry and platform channels.',
    ],
    sections: [
      {
        heading: '1) Validate identity and document consistency',
        paragraphs: [
          'Check that your passport details, spellings, and date formats are consistent everywhere. Small inconsistencies can trigger avoidable delays.',
          'If you are applying as part of a family or group, verify every member before submission, not one-by-one over several days.',
        ],
      },
      {
        heading: '2) Know who is responsible for what',
        paragraphs: [
          'In many cases, outside-Kingdom pilgrims work through authorized pathways and linked service packages. Clarify responsibilities for submission, updates, and communication.',
          'Do not assume that paying means every step is complete. Ask for milestone confirmations.',
        ],
        checklist: [
          'Single point of responsibility identified',
          'Submission timeline documented in writing',
          'Escalation contact known if status is delayed',
        ],
      },
      {
        heading: '3) Protect your timeline with margin',
        paragraphs: [
          'Avoid risky timelines where visa finalization, health prep, and departure are tightly packed into the same short window.',
          'A stronger plan includes time for corrections, app setup, and final pre-departure briefings.',
        ],
      },
    ],
    takeaway:
      'A successful Umrah visa process is a planning process. Most delays are preventable when accountability is clear.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
      {
        label: 'Ministry of Foreign Affairs Visa Platform',
        url: 'https://visa.mofa.gov.sa/',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'hajj-and-umrah-health-requirements-east-africa',
    category: 'Health and safety',
    readTime: '12 min read',
    title: 'Hajj and Umrah Health Requirements for East African Pilgrims: What Matters Most',
    description:
      'A practical explanation of major health requirements and recommendations for pilgrims from Uganda and neighboring countries.',
    image: imagery.guidance,
    keywords: [
      'umrah vaccination uganda',
      'hajj health requirements east africa',
      'yellow fever saudi arabia uganda',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Health readiness is not a side task. It is part of pilgrimage readiness. Saudi health guidance sets mandatory and recommended protections for pilgrims and seasonal workers.',
      'Pilgrims from Uganda and East Africa should plan these requirements early, especially where country-specific vaccine rules apply.',
    ],
    sections: [
      {
        heading: '1) Understand required versus recommended vaccines',
        paragraphs: [
          'Saudi health documents for pilgrimage seasons outline required vaccines such as meningococcal protection and other conditions that may apply by traveler profile.',
          'The same guidance also includes recommended protections, including seasonal influenza and COVID-19 updates according to current health frameworks.',
        ],
      },
      {
        heading: '2) Yellow fever and country-based entry health controls',
        paragraphs: [
          'Official health requirements list countries where yellow fever vaccination proof is required for arrivals. Uganda appears in these country lists for yellow fever controls.',
          'This is one reason East African pilgrims should verify certificates well before travel week.',
        ],
        checklist: [
          'Vaccination certificates are complete and legible',
          'Vaccine type and date are clearly indicated',
          'Chronic-condition documentation is prepared in original packaging with medicines',
        ],
      },
      {
        heading: '3) Protect vulnerable pilgrims with a realistic pace plan',
        paragraphs: [
          'Saudi guidance also advises precautions around heat, respiratory protection in crowds, hydration, and chronic condition management.',
          'For elders and medically complex travelers, coordinate physician advice before departure and avoid overloading physically intense activities too early.',
        ],
      },
    ],
    takeaway:
      'For East African pilgrims, early vaccine and health-document readiness is one of the strongest predictors of a calmer journey.',
    sources: [
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
      {
        label: 'Hajj Health Requirements 1447H (2026) PDF',
        url: 'https://www.moh.gov.sa/HealthAwareness/Pilgrims-Health/Documents/Hajj-Health-Requirements-English-language.pdf',
      },
    ],
  },
  {
    slug: 'hajj-vs-umrah-for-uganda-pilgrims',
    category: 'Pilgrimage basics',
    readTime: '9 min read',
    title: 'Hajj vs Umrah for Uganda Pilgrims: Choosing the Right Path for This Year',
    description:
      'A clear comparison for Ugandan and East African Muslims deciding whether to prepare for Umrah now or plan toward Hajj.',
    image: imagery.guidance,
    keywords: [
      'hajj vs umrah uganda',
      'umrah or hajj east africa',
      'pilgrimage planning kampala',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Many households ask one question first: should we do Umrah now or keep preparing for Hajj? The answer depends on readiness, capacity, and timeline discipline.',
      'This article helps you make that decision honestly, without pressure.',
    ],
    sections: [
      {
        heading: '1) Compare commitment scope',
        paragraphs: [
          'Hajj has fixed seasonality and broader obligations. Umrah offers greater timing flexibility in many periods. Your current family and work realities should guide timing.',
          'When households force timelines they cannot sustain, stress rises and planning quality drops.',
        ],
      },
      {
        heading: '2) Compare preparation intensity',
        paragraphs: [
          'Both journeys demand preparation, but depth and timing constraints differ. Choose the path where your documentation, health readiness, and support network are strongest.',
          'For many first-time families, Umrah can be a practical entry point to pilgrimage operations and travel discipline.',
        ],
      },
      {
        heading: '3) Choose with intention and capability',
        paragraphs: [
          'A spiritually sincere decision is also a practical decision. You can preserve intention while choosing the timeline that best protects your wellbeing and obligations.',
          'Write your reasons and timeline, then review with your family and trusted advisors before booking.',
        ],
      },
    ],
    takeaway:
      'The right choice is the one that aligns worship intention with your real readiness, not public pressure.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah',
        url: 'https://haj.gov.sa/en/',
      },
      {
        label: 'Nusuk Hajj Platform',
        url: 'https://hajj.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'women-preparing-for-umrah-east-africa',
    category: 'Women and pilgrimage',
    readTime: '9 min read',
    title: 'Women Preparing for Umrah in East Africa: A Practical Planning Guide',
    description:
      'A planning-first guide for women in Uganda and East Africa covering safety, group alignment, and worship-focused travel rhythm.',
    image: imagery.guidance,
    keywords: [
      'women umrah uganda',
      'umrah planning for sisters east africa',
      'safe umrah travel women',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Women pilgrims often carry additional household and care responsibilities before they even begin travel prep. A strong plan acknowledges that reality.',
      'This article focuses on practical readiness, support structure, and calm movement during the journey.',
    ],
    sections: [
      {
        heading: '1) Build a support-first itinerary',
        paragraphs: [
          'Map who supports you before departure, during travel, and after return. Clarify who helps with children, medication routines, and local obligations at home.',
          'This prevents divided attention during worship.',
        ],
      },
      {
        heading: '2) Travel in coordinated communication structures',
        paragraphs: [
          'Whether you travel with family or a women-led group, define meeting points, lead contacts, and fallback plans for crowded periods.',
          'Clear communication structure is a safety tool, not just a convenience.',
        ],
      },
      {
        heading: '3) Protect energy and spiritual focus',
        paragraphs: [
          'Avoid over-planning every hour. Keep windows for rest, hydration, and emotional reset, especially in the first days.',
          'Long-term benefit comes from steady worship quality, not maximum physical exertion on every day.',
        ],
      },
    ],
    takeaway:
      'For women pilgrims, a support-aware plan protects both safety and worship quality.',
    sources: [
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
    ],
  },
  {
    slug: 'ramadan-umrah-from-uganda',
    category: 'Seasonal planning',
    readTime: '10 min read',
    title: 'Planning Ramadan Umrah From Uganda and East Africa',
    description:
      'A practical Ramadan Umrah planning framework for timing, crowd intensity, health pacing, and family coordination.',
    image: imagery.guidance,
    keywords: [
      'ramadan umrah uganda',
      'ramadan umrah east africa',
      'umrah busy season planning',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Ramadan Umrah can be deeply meaningful and logistically intense. Families who prepare only spiritually and ignore operational pressure often find the experience harder than expected.',
      'This guide helps you protect the spiritual objective while managing seasonality realities.',
    ],
    sections: [
      {
        heading: '1) Expect high demand and tighter movement windows',
        paragraphs: [
          'Popular periods require earlier decisions on travel windows, accommodation preference, and group flow strategy.',
          'Late decisions during high demand usually reduce your flexibility and increase stress.',
        ],
      },
      {
        heading: '2) Plan health with fasting realities',
        paragraphs: [
          'For some pilgrims, fasting plus travel plus crowd movement can be physically demanding. Build hydration and rest strategy with your personal health profile in mind.',
          'Elders and those with chronic conditions should use physician guidance and avoid unsustainable pace targets.',
        ],
      },
      {
        heading: '3) Keep worship goals realistic',
        paragraphs: [
          'Write a simple worship plan you can sustain in real conditions. Overscheduling every day can reduce khushu and increase fatigue.',
          'A balanced plan is usually the most spiritually fruitful one.',
        ],
      },
    ],
    takeaway:
      'Ramadan Umrah is best approached as both a spiritual opportunity and a high-intensity operations period.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah',
        url: 'https://haj.gov.sa/en/',
      },
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
    ],
  },
  {
    slug: 'senior-pilgrims-umrah-health-and-comfort',
    category: 'Elders and accessibility',
    readTime: '11 min read',
    title: 'Umrah for Elderly Pilgrims: Health, Comfort, and Dignified Pace',
    description:
      'A detailed preparation guide for elderly pilgrims in Uganda and East Africa, including medical readiness and mobility-aware pacing.',
    image: imagery.guidance,
    keywords: [
      'elderly umrah uganda',
      'senior pilgrim travel east africa',
      'umrah mobility planning',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Elderly pilgrims deserve planning that preserves dignity and comfort, not a one-size-fits-all schedule.',
      'Saudi health guidance highlights the importance of readiness for chronic conditions, medication handling, and crowd-related safety behaviors.',
    ],
    sections: [
      {
        heading: '1) Build a medical readiness file',
        paragraphs: [
          'Carry clear medical summaries, medication lists, and physician advice. Keep medicines in original packaging and ensure companions understand usage timing.',
          'This reduces confusion if care is needed during travel.',
        ],
      },
      {
        heading: '2) Use an energy-protection itinerary',
        paragraphs: [
          'Plan shorter activity blocks with deliberate rest windows. Elders often do better with consistent moderate pace than long bursts of intense movement.',
          'Family members should align around this pacing before departure.',
        ],
      },
      {
        heading: '3) Design crowd-safe movement habits',
        paragraphs: [
          'Agree on meeting points, assistance roles, and fallback actions in case of separation. Keep hydration and heat precautions visible in the daily plan.',
          'Simple routines improve confidence for both elders and caregivers.',
        ],
      },
    ],
    takeaway:
      'An elder-friendly Umrah plan is one that values safety, stamina, and dignity at every stage.',
    sources: [
      {
        label: 'Hajj Health Requirements 1447H (2026) PDF',
        url: 'https://www.moh.gov.sa/HealthAwareness/Pilgrims-Health/Documents/Hajj-Health-Requirements-English-language.pdf',
      },
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
    ],
  },
  {
    slug: 'east-africa-group-umrah-logistics',
    category: 'Group operations',
    readTime: '10 min read',
    title: 'East Africa Group Umrah Logistics: How to Coordinate Large Family and Community Groups',
    description:
      'A logistics playbook for multi-household and community Umrah groups from Uganda, Kenya, Tanzania, Rwanda, and South Sudan.',
    image: imagery.guidance,
    keywords: [
      'group umrah east africa',
      'community umrah uganda',
      'umrah logistics kampala',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Large groups can be a blessing and a burden. Without structure, communication gaps and timing friction multiply quickly.',
      'This article gives a practical coordination model for East African group departures.',
    ],
    sections: [
      {
        heading: '1) Assign clear group roles',
        paragraphs: [
          'Define a lead coordinator, documentation lead, health lead, and communications lead. One person cannot safely carry every function.',
          'Role clarity prevents confusion during fast decisions.',
        ],
      },
      {
        heading: '2) Standardize pre-departure checklists',
        paragraphs: [
          'Use one checklist format for all travelers so document checks, medication declarations, and contact mapping are consistent.',
          'Consistency reduces errors when group sizes grow.',
        ],
      },
      {
        heading: '3) Use escalation rules',
        paragraphs: [
          'Decide how issues are escalated: what is solved at subgroup level, what goes to the main coordinator, and what requires external support.',
          'This protects group morale and avoids last-minute decision paralysis.',
        ],
      },
    ],
    takeaway:
      'Successful group Umrah is built on role discipline, standardized checklists, and clear escalation paths.',
    sources: [
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
    ],
  },
  {
    slug: 'umrah-packing-list-uganda-east-africa',
    category: 'Travel readiness',
    readTime: '8 min read',
    title: 'Umrah Packing List for Uganda and East Africa Pilgrims',
    description:
      'A practical, low-stress packing structure for first-timers, family travelers, and elderly pilgrims.',
    image: imagery.guidance,
    keywords: [
      'umrah packing list uganda',
      'what to pack for umrah east africa',
      'umrah travel essentials kampala',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Packing stress often comes from overpacking uncertain items and forgetting essential ones.',
      'A better method is category-based packing with one carry-day system and one backup system.',
    ],
    sections: [
      {
        heading: '1) Pack by function, not by volume',
        paragraphs: [
          'Use categories: documents, ibadah essentials, health needs, daily wear, and mobility comfort. Then allocate each category to a defined space.',
          'This makes access easier when tired or in crowds.',
        ],
      },
      {
        heading: '2) Build a carry-day pouch',
        paragraphs: [
          'Create one small, always-with-you pouch for passport copies, emergency contacts, key medication, and basic essentials.',
          'If luggage is delayed or separated, this pouch protects your first 24 hours.',
        ],
        checklist: [
          'Copies of critical documents stored safely',
          'Medication schedule card included',
          'Emergency contact card in phone and physical form',
        ],
      },
      {
        heading: '3) Avoid fatigue packing',
        paragraphs: [
          'Finalize core packing at least 48 hours before travel day so you can verify calmly and sleep properly.',
          'Exhausted last-night packing creates preventable mistakes.',
        ],
      },
    ],
    takeaway:
      'The best Umrah packing plan is simple, categorized, and resilient when conditions are busy.',
    sources: [
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
    ],
  },
  {
    slug: 'hajj-preparation-timeline-uganda',
    category: 'Long-term planning',
    readTime: '12 min read',
    title: 'Hajj Preparation Timeline for Uganda and East Africa Pilgrims',
    description:
      'A long-range preparation timeline that helps pilgrims move steadily from intention to operational readiness for Hajj.',
    image: imagery.guidance,
    keywords: [
      'hajj preparation uganda',
      'hajj timeline east africa',
      'how to prepare for hajj from kampala',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Hajj preparation is stronger when built over months, not compressed into a late scramble.',
      'This timeline model helps East African pilgrims sequence spiritual, financial, health, and operational readiness.',
    ],
    sections: [
      {
        heading: '1) 9-12 months out: intention and financial architecture',
        paragraphs: [
          'Set intention, funding plan, and household alignment early. This period is about groundwork, not rushing into transactions.',
          'Document your expected constraints so future decisions remain realistic.',
        ],
      },
      {
        heading: '2) 4-8 months out: document and health milestones',
        paragraphs: [
          'Treat documentation and vaccine planning as timeline-critical workstreams. Delays here can affect all later stages.',
          'Use milestone reviews so nothing important is discovered too late.',
        ],
      },
      {
        heading: '3) Final window: movement, stamina, and communication discipline',
        paragraphs: [
          'As departure approaches, focus on practical routines: walking tolerance, medication consistency, communication plans, and travel-day execution.',
          'A calm final month usually reflects disciplined early months.',
        ],
      },
    ],
    takeaway:
      'Hajj readiness is cumulative. The pilgrims who start structured preparation early usually travel with greater calm and clarity.',
    sources: [
      {
        label: 'Ministry of Hajj and Umrah',
        url: 'https://haj.gov.sa/en/',
      },
      {
        label: 'Nusuk Hajj Platform',
        url: 'https://hajj.nusuk.sa/',
      },
      {
        label: 'Pilgrim Health Portal (MOH Saudi Arabia)',
        url: 'https://www.moh.gov.sa/en/HealthAwareness/Pilgrims-Health/Pages/default.aspx',
      },
    ],
  },
  {
    slug: 'transit-and-airport-guide-east-africa-pilgrims',
    category: 'Travel operations',
    readTime: '8 min read',
    title: 'Transit and Airport Guide for East African Umrah and Hajj Pilgrims',
    description:
      'How to reduce airport and transit stress when travelling from Uganda and neighboring East African countries.',
    image: imagery.guidance,
    keywords: [
      'umrah airport guide uganda',
      'hajj transit east africa',
      'pilgrim airport checklist',
    ],
    publishedAt: '03 Apr 2026',
    updatedAt: '03 Apr 2026',
    author: 'Al-Hilal Team',
    authorRole: 'Pilgrim Support and Guidance',
    intro: [
      'Airport stress can overshadow worship intention if travel-day systems are weak. Pilgrims from East Africa often face long movement days and multiple transition points.',
      'This guide offers a simple operations mindset for airport and transit readiness.',
    ],
    sections: [
      {
        heading: '1) Prepare your movement file',
        paragraphs: [
          'Keep itinerary snapshots, contacts, and essential documents easy to access in both print and phone form.',
          'Do not rely on one device battery state as your only source of critical details.',
        ],
      },
      {
        heading: '2) Use stage-based check-ins',
        paragraphs: [
          'Break travel day into stages: home departure, first airport process, transit point, and final arrival. Confirm each stage before moving mentally to the next.',
          'This lowers anxiety and catches issues early.',
        ],
      },
      {
        heading: '3) Prioritize vulnerable travelers',
        paragraphs: [
          'For elders, children, and medically sensitive travelers, assign specific companions and pace expectations during airport movement.',
          'Coordination protects dignity and prevents avoidable exhaustion.',
        ],
      },
    ],
    takeaway:
      'Pilgrimage travel day becomes manageable when it is broken into clear operational stages.',
    sources: [
      {
        label: 'Nusuk Platform',
        url: 'https://www.nusuk.sa/',
      },
      {
        label: 'Ministry of Hajj and Umrah FAQ',
        url: 'https://haj.gov.sa/en/FAQ',
      },
    ],
  },
]

export const finalCtaCopy = {
  eyebrow: 'Keep worship first',
  title:
    'Guided Umrah and Hajj with team of experts for Ugandans and East Africans to the holy mosques.',
  description:
    'Al Hilal helps Muslims travel for Umrah and Hajj with clearer preparation, family-aware care, and a team that stays close before departure, during travel, and after return.',
}

export const aboutIntro = {
  eyebrow: 'About Al Hilal',
  title: 'A professional team you can trust for Hajj and Umrah',
  description:
    'Al Hilal helps pilgrims book, prepare, and travel with clearer communication, reachable support, and practical care before departure, during travel, and after return.',
}

export const aboutReasons = [
  'Choose Al Hilal when you want one team to handle the full pilgrimage path with discipline, not guesswork. From first enquiry to return day, the process is built to protect worship and reduce travel stress.',
  'Pilgrims get clear package guidance before payment, practical planning support for families and sponsor-led bookings, and responsive communication when decisions need to be made quickly.',
  'You are not buying a ticket only. You are getting a professional operating team based in Uganda that coordinates visas, flights, accommodation, and on-ground support so your journey can stay focused on ibadah.',
]

export const aboutBiography = {
  eyebrow: 'Our story',
  title: 'Built to serve Allah\'s guests with clarity and discipline.',
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
}

export const aboutLeadSheikh = {
  eyebrow: 'Word from the lead sheikh',
  name: 'Sheikh Hamza Saidi',
  role: 'Lead Sheikh and Pilgrim Guidance, Al Hilal Travels',
  quote:
    'When Allah invites a servant to His House, that journey is an honour and a trust. Our responsibility is to help you arrive with a heart ready for ibadah—supported by clear guidance, timely preparation, and a team that remembers we are serving guests of the Most Merciful, not merely moving passengers.',
  supporting:
    'The outward steps of visa, travel, and lodging exist so the inward work—tawaf, sa\'i, du\'a, and presence with Allah—can remain undivided. We begin with your circumstances and readiness, not with pressure to book; if a path is not right for your family or your state, we say so and help you toward what is.',
  commitments: [
    'Sacred priority: what strengthens your worship and peace of mind is explained before talk turns only to schedules and payments.',
    'Walking with you: preparation that respects the rank of the journey, attentive support while you are away, and care that continues when you return.',
    'Unity at home: families and sponsors kept in one clear plan so trust is preserved and distractions are fewer.',
  ],
}

export const aboutValues: Principle[] = [
  {
    title: 'A reachable Kampala team',
    description:
      'Office: Kyato Complex, Suite B5-18, Bombo Road, Kampala, Uganda. Phone and WhatsApp: +256 700 773535.',
  },
  {
    title: 'Useful for first-timers and families',
    description:
      'The service plans for couples, family groups, elders, and sponsor-assisted bookings instead of treating them like unusual cases.',
  },
  {
    title: 'Clear guidance before payment',
    description:
      'Pilgrims should know what is included, what is not, and what still needs to be prepared before they commit money.',
  },
]

export const maqasidPrinciples: Principle[] = [
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
      'Make room for families, couples, elders, and group travel in the service itself, not only in the marketing language.',
  },
  {
    title: 'Mal',
    description:
      'Handle money honestly. Be disciplined about pricing, what is included, and what a pilgrim still needs to budget for.',
  },
]

export const bookingSteps = [
  {
    number: '01',
    title: 'Ask and compare',
    description:
      'Start with the departure you are considering, your travel window, and any family or sponsor questions that affect the booking.',
  },
  {
    number: '02',
    title: 'Confirm fit and documents',
    description:
      'Review the package path, rooming, payment expectations, passport status, and what still needs to be done before approval.',
  },
  {
    number: '03',
    title: 'Book and prepare',
    description:
      'Once the booking is approved, move into pre-departure guidance, active-trip updates, and the final travel briefings.',
  },
]

export const bookingChecks = [
  'Which journey fits your dates and household best.',
  'What is included, what is not, and what may still change.',
  'Which documents you need and when they are needed.',
  'Who Al Hilal should speak to if a sponsor or family member is involved.',
]

export const bookingFaqs: FaqItem[] = [
  {
    question: 'Do I need to be ready to pay before I enquire?',
    answer:
      'No. You can start with a question, a date window, or a family situation you need help working through before you book.',
  },
  {
    question: 'What should first-time pilgrims do first?',
    answer:
      'Start with dates, passport validity, budget honesty, and the kind of support you need before departure.',
  },
  {
    question: 'Can Al Hilal help families or sponsor-assisted bookings?',
    answer:
      'Yes. The team can talk through rooming, timing, sponsor-from-abroad questions, and who needs to approve what.',
  },
]

export const homeFaqs: FaqItem[] = [
  {
    question: 'How do I know which journey fits my dates best?',
    answer:
      'Start with your travel window and household needs, then ask on WhatsApp. The team can help you compare the timing, rooming, and support level before you decide.',
  },
  {
    question: 'Can Al Hilal help first-time pilgrims?',
    answer:
      'Yes. The service is intentionally structured for first-timers who need clearer guidance on documents, timing, budgeting, and what to expect before departure.',
  },
  {
    question: 'What if a family member abroad is paying?',
    answer:
      'Sponsor-assisted bookings are part of the service. Al Hilal helps clarify who needs to approve what and how the process should move.',
  },
  {
    question: 'Is WhatsApp really the main way to start?',
    answer:
      'Yes. WhatsApp is the fastest route for comparing departures, asking household questions, and getting clear next steps from the team.',
  },
  {
    question: 'Can families and couples be planned for properly?',
    answer:
      'Yes. Family groups, couples, elders, and first-time households are treated as normal planning needs, not exceptions.',
  },
]

export const journeyGeneralInformation: string[] = [
  'Journey availability can change as seats, permits, and supplier confirmations are updated. Always confirm current status with the team before making final personal commitments.',
  'Package pricing covers the published inclusions for that departure package. Personal shopping, extra meals, and other personal spending should be planned separately.',
  'Travel readiness matters as much as booking: confirm passport validity, traveler names, and your family or sponsor decision flow before your final confirmation.',
]

export const journeyGeneralFaqs: FaqItem[] = [
  {
    question: 'How do I start booking after choosing a journey?',
    answer:
      'Use the journey-specific package guidance, then message Al Hilal on WhatsApp with your preferred package code, traveler count, and timing so the team can confirm next steps.',
  },
  {
    question: 'Can I ask questions before I pay any deposit?',
    answer:
      'Yes. You can first clarify dates, rooming, pricing scope, and sponsor or family approvals before paying.',
  },
  {
    question: 'What details should I share when contacting the team?',
    answer:
      'Share the journey name, package code (if available), number of travelers, and your preferred travel window. This helps the team respond faster and with fewer follow-ups.',
  },
  {
    question: 'What if the journey I wanted is full or closed?',
    answer:
      'The team can advise the closest alternative departures and explain the practical tradeoffs in dates, price, and package inclusions.',
  },
]

export const footerCopy =
  'Al Hilal helps Muslims travel for Umrah and Hajj with clearer preparation, family-aware care, and a Kampala team that stays close before departure, during travel, and after return.'

export const legalContent = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy policy',
    description:
      'How Al Hilal handles enquiry details submitted through the public site.',
    sections: [
      {
        title: 'What information this site collects',
        paragraphs: [
          'The public site collects the contact details and planning context you submit through consultation or planning-guide forms.',
          'That may include your name, phone number, email address, preferred travel window, and notes about your travel needs.',
        ],
      },
      {
        title: 'Why Al Hilal collects it',
        paragraphs: [
          'The information is used to respond to your enquiry, understand what support you need, and follow up about journeys or planning guidance you requested.',
          'It is not collected to create a member account or a public profile.',
        ],
      },
      {
        title: 'How the data is handled',
        paragraphs: [
          "Lead submissions are handled through Al Hilal's internal systems and follow-up processes.",
          'If you want a record corrected or clarified, contact the team directly using the office contact details on the contact page.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Website terms',
    description:
      'What to expect from the information and enquiry flows on this public site.',
    sections: [
      {
        title: 'Information on the site',
        paragraphs: [
          'The website provides journey information, planning guidance, trust signals, and consultation paths for Umrah and Hajj enquiries.',
          'Journey prices, dates, package details, and support information can change when operational details change.',
        ],
      },
      {
        title: 'No automatic booking guarantee',
        paragraphs: [
          'Submitting a consultation or planning-guide request does not confirm a booking, reserve a place, or guarantee package availability.',
          'Booking status becomes real only after direct confirmation with the Al Hilal team.',
        ],
      },
      {
        title: 'Contact and next steps',
        paragraphs: [
          'If you need clarification on a published journey, use the contact routes on the site so the team can respond with the latest operational details.',
          'WhatsApp may be the fastest path for a short question, while the consultation form is better for more complex support needs.',
        ],
      },
    ],
  },
}

export function buildWhatsAppMessage(fields: {
  name?: string
  phone?: string
  email?: string
  window?: string
  help?: string
}) {
  const lines = [
    'Assalamu alaikum, I would like help from Al Hilal Travels.',
    fields.name ? `Name: ${fields.name}` : '',
    fields.phone ? `Phone / WhatsApp: ${fields.phone}` : '',
    fields.email ? `Email: ${fields.email}` : '',
    fields.window ? `Preferred travel window: ${fields.window}` : '',
    fields.help ? `Help needed: ${fields.help}` : '',
  ].filter(Boolean)

  return `${brand.whatsappUrl}?text=${encodeURIComponent(lines.join('\n'))}`
}
