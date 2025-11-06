"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowRight,
  faBullseye,
  faEye,
  faHandshake,
  faGraduationCap,
  faClock,
  faStar,
  faPhone
} from "@fortawesome/free-solid-svg-icons"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-primary flex items-center justify-center overflow-hidden">
        <Navigation />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 pt-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
              About Al-Hilal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            About Al-Hilal
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
            Your trusted and licensed Hajj and Umrah operator dedicated to providing hustle-free, spiritually fulfilling, and professionally organized pilgrimage experiences.

            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <div className="bg-primary/5 rounded-2xl p-8 md:p-10 border-2 border-primary">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faBullseye} className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Our Mission</h2>
              </div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                Provide affordable, seamless pilgrimage experiences—combining trusted expert guidance, spiritual integrity, and efficiency—ensuring each client's journey is transformative and stress-free.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gold/5 rounded-2xl p-8 md:p-10 border-2 border-gold">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faEye} className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">Our Vision</h2>
              </div>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                To be Uganda's most trusted provider of world-class, spiritually centered pilgrimage experiences that transform lives and strengthen faith.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-8 text-center">
              Our Story
            </h2>
            
            <div className="space-y-6 text-gray-700 text-base md:text-lg leading-relaxed">
              <p>
                Al-Hilal Travels is a professional Hajj & Umrah operator dedicated to making your pilgrimage seamless, affordable, and spiritually fulfilling. We handle every detail—visa processing, flights, premium accommodation, ground transfers, and guided Ziyarah—so you can focus on your devotion while we manage the rest.
              </p>
              
              <p>
                We support every pilgrim from first-timers to seasoned travellers with clear information, visa and travel assistance, and spiritually grounded pilgrimages. Our team of experienced guides and scholars ensures that your journey is not just a trip, but a transformative spiritual experience.
              </p>
              
              <p>
                Based in Kampala, Uganda, we've helped hundreds of Muslims fulfil their sacred Umrah and Hajj Pilgrimages. Our goal is: making your worship our highest priority. Every package, every service, and every interaction is designed with your spiritual journey in mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: faHandshake,
                title: "Professionalism",
                description: "Scholar-led guidance, clear processes, and 24/7 support throughout your journey."
              },
              {
                icon: faClock,
                title: "Efficiency",
                description: "On-time visas, smooth transfers, and precise itineraries that respect your schedule."
              },
              {
                icon: faStar,
                title: "Premium Service",
                description: "5-star proximity to the Haramain and VIP transport options for your comfort."
              },
              {
                icon: faGraduationCap,
                title: "Customization",
                description: "Tailored packages for families, seniors, VIPs, and groups of all sizes."
              },
              {
                icon: faBullseye,
                title: "Spiritual Integrity",
                description: "Faith-centered planning and prayer-friendly schedules at every step."
              },
              {
                icon: faPhone,
                title: "24/7 Support",
                description: "Dedicated helpline and on-ground assistance whenever you need us."
              }
            ].map((pillar, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={pillar.icon} className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{pillar.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="py-16 md:py-20 lg:py-24 bg-primary">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
                Visit Our Office
              </h2>
              <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
                We're located in the heart of Kampala. Stop by to discuss your pilgrimage plans, ask questions, or simply learn more about our services.
              </p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">Office Address</p>
                  <p className="text-white text-lg font-semibold">
                    Kyato Complex, Suite B5-18<br />
                    Bombo Road, Kampala, Uganda
                  </p>
                </div>
                
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">Phone/WhatsApp</p>
                  <a 
                    href="tel:+256700773535"
                    className="text-white text-lg font-semibold hover:text-gold transition-colors"
                  >
                    +256 700 773535
                  </a>
                </div>
                
                <div>
                  <p className="text-white/70 text-sm font-medium mb-2">Email</p>
                  <a 
                    href="mailto:info@alhilaltravels.com"
                    className="text-white text-lg font-semibold hover:text-gold transition-colors"
                  >
                    info@alhilaltravels.com
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/trip-calendar" className="w-full">
                <Button variant="gold" size="lg" className="w-full">
                  View Trip Calendar
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full">
                <Button variant="outline" size="lg" className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                  Get in Touch
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

