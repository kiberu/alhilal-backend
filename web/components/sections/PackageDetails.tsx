"use client"

import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faCalendarDays, 
  faMapLocationDot,
  faCheckCircle,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons"

const itinerary = [
  {
    day: "Days 1-2",
    location: "Arrival & Makkah",
    activities: [
      "Arrival at Jeddah Airport",
      "Transfer to Makkah hotel",
      "Check-in and rest",
      "First Umrah performance",
      "Orientation session"
    ]
  },
  {
    day: "Days 3-10",
    location: "Makkah",
    activities: [
      "Daily prayers at Haram",
      "Ziyarat tours (Cave Hira, Jabal Thawr)",
      "Educational sessions",
      "Free time for ibadah",
      "Shopping at local markets"
    ]
  },
  {
    day: "Days 11-14",
    location: "Madinah",
    activities: [
      "Travel to Madinah",
      "Prayers at Masjid Nabawi",
      "Visit to Jannat al-Baqi",
      "Quba Mosque visit",
      "Mount Uhud tour"
    ]
  },
  {
    day: "Day 15",
    location: "Departure",
    activities: [
      "Final prayers",
      "Check-out from hotel",
      "Transfer to airport",
      "Departure to Uganda",
      "End of journey"
    ]
  }
]

export default function PackageDetails() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
            <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-bold tracking-wide uppercase">15-Day Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Your Spiritual Itinerary
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            A carefully planned journey through the holy cities during the blessed last 15 nights of Ramadhan
          </p>
        </div>

        {/* Itinerary Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {itinerary.map((item, index) => (
              <div 
                key={index}
                className="relative bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Timeline connector */}
                {index < itinerary.length - 1 && (
                  <div className="hidden md:block absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-primary to-primary/20" />
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Day Badge */}
                  <div className="flex-shrink-0">
                    <div className="inline-flex md:flex flex-col items-center justify-center w-20 h-20 bg-primary rounded-xl text-primary-foreground">
                      <span className="text-xs font-semibold opacity-90">Days</span>
                      <span className="text-2xl font-black">{item.day.split(' ')[1]}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <FontAwesomeIcon icon={faMapLocationDot} className="w-5 h-5 text-gold" />
                      <h3 className="text-xl md:text-2xl font-black text-gray-900">
                        {item.location}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {item.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="flex items-start gap-3">
                          <FontAwesomeIcon 
                            icon={faCheckCircle} 
                            className="w-4 h-4 text-gold mt-1 flex-shrink-0" 
                          />
                          <span className="text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <button className="inline-flex items-center gap-3 bg-gold text-black font-bold text-base px-8 py-4 shadow-lg hover:shadow-xl hover:bg-gold/90 transition-all">
            Download Full Itinerary
            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  )
}

