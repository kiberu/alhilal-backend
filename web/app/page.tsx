import Hero from "@/components/sections/Hero";
import PackageHighlight from "@/components/sections/PackageHighlight";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import WhatsAppChannel from "@/components/sections/WhatsAppChannel";
import Footer from "@/components/sections/Footer";

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
