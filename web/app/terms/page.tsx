"use client"

import Navigation from "@/components/sections/Navigation"
import Footer from "@/components/sections/Footer"

export default function TermsConditionsPage() {
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
              Terms & Conditions
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
            
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              By booking services with Al-Hilal Tours & Travel ("Al-Hilal," "we," "us," or "our"), you ("client," "you," or "your") agree to be bound by these Terms and Conditions. Please read them carefully before making a booking. If you do not agree with these terms, please do not proceed with your booking.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">2. Booking and Payment</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">2.1 Booking Process</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              A booking is confirmed only when we receive your deposit payment and issue a written confirmation. All bookings are subject to availability.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">2.2 Payment Schedule</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>A non-refundable deposit (typically 30-50% of the package cost) is required to secure your booking</li>
              <li>Full payment must be received at least 30 days before departure unless otherwise agreed</li>
              <li>Late payment may result in booking cancellation and forfeiture of deposit</li>
              <li>Payment can be made via mobile money, bank transfer, or cash at our office</li>
            </ul>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">2.3 Pricing</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              All prices are quoted in the currency specified and are subject to change until full payment is received. We reserve the right to adjust prices due to currency fluctuations, fuel surcharges, taxes, or changes in government regulations. Significant price increases will be communicated to you before final payment.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">3. Package Inclusions and Exclusions</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">3.1 Standard Inclusions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Unless otherwise stated, our packages typically include:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Return air tickets</li>
              <li>Visa processing and fees</li>
              <li>Accommodation in specified hotels</li>
              <li>Ground transfers between airport, hotels, and Haramain</li>
              <li>Guided Ziyarah tours</li>
              <li>On-ground support and coordination</li>
            </ul>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">3.2 Standard Exclusions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">Unless specifically included in your package, the following are not covered:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Personal expenses (shopping, phone calls, laundry, etc.)</li>
              <li>Meals not specified in the package</li>
              <li>Travel insurance</li>
              <li>Excess baggage charges</li>
              <li>Optional excursions or upgrades</li>
              <li>Tips and gratuities</li>
              <li>Medical expenses and vaccinations</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">4. Travel Documents and Visa</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">4.1 Passport Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your passport must be valid for at least 6 months from your date of travel. You are responsible for ensuring your passport meets this requirement.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">4.2 Visa Processing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we assist with visa applications, we cannot guarantee visa approval as this is at the sole discretion of the Saudi Arabian authorities. We are not responsible for visa rejections or delays.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">4.3 Document Accuracy</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              You must provide accurate information in all documents. Errors or omissions may result in denied boarding, visa rejection, or additional costs, for which you will be responsible.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">5. Cancellations and Refunds</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">5.1 Cancellation by Client</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you need to cancel your booking, the following cancellation charges apply:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>More than 60 days before departure: Loss of deposit</li>
              <li>30-60 days before departure: 50% of package cost</li>
              <li>15-29 days before departure: 75% of package cost</li>
              <li>Less than 15 days before departure: 100% of package cost (no refund)</li>
            </ul>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">5.2 Cancellation by Al-Hilal</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We reserve the right to cancel a trip due to insufficient bookings, force majeure, or other circumstances beyond our control. In such cases, you will receive a full refund or the option to transfer to an alternative date. We are not liable for any additional costs you may have incurred.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">5.3 No-Show Policy</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Failure to show up for departure or join the group without prior notice will result in forfeiture of all payments with no refund.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">6. Changes and Modifications</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">6.1 Changes by Client</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Requests to change your booking (dates, accommodation, flights) are subject to availability and may incur additional fees. Changes requested within 30 days of departure may not be possible.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">6.2 Changes by Al-Hilal</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We reserve the right to make minor changes to your itinerary, accommodation, or travel arrangements if necessary. Major changes will be communicated to you as soon as possible. If you are not satisfied with the alternative arrangements, you may cancel for a full refund.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">7. Travel Insurance</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We strongly recommend that you purchase comprehensive travel insurance covering medical expenses, trip cancellation, baggage loss, and personal liability. Al-Hilal is not responsible for any losses that could have been covered by insurance.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">8. Health and Safety</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">8.1 Health Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must meet all health requirements set by Saudi Arabian authorities, including mandatory vaccinations. You are responsible for obtaining any required health certificates.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">8.2 Medical Conditions</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You must inform us of any medical conditions, disabilities, or special needs at the time of booking. We will make reasonable efforts to accommodate your needs, but we cannot guarantee suitability for all participants.
            </p>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">8.3 Fitness to Travel</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Umrah and Hajj involve significant physical activity, including walking long distances. You must ensure you are physically fit to undertake the pilgrimage. We reserve the right to refuse participation if we believe it poses a risk to your health or safety.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">9. Liability and Responsibility</h2>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">9.1 Our Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We act as an intermediary between you and service providers (airlines, hotels, transport companies). While we exercise due care in selecting reputable providers, we are not liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Acts or omissions of third-party service providers</li>
              <li>Flight delays, cancellations, or schedule changes</li>
              <li>Lost or damaged baggage (this is the airline's responsibility)</li>
              <li>Illness, injury, or death during the trip</li>
              <li>Theft or loss of personal belongings</li>
              <li>Force majeure events (natural disasters, political unrest, pandemics, etc.)</li>
            </ul>
            <h3 className="text-xl font-semibold text-primary mb-3 mt-6">9.2 Your Responsibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Arriving at meeting points on time</li>
              <li>Following instructions from our tour guides and coordinators</li>
              <li>Complying with local laws and customs in Saudi Arabia</li>
              <li>Safeguarding your personal belongings</li>
              <li>Behaving respectfully toward other pilgrims and service providers</li>
              <li>Any costs arising from your misconduct or failure to follow instructions</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">10. Conduct and Behavior</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We reserve the right to remove any participant from the group if their behavior is deemed detrimental to the group's welfare, safety, or the spiritual nature of the pilgrimage. No refund will be provided in such cases, and you will be responsible for your own return arrangements.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">11. Complaints and Disputes</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              If you have any complaints during your trip, please inform your tour guide or our on-ground coordinator immediately so we can address the issue. Complaints raised after the trip will be handled on a case-by-case basis. Any unresolved disputes will be subject to the laws of Uganda.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">12. Force Majeure</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We are not liable for failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to war, terrorism, natural disasters, pandemics, government restrictions, strikes, or technical failures. In such cases, we will work with you to find alternative arrangements, but we are not obligated to provide refunds for costs already incurred.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">13. Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Your personal information will be processed in accordance with our Privacy Policy. By booking with us, you consent to the use of your information as outlined in our Privacy Policy.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">14. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              These Terms and Conditions are governed by the laws of Uganda. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the Ugandan courts.
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions or concerns regarding these Terms and Conditions, please contact us:
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
                By proceeding with your booking, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

