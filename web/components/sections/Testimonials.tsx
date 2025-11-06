"use client"

import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQuoteLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"

const testimonials = [
  {
    name: "Layla N",
    trip: "July Umrah",
    quote: "Such a wonderful experience! Al Hilal made the journey familiar even for the first timers. ",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjVwu4tXVtuX55JNT4sOcBiMB8flIyLZ7Y4Ph3OrkFEv1_t6xH68PA=w144-h144-p-rp-mo-br100" // Placeholder
  },
  {
    name: "Indra Muduuwa",
    trip: "July Umrah",
    quote: "And very hands own they made sure we did everything umrah entails both in Medina & Mecca",
    avatar: "/alhilal-assets/umrah-logo.svg"
  },
  {
    name: "Shamim Bahatisha",
    trip: "July Umrah",
    quote: "From the moment I booked my trip to the day I returned home, the company's team was professional, courteous, and attentive to every detail",
    avatar: "/alhilal-assets/umrah-logo.svg"
  }
]

export default function Testimonials() {
  return (
    <section className="relative bg-primary border-b border-white/10 py-16 md:py-20 lg:py-24 overflow-hidden">
      
      {/* Subtle decorative pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            What Our Clients Say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Avatar and Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-primary font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-primary font-semibold text-base">
                    {testimonial.trip}
                  </p>
                </div>
              </div>

              {/* Quote Icon */}
              <FontAwesomeIcon 
                icon={faQuoteLeft} 
                className="w-8 h-8 text-primary/20 mb-4" 
              />

              {/* Quote */}
              <p className="text-gray-900 text-base leading-relaxed mb-4">
                {testimonial.quote}
              </p>

              {/* Author */}
              <p className="text-primary font-semibold text-sm">
                {testimonial.name}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-white/90 text-sm md:text-base leading-relaxed">
            Our mission is to provide seamless pilgrimage experiences, combining trusted expert guidance, spiritual integrity, and efficiency, ensuring every client's journey is transformative, stress-free, and life-changing, all within your reach
          </p>
        </div>

        {/* CTA Link */}
        <div className="text-center">
          <a href="https://share.google/kB3aXZtEHPWmKWntA" target="_blank" rel="noopener noreferrer"> <button className="inline-flex items-center gap-2 text-gold font-semibold text-sm hover:text-gold/80 transition-colors uppercase tracking-wide">
            VIEW ALL REVIEWS
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
          </button></a>
        </div>

      </div>
    </section>
  )
}

