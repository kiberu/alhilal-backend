"use client"

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faCheckCircle,
  faArrowRight,
  faPhone
} from "@fortawesome/free-solid-svg-icons"

const includedServices = [
  { label: "Return Ticket" },
  { label: "Visa Processing" },
  { label: "Umrah Services" },
  { label: "Accommodation" },
  { label: "Expert Guides" },
  { label: "Ground transport" },
  { label: "Historical Sites" },
  { label: "Haramain Train" },
  { label: "Haramain" }
]

export default function PackageHighlight() {
  return (
    <section className="relative border-b border-white/10 bg-primary py-16 md:py-20 lg:py-24 overflow-hidden">
      
      {/* Decorative background pattern - subtle */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Pricing */}
          <div className="space-y-8">
            <div>
              <p className="text-white/80 text-xs font-medium tracking-wide uppercase mb-3">
                AT ONLY
              </p>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                  6,790,000
                </span>
                <span className="text-xl md:text-2xl font-semibold text-white/90">
                  UGX
                </span>
              </div>
              <p className="text-gold text-lg md:text-xl font-semibold tracking-wide">
                45% OFF THIS RAMADHAN
              </p>
            </div>

            {/* CTA Button */}
            <Link href="/how-to-book">
              <button className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 hover:opacity-90 transition-all shadow-lg cursor-pointer">
                HOW TO BOOK
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </button>
            </Link>

            {/* Contact */}
            <div className="pt-6 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-gold-foreground" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Call/Whatsapp Us</p>
                  <a 
                    href="tel:+256700773535" 
                    className="text-white text-xl md:text-2xl font-black hover:text-gold transition-colors"
                  >
                    +256 700 773535
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6">
                <span className="text-gold">ABOUT THE UMRAH</span>
              </h2>

              <p className="text-white text-base md:text-lg font-medium mb-4">
                Al-Hilal is proud to present the <span className="text-gold">Ramadhan Umrah</span>, at a discounted price of 45% off this year.
              </p>

              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-3">
                Every detail of your Umrah is professionally handled so you can focus on your worship and reflection with peace and sincerity.
              </p>

              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                You will be taught and guided by experienced mentors throughout your pilgrimage.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {includedServices.map((service, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon 
                    icon={faCheckCircle} 
                    className="w-4 h-4 text-gold flex-shrink-0" 
                  />
                  <span className="text-white text-sm">
                    {service.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Download Link */}
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 text-gold font-bold text-base hover:opacity-80 transition-all uppercase tracking-wide cursor-pointer">
                DOWNLOAD FULL ITINERARY
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

