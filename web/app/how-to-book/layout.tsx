import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "How to Book Umrah & Hajj from Uganda | Easy 3-Step Process",
  description: "Simple Umrah and Hajj booking process from Uganda. Learn about payment plans, required documents, visa processing timeline and booking steps. Contact Al-Hilal Kampala today.",
  keywords: [
    "how to book Umrah Uganda",
    "Umrah booking process Uganda",
    "Hajj booking steps Uganda",
    "Umrah payment plans Uganda",
    "required documents Umrah Uganda",
    "Umrah visa process Uganda",
    "book Hajj from Kampala",
    "Umrah booking Kampala"
  ],
  path: "/how-to-book"
});

export default function HowToBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

