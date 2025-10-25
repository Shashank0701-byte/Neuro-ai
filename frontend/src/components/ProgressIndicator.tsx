import React, { useState, useEffect } from 'react'
import { Brain, FileText, BarChart3, CheckCircle, Loader2 } from 'lucide-react'

const ProgressIndicator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    {
      id: 'processing',
      title: 'Processing Text',
      description: 'Analyzing linguistic patterns and structure',
      icon: FileText,
      duration: 2000
    },
    {
      id: 'extracting',
      title: 'Extracting Features',
      description: 'Computing vocabulary, syntax, and semantic features',
      icon: BarChart3,
      duration: 3000
    },
    {
      id: 'analyzing',
      title: 'Cognitive Analysis',
      description: 'Evaluating cognitive health indicators',
      icon: Brain,
      duration: 2000
    },
    {
      id: 'completing',
      title: 'Finalizing Results',
      description: 'Generating insights and recommendations',
      icon: CheckCircle,
      duration: 1000
    }
  ]

  useEffect(() => {
    let totalDuration = 0
    let currentDuration = 0

    // Calculate total duration
    steps.forEach(step => {
      totalDuration += step.duration
    })

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / totalDuration) * 50 // Update every 50ms
        
        // Update current step based on progress
        let accumulatedDuration = 0
        for (let i = 0; i < steps.length; i++) {
          accumulatedDuration += steps[i].duration
          if (newProgress <= (accumulatedDuration / totalDuration) * 100) {
            setCurrentStep(i)
            break
          }
        }

        if (newProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Text</h2>
        <p className="text-gray-600">
          Our AI is performing comprehensive cognitive health analysis
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
          <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isUpcoming = index > currentStep

          return (
            <div 
              key={step.id}
              className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-50 border-2 border-primary-200' 
                  : isCompleted 
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${
                isActive 
                  ? 'bg-primary-100' 
                  : isCompleted 
                    ? 'bg-green-100'
                    : 'bg-gray-100'
              }`}>
                {isActive ? (
                  <Loader2 className={`h-6 w-6 animate-spin ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                ) : (
                  <Icon className={`h-6 w-6 ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isActive 
                        ? 'text-primary-600'
                        : 'text-gray-400'
                  }`} />
                )}
              </div>

              <div className="flex-1">
                <h3 className={`font-semibold ${
                  isActive 
                    ? 'text-primary-900' 
                    : isCompleted 
                      ? 'text-green-900'
                      : 'text-gray-500'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${
                  isActive 
                    ? 'text-primary-700' 
                    : isCompleted 
                      ? 'text-green-700'
                      : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>

              {isCompleted && (
                <CheckCircle className="h-6 w-6 text-green-600 ml-4" />
              )}

              {isActive && (
                <div className="ml-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Processing Details */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">200+</div>
            <div className="text-sm text-blue-800">Features Analyzed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
            <div className="text-sm text-purple-800">Powered Analysis</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">Clinical</div>
            <div className="text-sm text-green-800">Grade Insights</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Did you know?</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Our analysis examines over 200 linguistic features including vocabulary diversity, syntactic complexity, and semantic coherence.</p>
          <p>• The cognitive health score is based on evidence from peer-reviewed research in computational linguistics and neuropsychology.</p>
          <p>• Results are generated in real-time using advanced natural language processing algorithms.</p>
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator
