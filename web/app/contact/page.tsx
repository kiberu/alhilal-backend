"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faPhone,
  faEnvelope,
  faLocationDot,
  faClock,
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons"
import { 
  faWhatsapp,
  faFacebook,
  faInstagram,
  faTwitter,
  faTiktok
} from "@fortawesome/free-brands-svg-icons"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create WhatsApp message
    const message = `*New Contact Form Submission*

*Name:* ${formData.name}
*Email:* ${formData.email}
${formData.phone ? `*Phone:* ${formData.phone}\n` : ''}*Subject:* ${formData.subject}

*Message:*
${formData.message}

---
Sent from Al-Hilal Website Contact Form`

    // WhatsApp URL with pre-filled message
    const whatsappNumber = "256700773535" // Al-Hilal WhatsApp number
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp in new window
    window.open(whatsappURL, '_blank')
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-primary flex items-center justify-center overflow-hidden">
        <Navigation />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 pt-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
              Get In Touch
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Contact Us
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
              Have questions about your pilgrimage? We're here to help. Reach out to us anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                  Let's Talk
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Whether you're planning your first Umrah or your tenth, our team is ready to assist you with personalized guidance and support.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Phone/WhatsApp</p>
                    <a 
                      href="tel:+256700773535"
                      className="text-primary text-lg font-semibold hover:text-gold transition-colors"
                    >
                      +256 700 773535
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Email</p>
                    <a 
                      href="mailto:info@alhilaltravels.com"
                      className="text-primary text-lg font-semibold hover:text-gold transition-colors"
                    >
                      info@alhilaltravels.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Office Address</p>
                    <p className="text-primary text-lg font-semibold">
                      Kyato Complex, Suite B5-18<br />
                      Bombo Road, Kampala, Uganda
                    </p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Office Hours</p>
                    <p className="text-primary text-base font-semibold">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-gray-600 text-sm font-medium mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a 
                    href="https://www.facebook.com/61554545522475/about/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://x.com/alhilal_travels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTwitter} className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://www.instagram.com/al_hilal_travels/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://www.tiktok.com/@alhilaltravels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTiktok} className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="https://wa.me/256700773535"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 md:p-10">
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-6">
                  Send Us a Message
                </h3>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="+256 700 000000"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    >
                      <option value="">Select a subject</option>
                      <option value="umrah">Umrah Package Inquiry</option>
                      <option value="hajj">Hajj Package Inquiry</option>
                      <option value="visa">Visa Processing</option>
                      <option value="group">Group Booking</option>
                      <option value="vip">VIP Services</option>
                      <option value="general">General Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 resize-none"
                      placeholder="Tell us about your pilgrimage plans or any questions you have..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    variant="gold" 
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    Send via WhatsApp
                    <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                  </Button>
                  <p className="text-gray-600 text-xs mt-2">
                    Your message will be sent to us via WhatsApp
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-700 text-base">
              Explore our packages and learn more about what we offer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/trip-calendar" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary">
              <h3 className="text-lg font-bold text-primary mb-2">Trip Calendar</h3>
              <p className="text-gray-600 text-sm">View upcoming trips and dates</p>
            </Link>
            <Link href="/services" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary">
              <h3 className="text-lg font-bold text-primary mb-2">Our Services</h3>
              <p className="text-gray-600 text-sm">Explore all our offerings</p>
            </Link>
            <Link href="/how-to-book" className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary">
              <h3 className="text-lg font-bold text-primary mb-2">How to Book</h3>
              <p className="text-gray-600 text-sm">Simple booking process</p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

