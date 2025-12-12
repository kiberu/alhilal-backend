import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { seoConfig } from "@/lib/seo-config";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`
  },
  description: seoConfig.defaultDescription,
  keywords: [
    ...seoConfig.primaryKeywords,
    ...seoConfig.localKeywords
  ],
  authors: [{ name: "Al-Hilal Travels Uganda" }],
  creator: "Al-Hilal Travels Uganda",
  publisher: "Al-Hilal Travels Uganda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    shortcut: ["/favicon.png"],
    apple: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/apple-icon", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: seoConfig.siteUrl,
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [
      {
        // WhatsApp typically does not accept SVG for og:image
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Al-Hilal Travels Uganda - Umrah and Hajj Packages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    site: "@alhilal_travels",
    creator: "@alhilal_travels",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "lADDUOnr8diB2RxUJ5LmdTMP9uXRL-JOpRKS7RH05ig",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoConfig.organizationSchema),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {GA_MEASUREMENT_ID && <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
        {children}
      </body>
    </html>
  );
}
