"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Navigation from "./Navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faKaaba, 
  faTag, 
  faClock,
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons"

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navigation - Overlapping */}
      <Navigation />

          
      {/* Full page Kaaba Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
        <Image
          src="/alhilal-assets/Kaaba-hero.jpg"
          alt="Kaaba Background"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Main Layout */}
      <div className="relative min-h-screen">
        <div className="container mx-auto min-h-screen px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen lg:items-center py-20 lg:py-20">
            
            {/* Left Content */}
            <div className="space-y-4 md:space-y-5 lg:space-y-6">
              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                  <FontAwesomeIcon icon={faKaaba} className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="font-semibold text-[10px] md:text-xs text-white tracking-wide whitespace-nowrap">LAST 15 DAYS</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                  <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="font-semibold text-[10px] md:text-xs text-white tracking-wide whitespace-nowrap">40% OFF</span>
                </div>
                
              </div>

              {/* Main Heading */}
              <div className="space-y-1">
                <h1 className="text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-[0.95] tracking-tighter">
                  RAMADHAN
                </h1>
                <div className="flex items-baseline gap-2 md:gap-3">
                  <h1 className="text-[clamp(2rem,5.5vw,4rem)] font-bold text-white leading-[0.95] tracking-tighter">
                    UMRAH
                  </h1>
                  <span className="text-[clamp(2rem,5.5vw,4rem)] font-black text-gold leading-[0.95] tracking-tighter">
                    2026
                  </span>
                </div>
                
                {/* Minimal decorative line */}
                <div className="w-20 md:w-28 lg:w-36 h-0.5 bg-gold/60 mt-2 md:mt-3" />
              </div>

              {/* Description */}
              <p className="text-white text-sm md:text-base leading-relaxed font-normal max-w-lg">
              Allah invites you to the Kaaba for a once in a lifetime opportunity to perform Umrah in the last 15 nights of this Ramadhan.
              </p>

              {/* CTA Button - Hidden on Mobile */}
              <button className="hidden lg:flex w-full max-w-md bg-white text-black font-bold text-sm md:text-base py-4 md:py-5 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all items-center justify-center gap-2">
                RESERVE YOUR SPOT
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>

            </div>

            {/* Right Content - Hidden on Mobile */}
            <div className="hidden lg:block relative space-y-5 lg:space-y-6 px-9">
              
              {/* Pricing */}
              <div className="space-y-4 lg:space-y-5">
                <div className="space-y-2">
                  <p className="text-white/80 text-xs md:text-sm font-medium tracking-wide uppercase">
                    AT ONLY
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                      6,750,000
                    </p>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white/90">
                      UGX
                    </p>
                  </div>
                </div>
                
                
                <p className="text-gold text-base md:text-lg lg:text-xl font-bold tracking-wide">
                  45% OFF THIS RAMADHAN
                </p>
                
              </div>
              
            </div>
          </div>
        </div>

        {/* Background Overlay - Covers Right Half of Screen, Extends into Header */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-1/2 xl:w-[48%] pointer-events-none z-0">
          <div className="absolute inset-y-0 right-0 left-0 mb-2.5 mr-2.5 mt-2.5 bg-gradient-to-br from-[#970246] to-[#b8034f] rounded-l-3xl">
            {/* Visible umrah logo watermark */}
            
          </div>
        </div>

        {/* Mobile Card - Below Content */}
        <div className="lg:hidden px-6 md:px-8 pb-12 -mt-32 relative z-10">
          <div className="relative bg-gradient-to-br from-[#970246] to-[#b8034f] rounded-2xl p-6 md:p-8 shadow-2xl max-w-lg mx-auto">
            <div className="absolute top-4 right-4 w-16 h-16 opacity-60 pointer-events-none">
              <Image
                src="/alhilal-assets/umrah-logo.svg"
                alt="Umrah Logo"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative space-y-4">
              

              <button className="w-full bg-white text-black font-bold text-sm py-4 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                RESERVE YOUR SPOT
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-white/20 space-y-2">
                <p className="text-white/80 text-xs font-medium tracking-wide">AT ONLY</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl md:text-5xl font-black text-white tracking-tight">6,750,000</p>
                  <p className="text-xl md:text-2xl font-bold text-white/90">UGX</p>
                </div>
                <p className="text-gold text-base font-bold tracking-wide">45% OFF THIS RAMADHAN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

