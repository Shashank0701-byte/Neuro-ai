import { useState } from 'react'
import { BarChart3, Activity, Brain, AlertTriangle, TrendingUp, Mic, FileText } from 'lucide-react'

const FeatureExtraction = () => {
  const [activeTab, setActiveTab] = useState<'linguistic' | 'acoustic'>('linguistic')

  // Sample linguistic features data
  const linguisticFeatures = {
    vocabulary: {
      uniqueWords: 245,
      totalWords: 580,
      lexicalDiversity: 0.42,
      avgWordLength: 4.8,
      complexWords: 67
    },
    syntax: {
      avgSentenceLength: 12.4,
      clauseDensity: 1.8,
      subordinationIndex: 0.35,
      parseTreeDepth: 6.2
    },
    semantics: {
      coherenceScore: 0.78,
      topicConsistency: 0.82,
      semanticSimilarity: 0.71,
      ideaDensity: 0.65
    },
    discourse: {
      fillerWords: 23,
      repetitions: 8,
      selfCorrections: 5,
      incompleteUtterances: 3
    }
  }

  // Sample acoustic features data
  const acousticFeatures = {
    prosody: {
      pitchMean: 185.4,
      pitchVariance: 42.3,
      pitchRange: 156.8,
      speakingRate: 145.2
    },
    voice: {
      jitter: 0.012,
      shimmer: 0.045,
      hnr: 18.5,
      formantDispersion: 1.24
    },
    timing: {
      pauseDuration: 0.68,
      pauseFrequency: 12,
      articulationRate: 4.2,
      speechToPauseRatio: 2.8
    },
    energy: {
      meanEnergy: 65.3,
      energyVariance: 12.4,
      dynamicRange: 28.6,
      spectralCentroid: 1850
    }
  }

  // Unusual findings
  const unusualFindings = [
    {
      category: 'Linguistic',
      feature: 'Lexical Diversity',
      value: 0.42,
      normalRange: '0.55-0.75',
      severity: 'moderate',
      description: 'Lower than expected vocabulary diversity may indicate word-finding difficulties'
    },
    {
      category: 'Acoustic',
      feature: 'Pause Frequency',
      value: 12,
      normalRange: '6-8 per minute',
      severity: 'high',
      description: 'Elevated pause frequency suggests potential speech planning issues'
    },
    {
      category: 'Linguistic',
      feature: 'Filler Words',
      value: 23,
      normalRange: '8-12',
      severity: 'moderate',
      description: 'Increased use of filler words may indicate uncertainty or word retrieval difficulty'
    },
    {
      category: 'Acoustic',
      feature: 'Jitter',
      value: 0.012,
      normalRange: '< 0.010',
      severity: 'low',
      description: 'Slightly elevated voice perturbation detected'
    }
  ]

  const ProgressBar = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
    const percentage = (value / max) * 100
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">{value.toFixed(2)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  const BarChart = ({ data, label, color }: { data: { label: string; value: number }[]; label: string; color: string }) => {
    const maxValue = Math.max(...data.map(d => d.value))
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{label}</h4>
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-24 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className={`h-6 rounded-full ${color} flex items-center justify-end pr-2`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-xs font-medium text-white">{item.value.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section id="feature-extraction" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary-500 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Feature Extraction Analysis
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive visualization of extracted linguistic and acoustic features from speech analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('linguistic')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'linguistic'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-5 w-5" />
              Linguistic Features
            </button>
            <button
              onClick={() => setActiveTab('acoustic')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'acoustic'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="h-5 w-5" />
              Acoustic Features
            </button>
          </div>
        </div>

        {/* Linguistic Features Tab */}
        {activeTab === 'linguistic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Vocabulary Metrics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Vocabulary Metrics</h3>
              </div>
              <div className="space-y-4">
                <ProgressBar value={linguisticFeatures.vocabulary.lexicalDiversity} max={1} label="Lexical Diversity" color="bg-blue-500" />
                <ProgressBar value={linguisticFeatures.vocabulary.avgWordLength} max={10} label="Avg Word Length" color="bg-cyan-500" />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{linguisticFeatures.vocabulary.uniqueWords}</p>
                    <p className="text-sm text-gray-600">Unique Words</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{linguisticFeatures.vocabulary.complexWords}</p>
                    <p className="text-sm text-gray-600">Complex Words</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Syntax Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Syntax Analysis</h3>
              </div>
              <BarChart
                data={[
                  { label: 'Avg Sentence Length', value: linguisticFeatures.syntax.avgSentenceLength },
                  { label: 'Clause Density', value: linguisticFeatures.syntax.clauseDensity },
                  { label: 'Parse Tree Depth', value: linguisticFeatures.syntax.parseTreeDepth }
                ]}
                label=""
                color="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            {/* Semantic Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Semantic Features</h3>
              </div>
              <div className="space-y-4">
                <ProgressBar value={linguisticFeatures.semantics.coherenceScore} max={1} label="Coherence Score" color="bg-green-500" />
                <ProgressBar value={linguisticFeatures.semantics.topicConsistency} max={1} label="Topic Consistency" color="bg-emerald-500" />
                <ProgressBar value={linguisticFeatures.semantics.semanticSimilarity} max={1} label="Semantic Similarity" color="bg-teal-500" />
                <ProgressBar value={linguisticFeatures.semantics.ideaDensity} max={1} label="Idea Density" color="bg-cyan-500" />
              </div>
            </div>

            {/* Discourse Markers */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Discourse Markers</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{linguisticFeatures.discourse.fillerWords}</p>
                  <p className="text-sm text-gray-600 mt-1">Filler Words</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{linguisticFeatures.discourse.repetitions}</p>
                  <p className="text-sm text-gray-600 mt-1">Repetitions</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{linguisticFeatures.discourse.selfCorrections}</p>
                  <p className="text-sm text-gray-600 mt-1">Self-Corrections</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-pink-600">{linguisticFeatures.discourse.incompleteUtterances}</p>
                  <p className="text-sm text-gray-600 mt-1">Incomplete</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acoustic Features Tab */}
        {activeTab === 'acoustic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Prosody Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Prosody Features</h3>
              </div>
              <BarChart
                data={[
                  { label: 'Pitch Mean (Hz)', value: acousticFeatures.prosody.pitchMean },
                  { label: 'Pitch Variance', value: acousticFeatures.prosody.pitchVariance },
                  { label: 'Pitch Range (Hz)', value: acousticFeatures.prosody.pitchRange },
                  { label: 'Speaking Rate', value: acousticFeatures.prosody.speakingRate }
                ]}
                label=""
                color="bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>

            {/* Voice Quality */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Voice Quality</h3>
              </div>
              <div className="space-y-4">
                <ProgressBar value={acousticFeatures.voice.jitter} max={0.05} label="Jitter" color="bg-blue-500" />
                <ProgressBar value={acousticFeatures.voice.shimmer} max={0.1} label="Shimmer" color="bg-cyan-500" />
                <ProgressBar value={acousticFeatures.voice.hnr} max={30} label="HNR (dB)" color="bg-teal-500" />
                <ProgressBar value={acousticFeatures.voice.formantDispersion} max={2} label="Formant Dispersion" color="bg-sky-500" />
              </div>
            </div>

            {/* Timing Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-lime-500 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Timing Features</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">{acousticFeatures.timing.pauseDuration}s</p>
                  <p className="text-sm text-gray-600 mt-1">Avg Pause Duration</p>
                </div>
                <div className="bg-lime-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-lime-600">{acousticFeatures.timing.pauseFrequency}</p>
                  <p className="text-sm text-gray-600 mt-1">Pause Frequency</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-emerald-600">{acousticFeatures.timing.articulationRate}</p>
                  <p className="text-sm text-gray-600 mt-1">Articulation Rate</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-teal-600">{acousticFeatures.timing.speechToPauseRatio}</p>
                  <p className="text-sm text-gray-600 mt-1">Speech/Pause Ratio</p>
                </div>
              </div>
            </div>

            {/* Energy Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Energy Features</h3>
              </div>
              <BarChart
                data={[
                  { label: 'Mean Energy (dB)', value: acousticFeatures.energy.meanEnergy },
                  { label: 'Energy Variance', value: acousticFeatures.energy.energyVariance },
                  { label: 'Dynamic Range', value: acousticFeatures.energy.dynamicRange }
                ]}
                label=""
                color="bg-gradient-to-r from-yellow-500 to-orange-500"
              />
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Spectral Centroid</p>
                <p className="text-2xl font-bold text-orange-600">{acousticFeatures.energy.spectralCentroid} Hz</p>
              </div>
            </div>
          </div>
        )}

        {/* Unusual Findings Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Unusual Findings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unusualFindings.map((finding, index) => (
              <div
                key={index}
                className={`rounded-lg p-5 border-l-4 ${
                  finding.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : finding.severity === 'moderate'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{finding.category}</span>
                    <h4 className="text-lg font-bold text-gray-900">{finding.feature}</h4>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      finding.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : finding.severity === 'moderate'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {finding.severity.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Value:</span> {finding.value}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Normal Range:</span> {finding.normalRange}
                  </p>
                </div>
                <p className="text-sm text-gray-700">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total Features Extracted</p>
            <p className="text-4xl font-bold">32</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Linguistic Features</p>
            <p className="text-4xl font-bold">16</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Acoustic Features</p>
            <p className="text-4xl font-bold">16</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Unusual Findings</p>
            <p className="text-4xl font-bold">{unusualFindings.length}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureExtraction
