"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faKaaba, 
  faHotel, 
  faBusSimple,
  faUserTie,
  faUtensils,
  faPassport
} from "@fortawesome/free-solid-svg-icons"

const features = [
  {
    icon: faHotel,
    title: "5-Star Accommodation",
    description: "Luxury hotels within walking distance to Haram in both Makkah and Madinah"
  },
  {
    icon: faBusSimple,
    title: "Premium Transport",
    description: "Comfortable air-conditioned coaches for all transfers and Ziyarat tours"
  },
  {
    icon: faUserTie,
    title: "Expert Guidance",
    description: "Experienced scholars and tour guides throughout your journey"
  },
  {
    icon: faUtensils,
    title: "Quality Meals",
    description: "Delicious halal meals included - breakfast, lunch, and dinner"
  },
  {
    icon: faPassport,
    title: "Visa Processing",
    description: "Complete visa assistance and documentation support"
  },
  {
    icon: faKaaba,
    title: "Spiritual Program",
    description: "Structured worship schedule and educational sessions"
  }
]

export default function Features() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
            <span className="text-primary text-sm font-bold tracking-wide uppercase">What's Included</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Premium Umrah Experience
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Everything you need for a comfortable and spiritually fulfilling journey
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white border-2 border-gray-100 rounded-2xl p-6 lg:p-8 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-gray-600 text-sm md:text-base">
            All-inclusive package with no hidden fees
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-gold text-2xl md:text-3xl font-black">6,790,000 UGX</span>
            <span className="text-gray-500 line-through text-lg">12,000,000 UGX</span>
          </div>
          <p className="text-primary font-bold mt-1">Save 45% - Limited Time Offer</p>
        </div>

      </div>
    </section>
  )
}

