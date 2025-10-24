import React from 'react'
import { ArrowRight, Shield, Zap, Users } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-50"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8">
            <Shield className="h-4 w-4 mr-2" />
            Non-invasive AI Screening
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Early Detection of
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
              Cognitive Decline
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            NeuroAid uses advanced AI to analyze speech and text patterns, providing accessible, 
            non-invasive cognitive health assessments from the comfort of your home.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary text-lg px-8 py-4 flex items-center">
              Start Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary-500" />
              <span>5-minute assessment</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-500" />
              <span>HIPAA compliant</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-500" />
              <span>Trusted by 10,000+ users</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
