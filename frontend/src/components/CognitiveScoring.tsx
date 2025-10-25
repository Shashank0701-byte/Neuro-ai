import React, { useState, useEffect } from 'react'
import { Brain, Upload, FileText, Mic, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import ScoreDisplay from './ScoreDisplay'
import FeatureBreakdown from './FeatureBreakdown'
import RecommendationsPanel from './RecommendationsPanel'
import ProgressIndicator from './ProgressIndicator'
import ScoreHistory from './ScoreHistory'

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

interface AnalysisResult {
  analysisId: string
  features: CognitiveFeatures
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

const CognitiveScoring: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<'text' | 'transcription' | 'upload'>('text')
  const [textInput, setTextInput] = useState('')
  const [transcriptionId, setTranscriptionId] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])

  useEffect(() => {
    // Load analysis history from localStorage
    const savedHistory = localStorage.getItem('cognitiveAnalysisHistory')
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveToHistory = (result: AnalysisResult) => {
    const updatedHistory = [result, ...analysisHistory.slice(0, 9)] // Keep last 10 analyses
    setAnalysisHistory(updatedHistory)
    localStorage.setItem('cognitiveAnalysisHistory', JSON.stringify(updatedHistory))
  }

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/feature-extraction/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textInput,
          options: {
            includeAdvanced: true,
            includeCognitive: true,
            analysisType: 'comprehensive'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const analysisResult: AnalysisResult = {
          analysisId: result.data.analysisId,
          features: result.data.features,
          summary: result.summary,
          cognitiveInsights: result.cognitiveInsights,
          processingTime: result.data.processingTime,
          timestamp: new Date().toISOString()
        }
        
        setAnalysisResult(analysisResult)
        saveToHistory(analysisResult)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTranscriptionAnalysis = async () => {
    if (!transcriptionId.trim()) {
      setError('Please enter a transcription ID')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(`/api/feature-extraction/analyze-transcription/${transcriptionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            includeAdvanced: true,
            includeCognitive: true,
            analysisType: 'comprehensive'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const analysisResult: AnalysisResult = {
          analysisId: result.data.analysisId,
          features: result.data.features,
          summary: result.summary,
          cognitiveInsights: result.cognitiveInsights,
          processingTime: result.data.processingTime,
          timestamp: new Date().toISOString()
        }
        
        setAnalysisResult(analysisResult)
        saveToHistory(analysisResult)
      } else {
        throw new Error(result.message || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // For now, read the file as text and analyze it
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextInput(content)
      setInputMethod('text')
    }
    reader.readAsText(file)
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setError(null)
    setTextInput('')
    setTranscriptionId('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cognitive Health Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced AI-powered analysis to evaluate cognitive health through speech and text patterns. 
            Get detailed insights with actionable recommendations.
          </p>
        </div>

        {!analysisResult ? (
          /* Input Section */
          <div className="max-w-4xl mx-auto">
            {/* Input Method Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Analysis Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setInputMethod('text')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    inputMethod === 'text'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Text Input</h3>
                  <p className="text-sm text-gray-600">
                    Enter or paste text directly for analysis
                  </p>
                </button>

                <button
                  onClick={() => setInputMethod('transcription')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    inputMethod === 'transcription'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mic className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Transcription ID</h3>
                  <p className="text-sm text-gray-600">
                    Analyze existing speech transcription
                  </p>
                </button>

                <button
                  onClick={() => setInputMethod('upload')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    inputMethod === 'upload'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">File Upload</h3>
                  <p className="text-sm text-gray-600">
                    Upload a text file for analysis
                  </p>
                </button>
              </div>

              {/* Input Forms */}
              {inputMethod === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Text for Analysis
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter the text you'd like to analyze for cognitive health indicators. This could be a speech transcript, written response, or any text sample..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={isAnalyzing}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {textInput.length} characters
                    </span>
                    <span className="text-sm text-gray-500">
                      Recommended: 100+ words for accurate analysis
                    </span>
                  </div>
                </div>
              )}

              {inputMethod === 'transcription' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcription ID
                  </label>
                  <input
                    type="text"
                    value={transcriptionId}
                    onChange={(e) => setTranscriptionId(e.target.value)}
                    placeholder="Enter the transcription ID from a previous speech-to-text analysis"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isAnalyzing}
                  />
                </div>
              )}

              {inputMethod === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Text File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      disabled={isAnalyzing}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Click to upload a file
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports .txt, .md, .doc, .docx files
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Analysis Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={inputMethod === 'transcription' ? handleTranscriptionAnalysis : handleTextAnalysis}
                  disabled={isAnalyzing || (inputMethod === 'text' && !textInput.trim()) || (inputMethod === 'transcription' && !transcriptionId.trim())}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {isAnalyzing && <ProgressIndicator />}

            {/* Analysis History Preview */}
            {analysisHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisHistory.slice(0, 3).map((analysis, index) => (
                    <div key={analysis.analysisId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.summary.cognitiveHealthScore >= 0.7
                            ? 'bg-green-100 text-green-800'
                            : analysis.summary.cognitiveHealthScore >= 0.4
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(analysis.summary.cognitiveHealthScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        {analysis.cognitiveInsights.overallAssessment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Analysis Complete</h2>
              </div>
              <p className="text-gray-600">
                Processed in {analysisResult.processingTime.toFixed(2)} seconds
              </p>
            </div>

            {/* Score Display */}
            <ScoreDisplay 
              score={analysisResult.summary.cognitiveHealthScore}
              assessment={analysisResult.cognitiveInsights.overallAssessment}
              timestamp={analysisResult.timestamp}
            />

            {/* Feature Breakdown */}
            <FeatureBreakdown 
              features={analysisResult.features}
              summary={analysisResult.summary}
            />

            {/* Recommendations */}
            <RecommendationsPanel 
              insights={analysisResult.cognitiveInsights}
              score={analysisResult.summary.cognitiveHealthScore}
            />

            {/* Score History */}
            {analysisHistory.length > 1 && (
              <ScoreHistory analyses={analysisHistory} />
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetAnalysis}
                className="btn-secondary"
              >
                New Analysis
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CognitiveScoring
