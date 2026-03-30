import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { JsonLd } from "@/components/site/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import "./globals.css";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";
import { seoConfig } from "@/lib/seo-config";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  keywords: [...seoConfig.primaryKeywords, ...seoConfig.localKeywords],
  authors: [{ name: seoConfig.businessName }],
  creator: seoConfig.businessName,
  publisher: seoConfig.businessName,
  alternates: {
    canonical: seoConfig.siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.png"],
    apple: ["/apple-icon"],
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    siteName: seoConfig.siteName,
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${seoConfig.siteName} open graph image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: ["/opengraph-image"],
    creator: "@alhilal_travels",
    site: "@alhilal_travels",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <JsonLd data={seoConfig.organizationSchema} />
        {GA_MEASUREMENT_ID ? <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} /> : null}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
