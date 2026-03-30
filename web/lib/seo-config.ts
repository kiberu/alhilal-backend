import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const seoConfig = {
  siteName: siteConfig.siteName,
  siteUrl: siteConfig.siteUrl,
  defaultTitle: `${siteConfig.siteName} | Umrah and Hajj from Kampala`,
  defaultDescription: siteConfig.defaultDescription,
  businessName: siteConfig.businessName,
  contactPhone: siteConfig.phoneDisplay,
  contactEmail: siteConfig.email,
  address: {
    street: "Kyato Complex, Suite B5-18, Bombo Road",
    city: "Kampala",
    country: "Uganda",
    postalCode: "",
  },
  primaryKeywords: [
    "Umrah packages Uganda",
    "Hajj packages Uganda",
    "Umrah from Kampala",
    "guided Umrah Uganda",
    "Hajj from Kampala",
    "pilgrimage planning Uganda",
    "Umrah family travel Uganda",
    "family Umrah Uganda",
    "first time Umrah Uganda",
    "July Umrah Uganda",
    "licensed Umrah operator Uganda",
  ],
  localKeywords: [
    "Kampala Umrah operator",
    "Bombo Road pilgrimage services",
    "Uganda Hajj and Umrah agency",
    "WhatsApp Umrah consultation Kampala",
  ],
  social: siteConfig.social,
  organizationSchema: {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.businessName,
    alternateName: "Al Hilal Hajj and Umrah Services",
    description: siteConfig.defaultDescription,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/alhilal-assets/LOGO-landscape.svg`,
    telephone: siteConfig.phoneDisplay,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kyato Complex, Suite B5-18, Bombo Road",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
    areaServed: {
      "@type": "Country",
      name: "Uganda",
    },
    sameAs: Object.values(siteConfig.social),
    serviceType: [
      "Umrah journeys",
      "Hajj journeys",
      "Pilgrimage planning",
      "Family pilgrimage support",
      "Sacred travel consultation",
    ],
  },
};

export function buildCanonicalUrl(path = "/") {
  if (!path || path === "/") {
    return siteConfig.siteUrl;
  }

  return `${siteConfig.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function generatePageMetadata(page: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  images?: Array<
    | string
    | {
        url: string;
        width?: number;
        height?: number;
        alt?: string;
      }
  >;
  type?: "website" | "article";
}): Metadata {
  const canonical = buildCanonicalUrl(page.path);
  const normalizedImages = (page.images?.length ? page.images : [siteConfig.defaultOgImage]).map((image) =>
    typeof image === "string"
      ? { url: image, width: 1200, height: 630, alt: page.title }
      : image,
  );

  return {
    title: page.title,
    description: page.description,
    keywords: [...(page.keywords ?? []), ...seoConfig.primaryKeywords, ...seoConfig.localKeywords],
    alternates: {
      canonical,
    },
    openGraph: {
      type: page.type ?? "website",
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: siteConfig.siteName,
      locale: "en_UG",
      images: normalizedImages,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: normalizedImages.map((image) => image.url),
      creator: "@alhilal_travels",
      site: "@alhilal_travels",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
