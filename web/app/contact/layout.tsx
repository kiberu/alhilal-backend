import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Al-Hilal Travels Uganda | Umrah & Hajj Inquiries Kampala",
  description: "Contact Al-Hilal Travels for Umrah and Hajj inquiries. Office in Kampala, Bombo Road. Call +256 700 773535, WhatsApp, or visit us for personalized pilgrimage consultation.",
  keywords: [
    "contact Umrah agent Uganda",
    "Hajj operator Kampala contact",
    "Al-Hilal Travels phone number",
    "Umrah inquiry Uganda",
    "Hajj booking Kampala office",
    "Islamic travel agency Kampala address",
    "Umrah consultation Uganda",
    "Bombo Road travel agency"
  ],
  path: "/contact"
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

