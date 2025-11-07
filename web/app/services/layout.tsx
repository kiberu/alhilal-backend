import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Umrah & Hajj Services Uganda | Complete Pilgrimage Packages",
  description: "Comprehensive Umrah and Hajj services in Uganda: visa processing, flights, 5-star hotels near Haram, Ziyarah tours, group bookings & VIP services. Licensed tour operator in Kampala.",
  keywords: [
    "Umrah services Uganda",
    "Hajj services Uganda",
    "Umrah package inclusions",
    "Hajj package features",
    "Ziyarah tours Uganda",
    "group Umrah booking Uganda",
    "VIP Umrah services Kampala",
    "visa processing Uganda",
    "Islamic travel services Kampala"
  ],
  path: "/services"
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

