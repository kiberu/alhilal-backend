import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy | Al-Hilal Travels Uganda",
  description: "Privacy policy for Al-Hilal Travels Uganda. Learn how we protect your personal information and data when booking Umrah and Hajj packages.",
  keywords: [
    "privacy policy",
    "data protection",
    "Al-Hilal privacy"
  ],
  path: "/privacy"
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

