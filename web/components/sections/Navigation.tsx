"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

export default function Navigation() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/* Logo - Responsive sizing */}
          <Link href="/" className="relative w-24 h-9 md:w-32 md:h-11 lg:w-36 lg:h-12">
            <Image
              src="/alhilal-assets/LOGO-landscape.svg"
              alt="Al-Hilal Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link 
              href="/" 
              className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
            >
              About Trip
            </Link>
            <Link 
              href="/who-we-are" 
              className="text-white font-medium text-sm xl:text-base hover:text-white hover:border-b-2 hover:border-gold transition-all pb-1"
            >
              Who we are
            </Link>
            <Button 
              variant="gold" 
              size="default"
              className="font-bold text-xs xl:text-sm"
            >
              Trip Calendar
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-white p-2" aria-label="Menu">
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
  )
}

