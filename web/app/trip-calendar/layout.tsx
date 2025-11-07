import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Umrah & Hajj Trip Calendar 2025-2026 | Available Packages Uganda",
  description: "View our upcoming Umrah and Hajj trips from Uganda. Ramadan Umrah 2026, Hajj 2026 packages, special rates and early bird discounts. Book your dates from Kampala.",
  keywords: [
    "Umrah calendar Uganda 2026",
    "Hajj dates 2026 Uganda",
    "Ramadan Umrah 2026 Uganda",
    "upcoming Umrah trips Uganda",
    "Umrah package prices Uganda",
    "Hajj booking dates Kampala",
    "Umrah departure dates Entebbe",
    "Islamic calendar trips Uganda"
  ],
  path: "/trip-calendar"
});

export default function TripCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

