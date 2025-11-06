"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faKaaba,
  faMapLocationDot,
  faUserGroup,
  faStar,
  faPlane,
  faPassport,
  faHotel,
  faArrowRight,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons"

const services = [
  {
    title: "Umrah Packages",
    icon: faKaaba,
    description: "Comprehensive Umrah experiences tailored to your needs and budget.",
    features: [
      "Visa processing",
      "Return flights",
      "Hotel near Haram",
      "Ground transfers",
      "Guided Ziyarah",
      "On-ground support"
    ],
    options: [
      "Standard Package",
      "Family Package",
      "VIP (private transport, premium rooms)",
      "Short-stay (4–6 days)",
      "Multi-city (e.g., Umrah + Dubai)"
    ]
  },
  {
    title: "Hajj Packages",
    icon: faKaaba,
    description: "Complete Hajj pilgrimage services with expert guidance every step of the way.",
    features: [
      "Visa processing",
      "Return flights",
      "Mina/Arafat logistics",
      "Makkah/Madinah hotels",
      "Internal transport",
      "Guided Ziyarah"
    ],
    options: [
      "Scholar guidance throughout",
      "Dedicated support staff",
      "Room upgrades available",
      "Wheelchair assistance",
      "Private group escorts"
    ]
  },
  {
    title: "Ziyarah Tours",
    icon: faMapLocationDot,
    description: "Guided visits to historic sites in Makkah and Madinah.",
    features: [
      "Historic Islamic sites",
      "Expert scholar guidance",
      "Context and history",
      "Spiritual insights",
      "Group or private tours",
      "Flexible scheduling"
    ],
    options: [
      "Cave of Hira",
      "Jabal al-Nour",
      "Masjid Quba",
      "Uhud Mountain",
      "Qiblatayn Mosque",
      "Seven Mosques"
    ]
  },
  {
    title: "Group & Community Bookings",
    icon: faUserGroup,
    description: "Special packages for groups, communities, and organizations.",
    features: [
      "Discounted group rates",
      "Dedicated coordinator",
      "Customized schedules",
      "Group transportation",
      "Private sessions",
      "Community bonding"
    ],
    options: [
      "Mosque groups",
      "Family reunions",
      "Corporate groups",
      "Student groups",
      "Special occasions",
      "Customized itineraries"
    ]
  },
  {
    title: "VIP & Concierge Services",
    icon: faStar,
    description: "Premium, personalized pilgrimage experiences with exclusive amenities.",
    features: [
      "Private airport transfers",
      "Premium accommodations",
      "Bespoke itineraries",
      "On-call liaison",
      "VIP lounge access",
      "Priority services"
    ],
    options: [
      "5-star hotels",
      "Haram view rooms",
      "Private vehicles",
      "Personal assistant",
      "Exclusive dining",
      "Spa & wellness"
    ]
  },
  {
    title: "Travel Facilitation",
    icon: faPlane,
    description: "Complete travel logistics and documentation support.",
    features: [
      "Visa advisory & processing",
      "Flight booking & optimization",
      "Hotel reservations",
      "Travel insurance guidance",
      "Documentation assistance",
      "24/7 support"
    ],
    options: [
      "Passport guidance",
      "Vaccination requirements",
      "Health certificates",
      "Travel advisories",
      "Currency exchange",
      "Emergency contacts"
    ]
  }
]

export default function ServicesPage() {
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
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
              What We Offer
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Our Services
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              From visa processing to spiritual guidance, we handle every aspect of your sacred journey with professionalism, care, and devotion.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 md:gap-10 lg:gap-12">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Service Icon & Title */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={service.icon} className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                      {service.title}
                    </h2>
                  </div>
                  
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/trip-calendar">
                    <Button variant="default" size="default">
                      View Packages
                      <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Options List */}
                <div className={`bg-gray-50 rounded-2xl p-8 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <h3 className="text-xl font-bold text-primary mb-4">Available Options:</h3>
                  <ul className="space-y-3">
                    {service.options.map((option, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 lg:py-24 bg-primary">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose Al-Hilal
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
              Your trusted partner for a seamless and spiritually fulfilling pilgrimage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Trusted Experts",
                description: "Scholar-led support and experienced coordinators guide every step of your journey."
              },
              {
                title: "Seamless Logistics",
                description: "From visa to Ziyarah—everything planned end-to-end with precision."
              },
              {
                title: "Affordable Luxury",
                description: "Premium comfort and service within reach of every pilgrim."
              },
              {
                title: "Personalization",
                description: "Family, senior, VIP, and group-friendly customized itineraries."
              },
              {
                title: "24/7 Care",
                description: "Dedicated helpline and on-ground assistance whenever you need it."
              },
              {
                title: "Spiritual Focus",
                description: "Prayer-friendly schedules and faith-centered planning throughout."
              }
            ].map((reason, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg font-bold text-gold mb-3">{reason.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/contact">
              <Button variant="gold" size="lg">
                Get Started Today
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

