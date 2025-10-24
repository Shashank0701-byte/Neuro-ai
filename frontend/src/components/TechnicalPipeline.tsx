import { useState } from 'react'
import { 
  Mic, FileText, Brain, BarChart3, Eye, FileCheck, 
  ArrowRight, ArrowDown, Play, Pause, RotateCcw,
  Cpu, Database, Zap, Target, Shield,
  ChevronRight, Info, CheckCircle2
} from 'lucide-react'

const TechnicalPipeline = () => {
  const [activeModule, setActiveModule] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const modules = [
    {
      id: 1,
      title: "Speech Input",
      subtitle: "Audio Capture & Processing",
      icon: <Mic className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      position: { x: 0, y: 0 },
      description: "High-quality audio capture and preprocessing for optimal analysis",
      details: {
        overview: "Captures and preprocesses speech audio using advanced signal processing techniques to ensure optimal quality for downstream analysis.",
        technologies: [
          "WebRTC Audio API for real-time capture",
          "Noise reduction and echo cancellation",
          "Automatic gain control (AGC)",
          "Sample rate normalization to 16kHz",
          "Pre-emphasis filtering for speech enhancement"
        ],
        specifications: [
          "Sample Rate: 16kHz minimum",
          "Bit Depth: 16-bit PCM",
          "Channels: Mono preferred",
          "Duration: 30 seconds - 5 minutes",
          "Format: WAV, MP3, or real-time stream"
        ],
        outputs: ["Preprocessed audio signal", "Quality metrics", "Signal-to-noise ratio"]
      }
    },
    {
      id: 2,
      title: "Speech Transcription",
      subtitle: "Audio to Text Conversion",
      icon: <FileText className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      position: { x: 1, y: 0 },
      description: "Advanced ASR with timestamp alignment and confidence scoring",
      details: {
        overview: "Converts speech audio to text using state-of-the-art automatic speech recognition with precise timestamp alignment and confidence scoring.",
        technologies: [
          "Transformer-based ASR models (Whisper, Wav2Vec2)",
          "Language model integration for context",
          "Forced alignment for word-level timestamps",
          "Confidence score calculation",
          "Multi-language support with automatic detection"
        ],
        specifications: [
          "Accuracy: >95% for clear speech",
          "Latency: <2 seconds for real-time",
          "Languages: 50+ supported",
          "Word-level timestamps: ±50ms accuracy",
          "Confidence threshold: 0.7 minimum"
        ],
        outputs: ["Transcribed text", "Word timestamps", "Confidence scores", "Language detection"]
      }
    },
    {
      id: 3,
      title: "Feature Extraction",
      subtitle: "Multi-Modal Analysis",
      icon: <Brain className="h-8 w-8" />,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      position: { x: 0, y: 1 },
      description: "Extract 200+ linguistic, acoustic, and cognitive features",
      details: {
        overview: "Comprehensive feature extraction from both audio and text modalities, capturing subtle patterns indicative of cognitive changes.",
        technologies: [
          "Acoustic feature extraction (MFCC, spectral features)",
          "Prosodic analysis (pitch, rhythm, stress patterns)",
          "Linguistic feature extraction (complexity, fluency)",
          "Semantic analysis using transformer models",
          "Temporal pattern recognition"
        ],
        specifications: [
          "Acoustic features: 50+ (pitch, formants, spectral)",
          "Prosodic features: 30+ (rhythm, stress, intonation)",
          "Linguistic features: 80+ (complexity, fluency, coherence)",
          "Semantic features: 40+ (topic coherence, word associations)",
          "Processing time: <1 second per minute of audio"
        ],
        outputs: ["Feature vectors", "Acoustic measurements", "Linguistic metrics", "Semantic embeddings"]
      }
    },
    {
      id: 4,
      title: "AI Scoring Engine",
      subtitle: "Machine Learning Analysis",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      position: { x: 1, y: 1 },
      description: "Ensemble ML models for cognitive risk assessment",
      details: {
        overview: "Advanced machine learning ensemble that combines multiple specialized models to generate accurate cognitive risk scores with confidence intervals.",
        technologies: [
          "Ensemble of gradient boosting models (XGBoost, LightGBM)",
          "Deep neural networks for pattern recognition",
          "Transformer models for sequence analysis",
          "Bayesian inference for uncertainty quantification",
          "Cross-validation and model averaging"
        ],
        specifications: [
          "Model ensemble: 5+ specialized models",
          "Training data: 50,000+ validated assessments",
          "Accuracy: 87% sensitivity, 92% specificity",
          "Processing time: <500ms",
          "Confidence intervals: 95% coverage"
        ],
        outputs: ["Risk score (0-100)", "Domain-specific scores", "Confidence intervals", "Feature importance"]
      }
    },
    {
      id: 5,
      title: "Explainability Engine",
      subtitle: "Interpretable AI Results",
      icon: <Eye className="h-8 w-8" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      position: { x: 0, y: 2 },
      description: "SHAP-based explanations and clinical interpretability",
      details: {
        overview: "Provides transparent, interpretable explanations of AI decisions using advanced explainability techniques for clinical trust and understanding.",
        technologies: [
          "SHAP (SHapley Additive exPlanations) values",
          "LIME (Local Interpretable Model-agnostic Explanations)",
          "Feature importance ranking",
          "Clinical correlation mapping",
          "Natural language explanation generation"
        ],
        specifications: [
          "Explanation coverage: 100% of predictions",
          "Feature attribution: Individual and global",
          "Clinical mapping: Evidence-based correlations",
          "Visualization: Interactive charts and graphs",
          "Language: Plain English explanations"
        ],
        outputs: ["Feature importance scores", "Clinical explanations", "Visual summaries", "Recommendation basis"]
      }
    },
    {
      id: 6,
      title: "Results & Reports",
      subtitle: "Clinical-Grade Output",
      icon: <FileCheck className="h-8 w-8" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      position: { x: 1, y: 2 },
      description: "Comprehensive reports with actionable recommendations",
      details: {
        overview: "Generates comprehensive, clinical-grade reports with clear visualizations, actionable recommendations, and longitudinal tracking capabilities.",
        technologies: [
          "Dynamic report generation engine",
          "Interactive data visualization (D3.js, Chart.js)",
          "PDF generation with clinical formatting",
          "Longitudinal trend analysis",
          "Personalized recommendation engine"
        ],
        specifications: [
          "Report generation: <2 seconds",
          "Formats: PDF, interactive web, API JSON",
          "Visualizations: 10+ chart types",
          "Recommendations: Evidence-based, personalized",
          "Longitudinal tracking: Unlimited history"
        ],
        outputs: ["Comprehensive PDF report", "Interactive dashboard", "Trend analysis", "Clinical recommendations"]
      }
    }
  ]


  const startAnimation = () => {
    setIsAnimating(true)
    setCurrentStep(0)
    
    const animateStep = (step: number) => {
      if (step < modules.length) {
        setCurrentStep(step)
        setTimeout(() => animateStep(step + 1), 1500)
      } else {
        setIsAnimating(false)
        setCurrentStep(0)
      }
    }
    
    animateStep(0)
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentStep(0)
  }

  return (
    <section id="technical-pipeline" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
            <Cpu className="h-4 w-4 mr-2" />
            Technical Architecture
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            NeuroAid's AI Pipeline
            <span className="block text-indigo-600">From Speech to Insights</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Explore our sophisticated technical architecture that transforms speech patterns 
            into actionable cognitive health insights using cutting-edge AI and machine learning.
          </p>
          
          {/* Animation Controls */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isAnimating 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnimating ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isAnimating ? 'Processing...' : 'Start Pipeline Demo'}
            </button>
            <button
              onClick={resetAnimation}
              className="flex items-center px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative mb-20">
          
          {/* Desktop Grid Layout */}
          <div className="hidden lg:block">
            <div className="relative grid grid-cols-2 gap-8" style={{ minHeight: '800px' }}>
              
              {/* Modules */}
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`relative transition-all duration-500 transform ${
                    isAnimating && currentStep === index 
                      ? 'scale-105 ring-4 ring-indigo-300 shadow-2xl' 
                      : activeModule === module.id 
                        ? 'scale-102 shadow-xl' 
                        : 'hover:scale-102 hover:shadow-lg'
                  }`}
                  style={{
                    gridColumn: module.position.x + 1,
                    gridRow: module.position.y + 1
                  }}
                >
                  <div
                    className={`bg-white rounded-2xl border-2 ${module.borderColor} p-6 cursor-pointer transition-all duration-300 h-full ${
                      isAnimating && currentStep === index ? 'animate-pulse' : ''
                    }`}
                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-gradient-to-r ${module.color} text-white p-3 rounded-xl shadow-lg`}>
                        {module.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-500">MODULE {module.id}</div>
                        {isAnimating && currentStep === index && (
                          <div className="flex items-center text-green-600 text-xs mt-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Processing
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.subtitle}</p>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{module.description}</p>

                    {/* Expand/Collapse Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Click for details</span>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                        activeModule === module.id ? 'rotate-90' : ''
                      }`} />
                    </div>

                    {/* Expanded Details */}
                    {activeModule === module.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-indigo-600" />
                            Overview
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {module.details.overview}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Cpu className="h-4 w-4 mr-2 text-purple-600" />
                            Technologies
                          </h4>
                          <ul className="space-y-1">
                            {module.details.technologies.map((tech, techIndex) => (
                              <li key={techIndex} className="text-xs text-gray-600 flex items-start">
                                <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {tech}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-green-600" />
                            Specifications
                          </h4>
                          <ul className="space-y-1">
                            {module.details.specifications.map((spec, specIndex) => (
                              <li key={specIndex} className="text-xs text-gray-600 flex items-start">
                                <div className="w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {spec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-orange-600" />
                            Outputs
                          </h4>
                          <ul className="space-y-1">
                            {module.details.outputs.map((output, outputIndex) => (
                              <li key={outputIndex} className="text-xs text-gray-600 flex items-start">
                                <div className="w-1 h-1 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {output}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Data Flow Arrows */}
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {/* Horizontal arrows */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>
                
                {/* Module 1 to Module 2 */}
                <line x1="50%" y1="15%" x2="50%" y2="15%" 
                  stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)"
                  className={`transition-all duration-1000 ${
                    isAnimating && currentStep >= 1 ? 'opacity-100' : 'opacity-30'
                  }`} />
                
                {/* Module 3 to Module 4 */}
                <line x1="50%" y1="55%" x2="50%" y2="55%" 
                  stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)"
                  className={`transition-all duration-1000 ${
                    isAnimating && currentStep >= 3 ? 'opacity-100' : 'opacity-30'
                  }`} />
                
                {/* Module 5 to Module 6 */}
                <line x1="50%" y1="85%" x2="50%" y2="85%" 
                  stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)"
                  className={`transition-all duration-1000 ${
                    isAnimating && currentStep >= 5 ? 'opacity-100' : 'opacity-30'
                  }`} />
              </svg>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            {modules.map((module, index) => (
              <div key={module.id} className="relative">
                <div
                  className={`bg-white rounded-2xl border-2 ${module.borderColor} p-6 transition-all duration-300 ${
                    isAnimating && currentStep === index 
                      ? 'ring-4 ring-indigo-300 shadow-2xl' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${module.color} text-white p-3 rounded-xl`}>
                      {module.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-500">MODULE {module.id}</div>
                      {isAnimating && currentStep === index && (
                        <div className="flex items-center text-green-600 text-xs mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Processing
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{module.subtitle}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{module.description}</p>

                  {activeModule === module.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <p className="text-sm text-gray-600">{module.details.overview}</p>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Key Technologies</h5>
                          <div className="text-xs text-gray-600">
                            {module.details.technologies.slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Outputs</h5>
                          <div className="text-xs text-gray-600">
                            {module.details.outputs.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Arrow */}
                {index < modules.length - 1 && (
                  <div className="flex justify-center py-4">
                    <ArrowDown className={`h-6 w-6 text-indigo-600 transition-all duration-500 ${
                      isAnimating && currentStep > index ? 'opacity-100' : 'opacity-30'
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
            <div className="text-sm text-gray-600">Sensitivity</div>
            <div className="text-xs text-gray-500 mt-1">Clinical Validation</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-green-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Specificity</div>
            <div className="text-xs text-gray-500 mt-1">False Positive Rate</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">&lt;10s</div>
            <div className="text-sm text-gray-600">Processing Time</div>
            <div className="text-xs text-gray-500 mt-1">End-to-End Latency</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-orange-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
            <div className="text-sm text-gray-600">Features Extracted</div>
            <div className="text-xs text-gray-500 mt-1">Multi-Modal Analysis</div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Enterprise-Grade Architecture
            </h3>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Built for scale, security, and clinical reliability with industry-leading performance standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-3 text-blue-400" />
                <h4 className="font-semibold">Security & Compliance</h4>
              </div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• HIPAA & GDPR compliant</li>
                <li>• End-to-end encryption</li>
                <li>• SOC 2 Type II certified</li>
                <li>• Zero data retention policy</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                <h4 className="font-semibold">Performance</h4>
              </div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• 99.9% uptime SLA</li>
                <li>• Sub-second response times</li>
                <li>• Auto-scaling infrastructure</li>
                <li>• Global CDN deployment</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 mr-3 text-green-400" />
                <h4 className="font-semibold">Scalability</h4>
              </div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• Kubernetes orchestration</li>
                <li>• Microservices architecture</li>
                <li>• Horizontal auto-scaling</li>
                <li>• Multi-region deployment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TechnicalPipeline
