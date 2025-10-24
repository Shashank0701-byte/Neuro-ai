import React from 'react'
import { ArrowRight, CheckCircle } from 'lucide-react'

const CTA = () => {
  const benefits = [
    "Free initial assessment",
    "Results in under 10 minutes",
    "HIPAA-compliant and secure",
    "No appointment necessary",
    "Accessible from any device"
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Take Control of Your
            <span className="block">Cognitive Health Today</span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Early detection can make all the difference. Start your cognitive health journey with NeuroAid's 
            AI-powered screening tool.
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-bold text-lg px-10 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg">
              Start Your Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium text-lg px-10 py-4 rounded-lg transition-all duration-200">
              Schedule a Demo
            </button>
          </div>

          {/* Trust badge */}
          <div className="mt-12 text-center">
            <p className="text-white/80 text-sm">
              Trusted by healthcare professionals and individuals worldwide
            </p>
            <div className="flex justify-center items-center mt-4 space-x-8 opacity-60">
              <div className="text-xs">FDA Registered</div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="text-xs">HIPAA Compliant</div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="text-xs">ISO 27001 Certified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
