"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faXmark } from "@fortawesome/free-solid-svg-icons"

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-4 md:py-5">
          <div className="flex items-center justify-between">
            {/* Logo - Responsive sizing */}
            <Link href="/" className="relative w-24 h-9 md:w-32 md:h-11 lg:w-36 lg:h-12">
                <Image
                  src="/alhilal-assets/LOGO-landscape.svg"
                  alt="Al-Hilal Logo"
                  fill
                  className="object-contain object-left brightness-0 invert"
                  priority
                />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">

              <Link 
                href="/who-we-are" 
                className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
              >
                About Al-Hilal
              </Link>
              <Link 
                href="/services" 
                className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
              >
                Services
              </Link>
              <Link 
                href="/contact" 
                className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
              >
                Contact
              </Link>
              
              <Link href="/trip-calendar">
                <Button 
                  variant="gold" 
                  size="default"
                  className="font-semibold text-xs xl:text-sm px-5 py-2.5"
                >
                  Trip Calendar
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden text-white p-2" 
              aria-label="Menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-primary z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="relative w-24 h-9">
              <Image
                src="/alhilal-assets/LOGO-landscape.svg"
                alt="Al-Hilal Logo"
                fill
                className="object-contain object-left brightness-0 invert"
                priority
              />
            </div>
            <button 
              onClick={closeMobileMenu}
              className="text-white p-2"
              aria-label="Close Menu"
            >
              <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <nav className="space-y-6">

              <Link 
                href="/who-we-are" 
                onClick={closeMobileMenu}
                className="block text-white font-semibold text-lg hover:text-gold transition-colors"
              >
                About Al-Hilal
              </Link>

              <Link 
                href="/services" 
                onClick={closeMobileMenu}
                className="block text-white font-semibold text-lg hover:text-gold transition-colors"
              >
                Our Services
              </Link>

              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block text-white font-semibold text-lg hover:text-gold transition-colors"
              >
                Contact Us
              </Link>
              
            </nav>

            {/* Mobile CTA Button */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <Link href="/trip-calendar" className="block">
                <Button 
                  variant="gold" 
                  size="default"
                  className="w-full font-semibold text-sm px-5 py-3"
                  onClick={closeMobileMenu}
                >
                  Trip Calendar
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-3">Contact Us</p>
              <a 
                href="tel:+256700773535"
                className="block text-white text-lg font-bold hover:text-gold transition-colors mb-2"
              >
                +256 700 773535
              </a>
              <a 
                href="mailto:info@alhilaltravels.com"
                className="block text-white/80 text-sm hover:text-gold transition-colors"
              >
                info@alhilaltravels.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
