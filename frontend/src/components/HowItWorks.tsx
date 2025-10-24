import React from 'react'
import { Play, Mic, Brain, FileCheck, ArrowRight } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: <Play className="h-8 w-8" />,
      title: "Start Assessment",
      description: "Begin with a simple registration and consent process. No complex setup required.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Speech & Text Tasks",
      description: "Complete guided speaking exercises and writing tasks designed to capture cognitive patterns.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Analysis",
      description: "Our advanced algorithms analyze your speech patterns, language use, and cognitive markers.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: "Get Results",
      description: "Receive detailed insights and recommendations within minutes of completing your assessment.",
      color: "from-green-500 to-green-600"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How NeuroAid Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes cognitive screening simple and accessible for everyone.
          </p>
        </div>

        <div className="relative">
          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center max-w-xs">
                  <div className={`bg-gradient-to-r ${step.color} text-white p-4 rounded-full mb-4 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 h-48 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-8 w-8 text-gray-400 mx-4" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`bg-gradient-to-r ${step.color} text-white p-3 rounded-full shadow-lg flex-shrink-0`}>
                  {step.icon}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-secondary-50 p-8 rounded-2xl border border-primary-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Scientifically Validated Approach
            </h3>
            <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our assessment methodology is based on peer-reviewed research in cognitive neuroscience and 
              has been validated against traditional cognitive screening tools. The AI models are trained 
              on diverse datasets to ensure accuracy across different populations and demographics.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
