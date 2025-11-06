"use client"

import { useState } from "react"

export default function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribe:", email)
  }

  return (
    <section className="relative py-20 md:py-24 lg:py-28 overflow-hidden" style={{
      background: 'linear-gradient(to bottom, hsl(338, 93%, 30%), hsl(338, 93%, 35%), hsl(35, 95%, 57%))'
    }}>
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/alhilal-assets/deco-border.png')] bg-repeat opacity-20" />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Content Card */}
          <div className="backdrop-blur-md rounded-3xl p-8 md:p-12 lg:p-16 border border-white/20" style={{
            backgroundColor: 'hsla(338, 93%, 30%, 0.6)'
          }}>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              
              {/* Left Column - Heading */}
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                  Subscribe to our<br />newsletter
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  We send only purposeful, helpful content that respects your time and journey to Allah's House
                </p>
              </div>

              {/* Right Column - Form */}
              <div>
                <p className="text-white text-sm mb-6 leading-relaxed">
                  Sign up to receive updates on our Umrah programs, inspirational reflections, and exclusive offers.
                </p>

                {/* Email Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Email Address"
                      className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
                      style={{
                        '--tw-ring-color': 'hsl(35, 95%, 57%)'
                      } as React.CSSProperties}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full text-black font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-lg"
                    style={{
                      backgroundColor: 'hsl(35, 95%, 57%)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(35, 95%, 52%)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(35, 95%, 57%)'}
                  >
                    Send
                  </button>
                </form>

                {/* Alternative Contact */}
                <div className="mt-6 text-center">
                  <p className="text-white/80 text-xs mb-2 uppercase tracking-wide">OR</p>
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <button 
                      className="font-semibold transition-colors uppercase tracking-wider"
                      style={{ color: 'hsl(35, 95%, 57%)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(35, 95%, 70%)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(35, 95%, 57%)'}
                    >
                      JOIN OUR CHANNEL
                    </button>
                    <button 
                      className="font-semibold transition-colors uppercase tracking-wider"
                      style={{ color: 'hsl(35, 95%, 57%)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(35, 95%, 70%)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(35, 95%, 57%)'}
                    >
                      ON WHATSAPP
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

