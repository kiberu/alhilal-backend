"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowRight,
  faCalendarDays,
  faPlane,
  faCheckCircle,
  faTag,
  faUsers
} from "@fortawesome/free-solid-svg-icons"

const upcomingTrips = [
  {
    title: "Ramadan Umrah - Last 15 Days",
    dates: "Last 15 nights of Ramadan 2026",
    duration: "15 Days",
    price: "6,750,000",
    currency: "UGX",
    originalPrice: "12,300,000",
    discount: "45%",
    category: "Featured",
    featured: true,
    description: "Experience the blessed last 15 nights of Ramadan in the holy cities",
    includes: [
      "Return air tickets",
      "Visa processing",
      "Haram-proximity hotels",
      "Ground transfers",
      "Guided Ziyarah",
      "Scholar support",
      "On-ground team"
    ],
    seatsLeft: 100
  },
  {
    title: "Umrah Package - September 2025",
    dates: "18-27 September 2025",
    duration: "10 Days",
    price: "1,540 - 1,950",
    currency: "USD",
    category: "Standard",
    featured: false,
    description: "Affordable Umrah package with comprehensive services",
    includes: [
      "Return flights",
      "Visa processing",
      "4-star accommodation",
      "Airport transfers",
      "Ziyarah tours",
      "Group support"
    ],
    seatsLeft: 25
  },
  
  {
    title: "Umrah + Dubai - December 2025",
    dates: "Late December 2025",
    duration: "15 Days",
    price: "1,800 - 2,680",
    currency: "USD",
    category: "Premium",
    featured: false,
    description: "Combined spiritual journey and Dubai city experience",
    includes: [
      "Return flights",
      "Visa processing",
      "Hotels in Makkah, Madinah & Dubai",
      "All transfers",
      "Ziyarah + Dubai tour",
      "Enhanced support"
    ],
    seatsLeft: 20
  },
  {
    title: "Ramadan Umrah - Early 10 Days",
    dates: "First 10 days of Ramadan 2026",
    duration: "10 Days",
    price: "1,756",
    currency: "USD",
    category: "Ramadan Special",
    featured: false,
    description: "Start your Ramadan in the holy cities with this special package",
    includes: [
      "Return flights",
      "Visa processing",
      "Ramadan iftar included",
      "Hotels near Haram",
      "Ground transport",
      "Scholar guidance"
    ],
    seatsLeft: 30
  },
  {
    title: "Hajj 2026",
    dates: "Dhul Hijjah 1447 (June 2026)",
    duration: "21 Days",
    price: "5,920",
    currency: "USD",
    category: "Hajj",
    featured: true,
    description: "Complete Hajj package with experienced guides and full logistics",
    includes: [
      "Return flights",
      "Saudi visa",
      "Makkah, Mina, Arafat accommodation",
      "All ground transport",
      "Full Hajj guidance",
      "24/7 support team",
      "Pre-Hajj training"
    ],
    seatsLeft: 45
  }
]

export default function TripCalendarPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-primary flex items-center justify-center overflow-hidden">
        <Navigation />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 pt-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
              Upcoming Journeys
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Trip Calendar
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
              Browse our upcoming Umrah and Hajj packages. Find the perfect dates for your spiritual journey.
            </p>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8">
            {upcomingTrips.map((trip, index) => (
              <div 
                key={index}
                className={`rounded-2xl overflow-hidden ${
                  trip.featured 
                    ? 'text-white border-4 border-gold' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                style={trip.featured ? {
                  background: 'linear-gradient(to bottom right, hsl(338, 93%, 30%), hsl(338, 93%, 35%))'
                } : undefined}
              >
                <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8">
                  {/* Left: Trip Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        {trip.featured && (
                          <span className="inline-block bg-gold text-black text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase">
                            Featured Package
                          </span>
                        )}
                        <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${trip.featured ? 'text-white' : 'text-primary'}`}>
                          {trip.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`flex items-center gap-2 ${trip.featured ? 'text-white/90' : 'text-gray-600'}`}>
                            <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4" />
                            {trip.dates}
                          </span>
                          <span className={`flex items-center gap-2 ${trip.featured ? 'text-white/90' : 'text-gray-600'}`}>
                            <FontAwesomeIcon icon={faPlane} className="w-4 h-4" />
                            {trip.duration}
                          </span>
                        </div>
                      </div>

                      {trip.seatsLeft <= 20 && (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          trip.featured 
                            ? 'bg-white/20 text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
                          Only {trip.seatsLeft} seats left
                        </span>
                      )}
                    </div>

                    <p className={`${trip.featured ? 'text-white/90' : 'text-gray-700'} text-base leading-relaxed`}>
                      {trip.description}
                    </p>

                    {/* Package Includes */}
                    <div>
                      <h3 className={`text-sm font-semibold mb-3 uppercase ${trip.featured ? 'text-white' : 'text-gray-900'}`}>
                        Package Includes:
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {trip.includes.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <FontAwesomeIcon 
                              icon={faCheckCircle} 
                              className={`w-3.5 h-3.5 flex-shrink-0 ${trip.featured ? 'text-gold' : 'text-primary'}`} 
                            />
                            <span className={`text-sm ${trip.featured ? 'text-white' : 'text-gray-700'}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & CTA */}
                  <div className="flex flex-col justify-between">
                    <div className={`${trip.featured ? 'bg-white/10' : 'bg-white'} rounded-xl p-6 border ${trip.featured ? 'border-white/20' : 'border-gray-200'}`}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${trip.featured ? 'text-white/70' : 'text-gray-600'}`}>
                        Starting From
                      </p>
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl md:text-4xl font-bold ${trip.featured ? 'text-white' : 'text-primary'}`}>
                            {trip.price}
                          </span>
                          <span className={`text-lg font-semibold ${trip.featured ? 'text-white/90' : 'text-gray-700'}`}>
                            {trip.currency}
                          </span>
                        </div>
                        {trip.originalPrice && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm line-through ${trip.featured ? 'text-white/60' : 'text-gray-500'}`}>
                              {trip.originalPrice} {trip.currency}
                            </span>
                            {trip.discount && (
                              <span className="inline-flex items-center gap-1 bg-gold text-black text-xs font-bold px-2 py-1 rounded">
                                <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                                {trip.discount} OFF
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className={`text-xs ${trip.featured ? 'text-white/70' : 'text-gray-600'} mb-4`}>
                        *Final pricing confirmed at booking
                      </p>
                      <Link href="/how-to-book" className="block w-full">
                        <Button 
                          variant={trip.featured ? "gold" : "default"}
                          size="lg"
                          className="w-full"
                        >
                          Reserve Your Spot
                          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Can't Find the Right Package?
            </h2>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8">
              We offer customized packages tailored to your specific needs, dates, and budget. Contact us to discuss your ideal pilgrimage.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button variant="default" size="lg">
                  Contact Us
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg">
                  View All Services
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

