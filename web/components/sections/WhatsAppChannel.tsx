"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"

export default function WhatsAppChannel() {
  return (
    <section className="relative py-20 md:py-24 lg:py-28 overflow-hidden" style={{
      background: 'linear-gradient(to bottom, hsl(338, 93%, 30%), hsl(338, 93%, 35%), hsl(35, 95%, 57%))'
    }}>
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Content Card */}
          <div className="backdrop-blur-md rounded-3xl p-8 md:p-12 lg:p-16 border border-white/20" style={{
            backgroundColor: 'hsla(338, 93%, 30%, 0.6)'
          }}>
            
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{
              backgroundColor: 'hsl(35, 95%, 57%)'
            }}>
              <FontAwesomeIcon icon={faWhatsapp} className="w-10 h-10 text-black" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Join Our WhatsApp Channel
            </h2>

            {/* Description */}
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Stay connected with Al-Hilal! Get instant updates on upcoming trips, exclusive Umrah packages, inspirational content, and important travel information directly to your phone.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 text-white/90 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mb-2" style={{backgroundColor: 'hsl(35, 95%, 57%)'}} />
                <p>Trip Announcements</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mb-2" style={{backgroundColor: 'hsl(35, 95%, 57%)'}} />
                <p>Exclusive Offers</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mb-2" style={{backgroundColor: 'hsl(35, 95%, 57%)'}} />
                <p>Travel Tips & Updates</p>
              </div>
            </div>

            {/* CTA Button */}
            <a 
              href="https://whatsapp.com/channel/0029VbC6Ncr8KMqre9kVUh1Z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-black font-semibold text-base px-8 py-4 rounded-lg transition-all shadow-lg hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: 'hsl(35, 95%, 57%)'
              }}
            >
              <FontAwesomeIcon icon={faWhatsapp} className="w-6 h-6" />
              Join WhatsApp Channel
            </a>

            {/* Additional Info */}
            <p className="text-white/70 text-xs mt-6">
              We respect your privacy and send only purposeful, helpful content
            </p>

          </div>

        </div>
      </div>
    </section>
  )
}

