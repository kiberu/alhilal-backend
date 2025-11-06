"use client"

import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faPhone,
  faEnvelope,
  faLocationDot,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons"
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faWhatsapp,
  faTiktok
} from "@fortawesome/free-brands-svg-icons"

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white">
      

      {/* Main Footer */}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-32 h-12">
                <Image
                  src="/alhilal-assets/LOGO-landscape.svg"
                  alt="Al-Hilal Logo"
                  fill
                  className="object-contain object-left brightness-0 invert"
                  priority
                />
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
            Based in Kampala, Uganda, we've helped hundreds of Muslims fulfil their sacred Umrah and Hajj Pilgrimages
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/61554545522475/about/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:opacity-80 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/alhilal_travels" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:opacity-80 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/al_hilal_travels/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:opacity-80 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@alhilaltravels" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:opacity-80 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/256700773535" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:opacity-80 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
              </a>
            </div>
          </div>


          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <span className="text-white/70 text-sm">
                  Kyato Complex, Suite B5-18<br />Bombo Road, Kampala, Uganda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="tel:+256700773535" className="text-white/70 hover:text-gold transition-colors text-sm">
                  +256 700 773535
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="mailto:info@alhilaltravels.com" className="text-white/70 hover:text-gold transition-colors text-sm">
                  info@alhilaltravels.com
                </a>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
      <div className="border-b border-white/10">
        <div className="container ">
          <div className="flex flex-col  gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                Ready to Begin Your Journey?
              </h3>
              <p className="text-white/70 text-sm md:text-base">
                Limited spots available for the last 15 nights of Ramadhan
              </p>
            </div>
            <Link href="/how-to-book">
              <button className="bg-gold text-black font-semibold text-sm px-6 py-3 shadow-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer">
                Book Your Spot Now
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© 2025 Al-Hilal Tours & Travel. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}

