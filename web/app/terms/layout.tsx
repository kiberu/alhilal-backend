import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms & Conditions | Al-Hilal Travels Uganda",
  description: "Terms and conditions for booking Umrah and Hajj packages with Al-Hilal Travels Uganda. Read our policies and guidelines.",
  keywords: [
    "terms and conditions",
    "booking terms",
    "Al-Hilal terms"
  ],
  path: "/terms"
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

