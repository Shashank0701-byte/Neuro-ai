import React from 'react'
import { Mic, FileText, Brain, Shield, Clock, Home } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Speech Pattern Analysis",
      description: "Advanced AI analyzes speech patterns, including pause frequency, word retrieval, and articulation changes that may indicate cognitive changes."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Text Analysis",
      description: "Sophisticated natural language processing evaluates writing patterns, vocabulary complexity, and semantic coherence."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms trained on extensive datasets provide accurate cognitive health assessments and personalized recommendations."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Non-Invasive Screening",
      description: "No needles, scans, or invasive procedures. Our assessment uses only speech and text analysis for comfortable screening."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Quick Assessment",
      description: "Complete cognitive screening in just 5-10 minutes with immediate results and detailed analysis reports."
    },
    {
      icon: <Home className="h-8 w-8" />,
      title: "Home Accessibility",
      description: "Take the assessment from anywhere using your smartphone, tablet, or computer. No clinic visits required."
    }
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Revolutionary Cognitive Screening
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform makes cognitive health monitoring accessible, accurate, and convenient for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-3 rounded-lg w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
