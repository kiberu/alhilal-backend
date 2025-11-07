/**
 * SEO Configuration for Al-Hilal Travels
 * Optimized for Ugandan Umrah and Hajj Market
 */

export const seoConfig = {
  siteName: "Al-Hilal Hajj and Umrah Services",
  siteUrl: "https://alhilaltravels.com",
  defaultTitle: "Al-Hilal Hajj and Umrah Services Uganda | Licensed Umrah & Hajj Tour Operator",
  defaultDescription: "Licensed Hajj and Umrah tour operator in Uganda. Affordable Umrah packages from Kampala, expert visa processing, 5-star accommodation near Haram. Book your pilgrimage today.",
  businessName: "Al-Hilal Travels Uganda",
  contactPhone: "+256700773535",
  contactEmail: "info@alhilaltravels.com",
  address: {
    street: "Kyato Complex, Suite B5-18, Bombo Road",
    city: "Kampala",
    country: "Uganda",
    postalCode: ""
  },
  
  // Primary keywords targeting Ugandan market
  primaryKeywords: [
    "Umrah packages Uganda",
    "Hajj packages Uganda",
    "Umrah from Kampala",
    "Hajj from Kampala",
    "Umrah tour operator Uganda",
    "Hajj tour operator Uganda",
    "licensed Umrah agent Uganda",
    "Ramadan Umrah Uganda",
    "Makkah packages Uganda",
    "Madinah packages Uganda",
    "Saudi Arabia visa Uganda",
    "Islamic travel Uganda",
    "Muslim pilgrimage Uganda",
    "Umrah booking Kampala",
    "Hajj booking Kampala",
    "affordable Umrah packages",
    "Umrah visa processing Uganda",
    "Hajj visa processing Uganda",
    "Ziyarah tours Uganda",
    "5 pillar Hajj Uganda"
  ],
  
  // Long-tail keywords for specific searches
  longTailKeywords: [
    "best Umrah packages from Uganda",
    "cheap Umrah packages Kampala",
    "Ramadan Umrah packages Uganda 2026",
    "Hajj packages Uganda 2026",
    "Umrah and Hajj tour operator Kampala",
    "licensed Hajj agent in Uganda",
    "how to book Umrah from Uganda",
    "Umrah package prices Uganda",
    "family Umrah packages Uganda",
    "VIP Umrah packages Kampala",
    "group Umrah booking Uganda",
    "Umrah with guided tours Uganda",
    "hotels near Haram Uganda packages",
    "Umrah visa requirements for Ugandans",
    "Hajj training Uganda",
    "Islamic travel agency Kampala",
    "Umrah flights from Entebbe",
    "complete Umrah package Uganda"
  ],
  
  // Local search terms
  localKeywords: [
    "Umrah travel agency Kampala",
    "Hajj services Kampala Uganda",
    "Islamic tours Kampala",
    "Umrah operator near me Uganda",
    "best Umrah agent Kampala",
    "Bombo Road travel agency",
    "Muslim travel services Uganda",
    "pilgrimage services Kampala"
  ],
  
  // Social media
  social: {
    facebook: "https://www.facebook.com/61554545522475",
    twitter: "https://x.com/alhilal_travels",
    instagram: "https://www.instagram.com/al_hilal_travels/",
    tiktok: "https://www.tiktok.com/@alhilaltravels",
    whatsapp: "https://wa.me/256700773535"
  },
  
  // Organization Schema
  organizationSchema: {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Al-Hilal Travels Uganda",
    "alternateName": "Al-Hilal Hajj and Umrah Services",
    "description": "Licensed Hajj and Umrah tour operator in Uganda providing comprehensive pilgrimage packages, visa processing, and spiritual guidance.",
    "url": "https://alhilaltravels.com",
    "logo": "https://alhilaltravels.com/alhilal-assets/LOGO-landscape.svg",
    "telephone": "+256700773535",
    "email": "info@alhilaltravels.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kyato Complex, Suite B5-18, Bombo Road",
      "addressLocality": "Kampala",
      "addressCountry": "UG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.3476",
      "longitude": "32.5825"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Uganda"
    },
    "serviceType": [
      "Umrah Packages",
      "Hajj Packages",
      "Visa Processing",
      "Islamic Tours",
      "Ziyarah Tours",
      "Group Bookings",
      "VIP Pilgrimage Services"
    ],
    "priceRange": "$$",
    "openingHours": "Mo-Fr 09:00-18:00, Sa 10:00-16:00",
    "sameAs": [
      "https://www.facebook.com/61554545522475",
      "https://x.com/alhilal_travels",
      "https://www.instagram.com/al_hilal_travels/",
      "https://www.tiktok.com/@alhilaltravels"
    ]
  }
}

export const generatePageMetadata = (page: {
  title: string
  description: string
  keywords?: string[]
  path?: string
  type?: string
  images?: string[]
}) => {
  const url = page.path ? `${seoConfig.siteUrl}${page.path}` : seoConfig.siteUrl
  const allKeywords = [
    ...(page.keywords || []),
    ...seoConfig.primaryKeywords.slice(0, 10)
  ]
  
  return {
    title: page.title,
    description: page.description,
    keywords: allKeywords,
    openGraph: {
      title: page.title,
      description: page.description,
      url: url,
      siteName: seoConfig.siteName,
      locale: "en_UG",
      type: page.type || "website",
      images: page.images || [
        {
          url: `${seoConfig.siteUrl}/alhilal-assets/LOGO-landscape.svg`,
          width: 1200,
          height: 630,
          alt: "Al-Hilal Travels Uganda"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      site: "@alhilal_travels",
      creator: "@alhilal_travels",
      images: page.images || [`${seoConfig.siteUrl}/alhilal-assets/LOGO-landscape.svg`]
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    }
  }
}

