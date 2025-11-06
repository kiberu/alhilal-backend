"use client"

import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowRight,
  faLocationDot
} from "@fortawesome/free-solid-svg-icons"

export default function About() {
  return (
    <section className="relative bg-white py-0 overflow-hidden">
      <div className="grid lg:grid-cols-2">
        
        {/* Left Column - Image */}
        <div className="relative h-[400px] md:h-[500px] lg:h-auto lg:min-h-[700px]">
          <Image
            src="/alhilal-assets/about-image.jpg"
            alt="Pilgrims at Masjid al-Haram"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Right Column - Content */}
        <div className="relative bg-primary px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 flex flex-col justify-center">
          
          {/* Logo */}
          <div className="mb-8">
            <div className="relative w-40 h-16 md:w-48 md:h-20">
              <Image
                src="/alhilal-assets/LOGO-landscape.svg"
                alt="Al-Hilal Logo"
                fill
                className="object-contain object-left brightness-0 invert"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gold mb-6 tracking-tight">
            ABOUT AL-HILAL
          </h2>

          {/* Description */}
          <div className="space-y-4 mb-8">
            <p className="text-white text-base leading-relaxed font-medium">
              Al-hilal is a trusted and licensed Hajj and Umrah operator dedicated to providing hustle-free, spiritually fulfilling, and professionally organized pilgrimage experiences.
            </p>

            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              We support every pilgrim from first-timers to seasoned travellers with clear information, visa and travel assistance, and spiritually grounded pilgrimages.
            </p>

            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              We are based in Kampala, Uganda and we've helped hundreds of Muslims fulfil their sacred Umrah and Hajj Pilgrimages while always with the goal of making your worship our highest priority.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/trip-calendar">
              <button className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-5 py-3 hover:opacity-90 transition-all shadow-lg cursor-pointer">
                VIEW TRIP CALENDAR
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link href="/who-we-are">
              <button className="inline-flex items-center gap-2 border-2 border-gold text-gold font-semibold text-sm px-5 py-3 hover:opacity-80 transition-all cursor-pointer">
                MORE ABOUT US
              </button>
            </Link>
          </div>

          {/* Location */}
          <div className="pt-8 border-t border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5 text-gold-foreground" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium mb-1">Visit Us</p>
                <p className="text-white text-base md:text-lg font-semibold">
                  Kyato Complex B5-18<br />
                  Bombo Road
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

