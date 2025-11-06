"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowRight,
  faPhone,
  faEnvelope,
  faCheckCircle,
  faFileContract,
  faCreditCard,
  faPassport,
  faCalendarCheck,
  faSuitcaseRolling
} from "@fortawesome/free-solid-svg-icons"
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"

const bookingSteps = [
  {
    step: 1,
    icon: faPhone,
    title: "Enquire",
    description: "Reach out to us with your preferred dates, party size, and budget.",
    details: [
      "Call or WhatsApp: +256 700 773535",
      "Email: info@alhilaltravels.com",
      "Visit our office in Kampala",
      "Fill out our online contact form"
    ],
    action: "Get in Touch"
  },
  {
    step: 2,
    icon: faFileContract,
    title: "Confirm",
    description: "Review your tailored itinerary and package details.",
    details: [
      "Receive customized quote & itinerary",
      "Review package inclusions & exclusions",
      "Ask questions and clarify details",
      "Approve package and submit documents"
    ],
    action: "Review Package"
  },
  {
    step: 3,
    icon: faCreditCard,
    title: "Secure",
    description: "Complete payment and finalize your booking.",
    details: [
      "Pay deposit to reserve your seats",
      "Complete balance as per schedule",
      "Receive booking confirmation",
      "Get visa, tickets, hotel vouchers & briefing pack"
    ],
    action: "Make Payment"
  }
]

const paymentMethods = [
  "Mobile Money (MTN/Airtel)",
  "Bank Transfer",
  "Cash at Office",
  "International Wire Transfer"
]

const requiredDocuments = [
  {
    title: "Valid Passport",
    description: "Must be valid for at least 6 months from travel date"
  },
  {
    title: "Passport Photos",
    description: "Recent passport-size photos (specific requirements will be shared)"
  },
  {
    title: "Vaccination Certificates",
    description: "As per current Saudi Arabia health requirements"
  },
  {
    title: "Additional Documents",
    description: "Marriage certificate (if applicable), ID copies, and other specified documents"
  }
]

const faqs = [
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-3 months in advance, especially for Ramadan and Hajj packages. This ensures visa processing time and better accommodation availability."
  },
  {
    question: "What is the payment schedule?",
    answer: "Typically, a 30-50% deposit secures your booking, with the balance due 30 days before departure. Specific terms are outlined on your invoice."
  },
  {
    question: "Can I make changes after booking?",
    answer: "Changes are possible subject to availability and may incur fees. Contact us as soon as possible if you need to modify your booking."
  },
  {
    question: "What if my visa is rejected?",
    answer: "In the rare case of visa rejection, we'll work with you on options. Refund terms depend on the circumstances and are outlined in your contract."
  },
  {
    question: "Are payment plans available?",
    answer: "Yes, we offer flexible payment plans for most packages. Contact us to discuss options that work for your budget."
  },
  {
    question: "What's included in the package price?",
    answer: "Packages typically include flights, visa processing, accommodation, transfers, and guided tours. Specific inclusions vary by package—full details provided at booking."
  }
]

export default function HowToBookPage() {
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
              Simple & Straightforward
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              How to Book
            </h1>
            <p className="text-white/90 text-lg md:text-xl leading-relaxed">
              Three easy steps to secure your spiritual journey with Al-Hilal
            </p>
          </div>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 md:gap-10">
              {bookingSteps.map((step, index) => (
                <div 
                  key={index}
                  className="relative"
                >
                  {/* Connecting Line */}
                  {index < bookingSteps.length - 1 && (
                    <div className="hidden md:block absolute left-8 top-20 w-0.5 h-[calc(100%+2rem)] bg-primary/20" />
                  )}

                  <div className="grid md:grid-cols-12 gap-6 items-start">
                    {/* Step Number & Icon */}
                    <div className="md:col-span-2 flex flex-col items-center md:items-start">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-3 relative z-10">
                        <FontAwesomeIcon icon={step.icon} className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-4xl font-bold text-primary/20">0{step.step}</span>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-10 bg-gray-50 rounded-2xl p-6 md:p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                        {step.title}
                      </h2>
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                        {step.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-3 mb-6">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>

                      {index === 0 && (
                        <div className="flex flex-wrap gap-3">
                          <a href="tel:+256700773535">
                            <Button variant="default" size="default">
                              Call Us Now
                              <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                          <a href="https://wa.me/256700773535" target="_blank" rel="noopener noreferrer">
                            <Button variant="gold" size="default">
                              WhatsApp
                              <FontAwesomeIcon icon={faWhatsapp} className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                          <Link href="/contact">
                            <Button variant="outline" size="default">
                              Contact Form
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods & Documents */}
      <section className="py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Payment Methods */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Payment Methods
                </h2>
              </div>
              
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                We accept various payment methods for your convenience. Payment details and schedules will be shared on your booking invoice.
              </p>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <ul className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{method}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faPassport} className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Required Documents
                </h2>
              </div>
              
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                To process your visa and booking, you'll need to provide the following documents. We'll guide you through each requirement.
              </p>

              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border-2 border-gray-200">
                    <h3 className="text-primary font-bold mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm">{doc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-700 text-base md:text-lg">
              Get answers to common booking questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 md:p-8 border-2 border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-700 mb-6">Still have questions?</p>
            <Link href="/contact">
              <Button variant="default" size="lg">
                Contact Us
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-8">
              Don't wait—spaces are limited for our most popular packages. Start your booking process today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/trip-calendar">
                <Button variant="gold" size="lg">
                  View Trip Calendar
                  <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+256700773535">
                <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                  Call +256 700 773535
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

