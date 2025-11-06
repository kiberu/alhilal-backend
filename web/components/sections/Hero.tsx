"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "./Navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faKaaba, 
  faTag, 
  faClock,
  faArrowRight,
  faStar,
  faPhone
} from "@fortawesome/free-solid-svg-icons"

export default function Hero() {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (backgroundRef.current) {
        const scrolled = window.scrollY
        const parallaxSpeed = 0.5
        backgroundRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(1.1)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      {/* Navigation - Overlapping */}
      <Navigation />

        {/* Full page Kaaba Background with Parallax Effect */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            ref={backgroundRef}
            className="absolute inset-0"
            style={{
              transform: 'scale(1.1)',
              willChange: 'transform',
              transition: 'transform 0.1s ease-out'
            }}
          >
            <Image
              src="/alhilal-assets/Kaaba-hero1.jpg"
              alt="Kaaba Background"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          {/* Black overlay on top of the image */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

      {/* Main Layout */}
      <div className="relative min-h-screen">
        <div className="container mx-auto min-h-screen px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen items-center py-20 lg:py-20">
            
            {/* Left Content */}
            <div className="space-y-4 md:space-y-5 lg:space-y-6">

              <p className="text-[10px] md:text-xs lg:text-sm font-normal text-white/80 tracking-widest uppercase leading-relaxed">
                Al-Hilal Presents <span className="text-gold hidden sm:inline">the grand umrah 2026</span>
              </p>

              
              {/* Main Heading */}
              <div className="space-y-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  RAMADHAN 
                </h1>
                
                {/* Umrah 2026 in normal bold font */}
                <h2 className="text-2xl md:text-3xl lg:text-3xl font-bold text-white leading-tight tracking-tight flex items-center gap-1">
                  <span>UMRAH <span className="text-gold">2026</span></span>
                  <span className="inline-flex gap-0.5 ml-1">
                    <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-gold" /> 
                    <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-gold" /> 
                    <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-gold" /> 
                    <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-gold" /> 
                  </span>
                </h2>
                
                {/* Minimal decorative line */}
                <div className="w-16 md:w-24 lg:w-36 h-0.5 bg-gold/60 mt-2 md:mt-3" />
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/15 backdrop-blur-md px-2.5 md:px-3 py-1.5 rounded-full border border-white/30">
                  <FontAwesomeIcon icon={faKaaba} className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold flex-shrink-0" />
                  <span className="font-medium text-[10px] md:text-xs text-white tracking-wide whitespace-nowrap">LAST 15 DAYS</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/15 backdrop-blur-md px-2.5 md:px-3 py-1.5 rounded-full border border-white/30">
                  <FontAwesomeIcon icon={faTag} className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold flex-shrink-0" />
                  <span className="font-medium text-[10px] md:text-xs text-white tracking-wide whitespace-nowrap">40% OFF</span>
                </div>
                
              </div>


            </div>

            {/* Right Content - Hidden on Mobile */}
            <div className="hidden lg:block relative space-y-5 lg:space-y-6 px-9">
              
              {/* Pricing */}
              <div className="pb-4 border-b border-white/20 space-y-2">
                <p className="text-white/80 text-xs font-medium tracking-wide">AT ONLY</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">6,750,000</p>
                  <p className="text-lg md:text-xl font-semibold text-white/90">UGX</p>
                </div>
                <p className="text-gold text-sm font-semibold tracking-wide">45% OFF THIS RAMADHAN</p>

                <Link href="/how-to-book">
                <button className="hidden mt-10 lg:flex w-full max-w-md bg-white text-black font-semibold text-sm py-3.5 shadow-lg hover:shadow-xl hover:opacity-90 transition-all items-center justify-center gap-2 cursor-pointer">
                  RESERVE YOUR SPOT
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </button>
              </Link>
                
              </div>
              
               {/* Description */}
               <p className="mt-10 text-white text-sm md:text-base leading-relaxed font-normal max-w-lg">
                Allah invites you to <span className="text-gold">a once in a lifetime opportunity</span> to perform Umrah in the last 15 days of the holy month of Ramadhan.
              </p>
              {/* CTA Button - Hidden on Mobile */}
              

              {/* Contact */}
              <div className="pt-6 =border-white/20">
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
          </div>
        </div>

        {/* Background Overlay - Covers Right Half of Screen, Extends into Header */}
        <div className="hidden opacity-90 lg:block absolute top-0 right-0 bottom-0 w-1/2 xl:w-[48%] pointer-events-none z-0">
          <div className="absolute inset-y-0 right-0 left-0  bg-primary ">
          </div>
        </div>
      </div>
    </section>
  )
}

