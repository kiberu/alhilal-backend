"use client"

import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] bg-primary flex items-center justify-center overflow-hidden">
        <Navigation />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10 pt-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-white/90 text-base">
              Last updated: November 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Al-Hilal Tours & Travel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services or visit our website.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Personal Information:</strong> Name, email address, phone number, postal address, date of birth, nationality, passport information, and emergency contact details.</li>
              <li><strong>Payment Information:</strong> Credit card details, bank account information, and billing address (processed securely through our payment partners).</li>
              <li><strong>Travel Information:</strong> Travel dates, package preferences, accommodation requirements, dietary restrictions, medical conditions relevant to travel, and special requests.</li>
              <li><strong>Communication Records:</strong> Correspondence with our team via email, phone, WhatsApp, or other communication channels.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device information, and website usage data collected through cookies and similar technologies.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Process and manage your booking for Umrah, Hajj, or other pilgrimage services</li>
              <li>Arrange visa processing, flight bookings, accommodation, and ground transfers</li>
              <li>Communicate with you about your booking, travel arrangements, and any changes or updates</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Send you important information about your pilgrimage, including pre-departure briefings and safety updates</li>
              <li>Process payments and prevent fraudulent transactions</li>
              <li>Improve our services and website functionality</li>
              <li>Send marketing communications (with your consent), including special offers and updates about upcoming trips</li>
              <li>Comply with legal obligations and regulatory requirements</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Service Providers:</strong> Airlines, hotels, transportation companies, visa processing agencies, and other third-party service providers necessary to fulfill your booking.</li>
              <li><strong>Government Authorities:</strong> Saudi Arabian authorities for visa processing and other relevant government agencies as required by law.</li>
              <li><strong>Payment Processors:</strong> Secure payment gateways to process your transactions.</li>
              <li><strong>Professional Advisors:</strong> Lawyers, accountants, and other professional advisors as needed.</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition of our business.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              We do not sell or rent your personal information to third parties for their marketing purposes.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Travel-related documents are typically retained for at least 7 years for regulatory compliance.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information (subject to legal retention requirements)</li>
              <li>Object to or restrict certain processing of your information</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Request a copy of your information in a portable format</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              To exercise these rights, please contact us at info@alhilaltravels.com or +256 700 773535.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. You can control cookie settings through your browser, but disabling cookies may affect website functionality.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our services are not directed to children under 18. We collect information about minors only as part of family bookings and with parental or guardian consent. Parents/guardians are responsible for providing accurate information about accompanying children.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">10. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Your information may be transferred to and processed in countries other than Uganda, including Saudi Arabia, for visa processing and pilgrimage arrangements. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-gray-700 mb-2"><strong>Al-Hilal Tours & Travel</strong></p>
              <p className="text-gray-700 mb-2">Kyato Complex, Suite B5-18</p>
              <p className="text-gray-700 mb-2">Bombo Road, Kampala, Uganda</p>
              <p className="text-gray-700 mb-2">Email: info@alhilaltravels.com</p>
              <p className="text-gray-700">Phone/WhatsApp: +256 700 773535</p>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <p className="text-gray-600 text-sm italic">
                By using our services, you acknowledge that you have read, understood, and agree to this Privacy Policy.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

