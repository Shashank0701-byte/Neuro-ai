import React from 'react'
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
  assessment: string
  timestamp: string
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, assessment, timestamp }) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'green'
    if (score >= 0.4) return 'yellow'
    return 'red'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.7) return CheckCircle
    if (score >= 0.4) return AlertTriangle
    return AlertCircle
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return 'Good Cognitive Health'
    if (score >= 0.4) return 'Moderate - Monitor'
    return 'Needs Attention'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 0.7) {
      return 'Your cognitive health indicators are within normal ranges. Continue maintaining healthy lifestyle habits.'
    }
    if (score >= 0.4) {
      return 'Some cognitive indicators suggest monitoring may be beneficial. Consider discussing with a healthcare professional.'
    }
    return 'Several cognitive indicators suggest professional evaluation may be warranted. Please consult with a healthcare provider.'
  }

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return 'Low Risk'
    if (score >= 0.4) return 'Moderate Risk'
    return 'Higher Risk'
  }

  const color = getScoreColor(score)
  const Icon = getScoreIcon(score)
  const percentage = Math.round(score * 100)

  // Calculate the circumference for the circular progress
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score * circumference)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Cognitive Health Score</h2>
        <p className="text-gray-600">
          Analysis completed on {new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Circular Score Visualization */}
        <div className="flex justify-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={color === 'green' ? '#10b981' : color === 'yellow' ? '#f59e0b' : '#ef4444'}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${
                  color === 'green' ? 'text-green-600' : 
                  color === 'yellow' ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {percentage}%
                </div>
                <div className="text-sm text-gray-500 mt-1">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${
              color === 'green' ? 'bg-green-100' : 
              color === 'yellow' ? 'bg-yellow-100' : 
              'bg-red-100'
            }`}>
              <Icon className={`h-6 w-6 ${
                color === 'green' ? 'text-green-600' : 
                color === 'yellow' ? 'text-yellow-600' : 
                'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getScoreLabel(score)}
              </h3>
              <p className={`text-sm font-medium ${
                color === 'green' ? 'text-green-600' : 
                color === 'yellow' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {getRiskLevel(score)}
              </p>
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Assessment Summary</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {assessment}
            </p>
          </div>

          {/* Description */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">What This Means</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {getScoreDescription(score)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Range Indicator */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4 text-center">Score Range Guide</h4>
        <div className="flex justify-between items-center">
          {/* Low Risk */}
          <div className="flex-1 text-center">
            <div className="bg-green-100 rounded-lg p-3 mb-2">
              <Shield className="h-6 w-6 text-green-600 mx-auto" />
            </div>
            <div className="text-sm font-medium text-green-700">Good</div>
            <div className="text-xs text-gray-500">70-100%</div>
          </div>

          {/* Moderate Risk */}
          <div className="flex-1 text-center mx-4">
            <div className="bg-yellow-100 rounded-lg p-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto" />
            </div>
            <div className="text-sm font-medium text-yellow-700">Monitor</div>
            <div className="text-xs text-gray-500">40-69%</div>
          </div>

          {/* Higher Risk */}
          <div className="flex-1 text-center">
            <div className="bg-red-100 rounded-lg p-3 mb-2">
              <AlertCircle className="h-6 w-6 text-red-600 mx-auto" />
            </div>
            <div className="text-sm font-medium text-red-700">Attention</div>
            <div className="text-xs text-gray-500">0-39%</div>
          </div>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            Analysis confidence: High • Based on comprehensive linguistic analysis
          </span>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
