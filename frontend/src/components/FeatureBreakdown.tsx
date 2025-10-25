import React, { useState } from 'react'
import { 
  BarChart3, 
  BookOpen, 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronDown,
  ChevronRight,
  Info,
  Target
} from 'lucide-react'

interface CognitiveFeatures {
  basic: {
    wordCount: number
    sentenceCount: number
    averageWordsPerSentence: number
    typeTokenRatio: number
  }
  lexical: {
    vocabularySize: number
    lexicalDiversity: number
    complexWordRatio: number
    averageWordLength: number
  }
  sentiment: {
    sentimentScore: number
    sentimentPolarity: string
  }
  cognitive: {
    cognitiveHealthScore: number
    syntacticComplexity: number
    informationDensity: number
    hesitationRatio: number
  }
}

interface Summary {
  readabilityLevel: string
  sentimentPolarity: string
  cognitiveHealthScore: number
}

interface FeatureBreakdownProps {
  features: CognitiveFeatures
  summary: Summary
}

interface FeatureMetric {
  name: string
  value: number | string
  normalRange: string
  status: 'good' | 'moderate' | 'concern'
  description: string
  clinicalRelevance: string
}

const FeatureBreakdown: React.FC<FeatureBreakdownProps> = ({ features, summary }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['cognitive'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const getStatusIcon = (status: 'good' | 'moderate' | 'concern') => {
    switch (status) {
      case 'good':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'moderate':
        return <Minus className="h-4 w-4 text-yellow-600" />
      case 'concern':
        return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: 'good' | 'moderate' | 'concern') => {
    switch (status) {
      case 'good':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'moderate':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'concern':
        return 'text-red-700 bg-red-50 border-red-200'
    }
  }

  const evaluateMetric = (value: number, thresholds: { good: number, moderate: number }): 'good' | 'moderate' | 'concern' => {
    if (value >= thresholds.good) return 'good'
    if (value >= thresholds.moderate) return 'moderate'
    return 'concern'
  }

  // Define feature categories with metrics
  const featureCategories = [
    {
      id: 'cognitive',
      title: 'Cognitive Health Indicators',
      icon: Brain,
      color: 'purple',
      metrics: [
        {
          name: 'Overall Cognitive Score',
          value: `${(features.cognitive.cognitiveHealthScore * 100).toFixed(1)}%`,
          normalRange: '70-100%',
          status: evaluateMetric(features.cognitive.cognitiveHealthScore, { good: 0.7, moderate: 0.4 }),
          description: 'Composite score based on multiple cognitive indicators',
          clinicalRelevance: 'Primary indicator of cognitive health status. Lower scores may indicate need for professional evaluation.'
        },
        {
          name: 'Syntactic Complexity',
          value: (features.cognitive.syntacticComplexity * 100).toFixed(1),
          normalRange: '40-80',
          status: evaluateMetric(features.cognitive.syntacticComplexity, { good: 0.4, moderate: 0.2 }),
          description: 'Complexity of sentence structures and grammatical patterns',
          clinicalRelevance: 'Reflects language processing abilities and cognitive organization skills.'
        },
        {
          name: 'Information Density',
          value: (features.cognitive.informationDensity * 100).toFixed(1),
          normalRange: '50-90',
          status: evaluateMetric(features.cognitive.informationDensity, { good: 0.5, moderate: 0.3 }),
          description: 'Amount of meaningful information conveyed per unit of speech',
          clinicalRelevance: 'Higher density indicates efficient communication and cognitive processing.'
        },
        {
          name: 'Hesitation Ratio',
          value: `${(features.cognitive.hesitationRatio * 100).toFixed(2)}%`,
          normalRange: '0-5%',
          status: features.cognitive.hesitationRatio <= 0.05 ? 'good' : features.cognitive.hesitationRatio <= 0.1 ? 'moderate' : 'concern',
          description: 'Frequency of speech hesitations and filled pauses',
          clinicalRelevance: 'Lower ratios indicate better speech fluency and word retrieval abilities.'
        }
      ] as FeatureMetric[]
    },
    {
      id: 'lexical',
      title: 'Vocabulary & Language',
      icon: BookOpen,
      color: 'blue',
      metrics: [
        {
          name: 'Vocabulary Size',
          value: features.lexical.vocabularySize,
          normalRange: '100-500+',
          status: evaluateMetric(features.lexical.vocabularySize, { good: 200, moderate: 100 }),
          description: 'Number of unique words used in the sample',
          clinicalRelevance: 'Larger vocabulary indicates better language preservation and cognitive flexibility.'
        },
        {
          name: 'Lexical Diversity',
          value: (features.lexical.lexicalDiversity * 100).toFixed(1),
          normalRange: '60-90',
          status: evaluateMetric(features.lexical.lexicalDiversity, { good: 0.6, moderate: 0.4 }),
          description: 'Variety and richness of vocabulary usage',
          clinicalRelevance: 'Higher diversity suggests preserved language abilities and cognitive flexibility.'
        },
        {
          name: 'Complex Word Usage',
          value: `${(features.lexical.complexWordRatio * 100).toFixed(1)}%`,
          normalRange: '10-30%',
          status: evaluateMetric(features.lexical.complexWordRatio, { good: 0.1, moderate: 0.05 }),
          description: 'Proportion of complex, multi-syllabic words',
          clinicalRelevance: 'Appropriate use of complex words indicates preserved language sophistication.'
        },
        {
          name: 'Average Word Length',
          value: features.lexical.averageWordLength.toFixed(1),
          normalRange: '4.0-6.0',
          status: evaluateMetric(features.lexical.averageWordLength, { good: 4.0, moderate: 3.5 }),
          description: 'Mean length of words in characters',
          clinicalRelevance: 'Longer words may indicate preserved vocabulary complexity.'
        }
      ] as FeatureMetric[]
    },
    {
      id: 'basic',
      title: 'Speech Patterns',
      icon: MessageSquare,
      color: 'green',
      metrics: [
        {
          name: 'Word Count',
          value: features.basic.wordCount,
          normalRange: '50-300+',
          status: evaluateMetric(features.basic.wordCount, { good: 100, moderate: 50 }),
          description: 'Total number of words in the sample',
          clinicalRelevance: 'Adequate word production indicates preserved speech fluency.'
        },
        {
          name: 'Sentence Count',
          value: features.basic.sentenceCount,
          normalRange: '5-50+',
          status: evaluateMetric(features.basic.sentenceCount, { good: 10, moderate: 5 }),
          description: 'Number of complete sentences produced',
          clinicalRelevance: 'Appropriate sentence production reflects organized thinking.'
        },
        {
          name: 'Words per Sentence',
          value: features.basic.averageWordsPerSentence.toFixed(1),
          normalRange: '8-20',
          status: evaluateMetric(features.basic.averageWordsPerSentence, { good: 8, moderate: 5 }),
          description: 'Average length of sentences',
          clinicalRelevance: 'Balanced sentence length indicates good syntactic organization.'
        },
        {
          name: 'Type-Token Ratio',
          value: (features.basic.typeTokenRatio * 100).toFixed(1),
          normalRange: '40-80',
          status: evaluateMetric(features.basic.typeTokenRatio, { good: 0.5, moderate: 0.3 }),
          description: 'Ratio of unique words to total words',
          clinicalRelevance: 'Higher ratios suggest varied vocabulary usage and cognitive flexibility.'
        }
      ] as FeatureMetric[]
    },
    {
      id: 'sentiment',
      title: 'Emotional Indicators',
      icon: BarChart3,
      color: 'indigo',
      metrics: [
        {
          name: 'Sentiment Score',
          value: features.sentiment.sentimentScore.toFixed(1),
          normalRange: '-2 to +2',
          status: Math.abs(features.sentiment.sentimentScore) <= 1 ? 'good' : 'moderate',
          description: 'Overall emotional tone of the speech',
          clinicalRelevance: 'Extreme sentiment scores may indicate mood-related concerns.'
        },
        {
          name: 'Sentiment Polarity',
          value: features.sentiment.sentimentPolarity,
          normalRange: 'Neutral to Positive',
          status: features.sentiment.sentimentPolarity === 'positive' ? 'good' : 
                 features.sentiment.sentimentPolarity === 'neutral' ? 'moderate' : 'concern',
          description: 'Classification of emotional tone',
          clinicalRelevance: 'Persistent negative sentiment may warrant attention to mood and wellbeing.'
        }
      ] as FeatureMetric[]
    }
  ]

  const MetricCard: React.FC<{ metric: FeatureMetric }> = ({ metric }) => (
    <div className={`border rounded-lg p-4 ${getStatusColor(metric.status)}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{metric.name}</h4>
        {getStatusIcon(metric.status)}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-75">Value:</span>
          <span className="font-semibold">{metric.value}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm opacity-75">Normal Range:</span>
          <span className="text-sm">{metric.normalRange}</span>
        </div>
        
        <div className="pt-2 border-t border-current border-opacity-20">
          <p className="text-xs opacity-90 mb-2">{metric.description}</p>
          <div className="flex items-start">
            <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0 opacity-75" />
            <p className="text-xs opacity-75 leading-relaxed">{metric.clinicalRelevance}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center mb-8">
        <Target className="h-8 w-8 text-primary-600 mr-3" />
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Detailed Feature Analysis</h2>
          <p className="text-gray-600">Comprehensive breakdown of cognitive and linguistic indicators</p>
        </div>
      </div>

      <div className="space-y-6">
        {featureCategories.map((category) => {
          const isExpanded = expandedSections.includes(category.id)
          const Icon = category.icon
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(category.id)}
                className="w-full p-6 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-4 bg-${category.color}-100`}>
                    <Icon className={`h-6 w-6 text-${category.color}-600`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600">
                      {category.metrics.length} indicators analyzed
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.metrics.map((metric, index) => (
                      <MetricCard key={index} metric={metric} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Insights */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Readability Level</h4>
            <p className="text-blue-800 text-sm">{summary.readabilityLevel}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Emotional Tone</h4>
            <p className="text-purple-800 text-sm capitalize">{summary.sentimentPolarity}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Overall Score</h4>
            <p className="text-green-800 text-sm">{(summary.cognitiveHealthScore * 100).toFixed(0)}% Cognitive Health</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureBreakdown
