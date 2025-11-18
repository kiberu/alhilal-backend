import Hero from "@/components/sections/Hero";
import PackageHighlight from "@/components/sections/PackageHighlight";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import WhatsAppChannel from "@/components/sections/WhatsAppChannel";
import Footer from "@/components/sections/Footer";
import { generatePageMetadata } from "@/lib/seo-config";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Al-Hilal Travels Uganda | Affordable Umrah & Hajj Packages from Kampala",
  description: "Licensed Umrah and Hajj tour operator in Uganda. Book affordable Ramadan Umrah packages, complete Hajj services, visa processing & 5-star hotels near Haram. Call +256 700 773535",
  keywords: [
    "Umrah packages Uganda",
    "Hajj packages Uganda",
    "Ramadan Umrah 2026 Uganda",
    "affordable Umrah from Kampala",
    "licensed Hajj agent Uganda",
    "Umrah visa processing Uganda",
    "Makkah packages Kampala",
    "Islamic travel Uganda"
  ],
  // Root path - will generate https://alhilaltravels.com as canonical
  path: "/"
});

export default function Home() {
    return (
      <main className="min-h-screen">
        <Hero />
        <PackageHighlight />
        <About />
        <Testimonials />
        <WhatsAppChannel />
        <Footer />
      </main>
    );
}
