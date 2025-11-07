import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "About Al-Hilal Travels | Licensed Umrah & Hajj Operator in Uganda",
  description: "Meet Uganda's trusted Hajj and Umrah operator. Based in Kampala, we've helped hundreds of Muslims fulfill their pilgrimage dreams with professional service and spiritual guidance.",
  keywords: [
    "about Al-Hilal Uganda",
    "licensed Hajj operator Uganda",
    "trusted Umrah agent Kampala",
    "Islamic travel company Uganda",
    "Hajj tour operator Kampala",
    "Umrah specialist Uganda",
    "pilgrimage company Kampala",
    "Muslim travel agency Uganda"
  ],
  path: "/who-we-are"
});

export default function WhoWeAreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

