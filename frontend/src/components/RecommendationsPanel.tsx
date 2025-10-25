import React, { useState } from 'react'
import { 
  Lightbulb, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Phone, 
  BookOpen, 
  Activity, 
  Heart,
  Brain,
  Users,
  Clock,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react'

interface CognitiveInsights {
  overallAssessment: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
}

interface RecommendationsPanelProps {
  insights: CognitiveInsights
  score: number
}

interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
  category: 'immediate' | 'short-term' | 'long-term'
  icon: React.ComponentType<any>
  completed?: boolean
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ insights, score }) => {
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'recommendations' | 'actions' | 'resources'>('recommendations')

  const toggleActionComplete = (actionId: string) => {
    setCompletedActions(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    )
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-700 bg-green-50 border-green-200'
    }
  }

  const generateActionItems = (score: number): ActionItem[] => {
    const baseActions: ActionItem[] = [
      {
        id: 'schedule-followup',
        title: 'Schedule Follow-up Assessment',
        description: 'Plan your next cognitive assessment to track changes over time',
        priority: score < 0.4 ? 'high' : score < 0.7 ? 'medium' : 'low',
        timeframe: score < 0.4 ? '2-4 weeks' : score < 0.7 ? '3-6 months' : '6-12 months',
        category: 'short-term',
        icon: Calendar
      },
      {
        id: 'lifestyle-review',
        title: 'Review Lifestyle Factors',
        description: 'Assess sleep, exercise, nutrition, and stress management habits',
        priority: 'medium',
        timeframe: 'This week',
        category: 'immediate',
        icon: Heart
      },
      {
        id: 'cognitive-exercises',
        title: 'Engage in Cognitive Activities',
        description: 'Incorporate brain training exercises, puzzles, or learning new skills',
        priority: 'medium',
        timeframe: 'Daily',
        category: 'long-term',
        icon: Brain
      },
      {
        id: 'social-engagement',
        title: 'Maintain Social Connections',
        description: 'Regular social interaction supports cognitive health',
        priority: 'medium',
        timeframe: 'Weekly',
        category: 'long-term',
        icon: Users
      }
    ]

    if (score < 0.4) {
      baseActions.unshift({
        id: 'medical-consultation',
        title: 'Consult Healthcare Professional',
        description: 'Schedule an appointment with your doctor or a neurologist for comprehensive evaluation',
        priority: 'high',
        timeframe: 'Within 1-2 weeks',
        category: 'immediate',
        icon: Phone
      })
    } else if (score < 0.7) {
      baseActions.push({
        id: 'monitoring-plan',
        title: 'Establish Monitoring Plan',
        description: 'Create a regular schedule for cognitive health check-ins',
        priority: 'medium',
        timeframe: 'This month',
        category: 'short-term',
        icon: Activity
      })
    }

    return baseActions
  }

  const actionItems = generateActionItems(score)

  const resources = [
    {
      title: 'Cognitive Health Guidelines',
      description: 'Evidence-based recommendations for maintaining cognitive health',
      url: '#',
      type: 'guide'
    },
    {
      title: 'Brain Training Exercises',
      description: 'Collection of scientifically-backed cognitive exercises',
      url: '#',
      type: 'exercises'
    },
    {
      title: 'Healthcare Provider Directory',
      description: 'Find qualified neurologists and cognitive specialists',
      url: '#',
      type: 'directory'
    },
    {
      title: 'Support Groups',
      description: 'Connect with others interested in cognitive health',
      url: '#',
      type: 'community'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center mb-8">
        <Lightbulb className="h-8 w-8 text-yellow-500 mr-3" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recommendations & Next Steps</h2>
          <p className="text-gray-600">Personalized guidance based on your cognitive health assessment</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Insights & Recommendations
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'actions'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Action Plan
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'resources'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Resources
        </button>
      </div>

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-8">
          {/* Strengths */}
          {insights.strengths.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-green-900">Cognitive Strengths</h3>
              </div>
              <ul className="space-y-2">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-green-800">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {insights.concerns.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                <h3 className="text-xl font-semibold text-yellow-900">Areas for Attention</h3>
              </div>
              <ul className="space-y-2">
                {insights.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-yellow-800">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-blue-900">Personalized Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Overall Assessment */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Overall Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{insights.overallAssessment}</p>
          </div>
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {completedActions.length} of {actionItems.length} actions completed
            </p>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">
                <Download className="h-4 w-4 mr-2" />
                Export Plan
              </button>
              <button className="btn-secondary text-sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedActions.length / actionItems.length) * 100}%` }}
            ></div>
          </div>

          {/* Action Items by Category */}
          {['immediate', 'short-term', 'long-term'].map(category => {
            const categoryActions = actionItems.filter(action => action.category === category)
            if (categoryActions.length === 0) return null

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  {category.replace('-', ' ')} Actions
                </h3>
                
                <div className="space-y-3">
                  {categoryActions.map(action => {
                    const Icon = action.icon
                    const isCompleted = completedActions.includes(action.id)
                    
                    return (
                      <div 
                        key={action.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center mr-4">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleActionComplete(action.id)}
                              className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Icon className="h-5 w-5 text-gray-500 mr-2" />
                              <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {action.title}
                              </h4>
                              <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(action.priority)}`}>
                                {action.priority} priority
                              </span>
                            </div>
                            
                            <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                              {action.description}
                            </p>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Timeline: {action.timeframe}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <p className="text-gray-600 mb-6">
            Additional resources to support your cognitive health journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <BookOpen className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                <a 
                  href={resource.url}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Access Resource
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            ))}
          </div>

          {/* Emergency Contact Info */}
          {score < 0.4 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-red-900">Important Notice</h3>
              </div>
              <p className="text-red-800 mb-4">
                Your assessment indicates areas that may benefit from professional evaluation. 
                Please consider scheduling an appointment with a healthcare provider.
              </p>
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>If this is a medical emergency, call 911 immediately.</strong></p>
                <p>For non-emergency healthcare needs, contact your primary care physician or:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>National Suicide Prevention Lifeline: 988</li>
                  <li>Crisis Text Line: Text HOME to 741741</li>
                  <li>Alzheimer's Association 24/7 Helpline: 1-800-272-3900</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecommendationsPanel
