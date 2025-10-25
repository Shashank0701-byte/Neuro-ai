import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  LineChart,
  Filter,
  Download,
  Eye,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Minus
} from 'lucide-react'

interface AnalysisResult {
  analysisId: string
  features: any
  summary: {
    readabilityLevel: string
    sentimentPolarity: string
    cognitiveHealthScore: number
  }
  cognitiveInsights: {
    overallAssessment: string
    strengths: string[]
    concerns: string[]
    recommendations: string[]
  }
  processingTime: number
  timestamp: string
}

interface ScoreHistoryProps {
  analyses: AnalysisResult[]
}

const ScoreHistory: React.FC<ScoreHistoryProps> = ({ analyses }) => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | '90d'>('all')

  const filterAnalysesByTime = (analyses: AnalysisResult[]) => {
    if (timeFilter === 'all') return analyses

    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeFilter) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
    }

    return analyses.filter(analysis => new Date(analysis.timestamp) >= cutoffDate)
  }

  const filteredAnalyses = filterAnalysesByTime(analyses)

  const getScoreChange = (currentScore: number, previousScore: number) => {
    const change = currentScore - previousScore
    return {
      value: change,
      percentage: ((change / previousScore) * 100).toFixed(1),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.7) return CheckCircle
    if (score >= 0.4) return AlertCircle
    return AlertCircle
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const averageScore = filteredAnalyses.reduce((sum, analysis) => sum + analysis.summary.cognitiveHealthScore, 0) / filteredAnalyses.length
  const latestScore = filteredAnalyses[0]?.summary.cognitiveHealthScore || 0
  const previousScore = filteredAnalyses[1]?.summary.cognitiveHealthScore || latestScore
  const scoreChange = getScoreChange(latestScore, previousScore)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Score History</h2>
            <p className="text-gray-600">Track your cognitive health progress over time</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'chart'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Chart
            </button>
          </div>

          <button className="btn-secondary text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Assessments</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{filteredAnalyses.length}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Average Score</span>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {(averageScore * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Latest Score</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {(latestScore * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Trend</span>
            {getTrendIcon(scoreChange.trend)}
          </div>
          <div className={`text-2xl font-bold ${
            scoreChange.trend === 'up' ? 'text-green-900' : 
            scoreChange.trend === 'down' ? 'text-red-900' : 'text-gray-900'
          }`}>
            {scoreChange.trend === 'stable' ? 'Stable' : `${scoreChange.percentage}%`}
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
              <p className="text-gray-600">
                {timeFilter === 'all' 
                  ? 'Complete your first assessment to see your history here.'
                  : 'No assessments found for the selected time period.'}
              </p>
            </div>
          ) : (
            filteredAnalyses.map((analysis, index) => {
              const score = analysis.summary.cognitiveHealthScore
              const ScoreIcon = getScoreIcon(score)
              const previousAnalysis = filteredAnalyses[index + 1]
              const change = previousAnalysis ? getScoreChange(score, previousAnalysis.summary.cognitiveHealthScore) : null

              return (
                <div key={analysis.analysisId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 border ${getScoreColor(score)}`}>
                        <ScoreIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900 mr-3">
                            Cognitive Health Score: {(score * 100).toFixed(0)}%
                          </h3>
                          {change && (
                            <div className="flex items-center text-sm">
                              {getTrendIcon(change.trend)}
                              <span className={`ml-1 ${
                                change.trend === 'up' ? 'text-green-600' : 
                                change.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {change.trend !== 'stable' && `${change.percentage}%`}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <button className="btn-secondary text-sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Assessment</h4>
                      <p className="text-sm text-gray-900">{analysis.cognitiveInsights.overallAssessment}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Readability</h4>
                      <p className="text-sm text-gray-900 capitalize">{analysis.summary.readabilityLevel}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Sentiment</h4>
                      <p className="text-sm text-gray-900 capitalize">{analysis.summary.sentimentPolarity}</p>
                    </div>
                  </div>

                  {/* Key Insights */}
                  {(analysis.cognitiveInsights.strengths.length > 0 || analysis.cognitiveInsights.concerns.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysis.cognitiveInsights.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Strengths
                            </h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              {analysis.cognitiveInsights.strengths.slice(0, 2).map((strength, idx) => (
                                <li key={idx} className="flex items-start">
                                  <ArrowRight className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.cognitiveInsights.concerns.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Areas of Focus
                            </h4>
                            <ul className="text-sm text-yellow-800 space-y-1">
                              {analysis.cognitiveInsights.concerns.slice(0, 2).map((concern, idx) => (
                                <li key={idx} className="flex items-start">
                                  <ArrowRight className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                                  {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* Chart View */
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chart View Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Interactive charts and trend analysis will be available in a future update.
            </p>
            <button 
              onClick={() => setViewMode('list')}
              className="btn-primary"
            >
              View List Instead
            </button>
          </div>
        </div>
      )}

      {/* Insights */}
      {filteredAnalyses.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Insights</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You've completed {filteredAnalyses.length} cognitive assessments</li>
                  <li>• Your average score is {(averageScore * 100).toFixed(0)}%</li>
                  {scoreChange.trend !== 'stable' && (
                    <li>• Your latest score shows a {scoreChange.trend === 'up' ? 'positive' : 'negative'} trend of {scoreChange.percentage}%</li>
                  )}
                  <li>• Regular monitoring helps track cognitive health changes over time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoreHistory
