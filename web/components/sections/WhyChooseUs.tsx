"use client"

import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faAward,
  faUsers,
  faShieldHeart,
  faHandshake
} from "@fortawesome/free-solid-svg-icons"

const stats = [
  {
    number: "15+",
    label: "Years Experience"
  },
  {
    number: "5000+",
    label: "Happy Pilgrims"
  },
  {
    number: "100%",
    label: "Satisfaction Rate"
  },
  {
    number: "24/7",
    label: "Support Available"
  }
]

const reasons = [
  {
    icon: faAward,
    title: "Licensed & Certified",
    description: "Fully licensed by Uganda Tourism Board and certified by Saudi Ministry of Hajj"
  },
  {
    icon: faUsers,
    title: "Small Groups",
    description: "Maximum 50 pilgrims per group ensuring personalized attention and care"
  },
  {
    icon: faShieldHeart,
    title: "Comprehensive Insurance",
    description: "Full travel and health insurance coverage throughout your journey"
  },
  {
    icon: faHandshake,
    title: "Trusted Partner",
    description: "Partnered with leading hotels and service providers in Saudi Arabia"
  }
]

export default function WhyChooseUs() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/alhilal-assets/deco-border.png"
          alt="Decoration"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
            <span className="text-primary text-sm font-bold tracking-wide uppercase">Our Promise</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Why Choose Al-Hilal
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Your trusted partner for spiritual journeys with over a decade of excellence
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10"
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-semibold text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="flex gap-4 lg:gap-6"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={reason.icon} className="w-7 h-7 text-gold-foreground" />
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 px-6 py-3 rounded-full">
            <FontAwesomeIcon icon={faShieldHeart} className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-900">
              Verified & Trusted by 5000+ Pilgrims
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}

