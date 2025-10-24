import { useState } from 'react'
import { 
  Mic, Brain, FileCheck, ArrowRight, ChevronDown, ChevronUp,
  UserCircle, Shield, Headphones, MessageSquare, PenTool, Sparkles,
  BarChart3, TrendingUp, FileText, Clock, CheckCircle2, AlertCircle
} from 'lucide-react'

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState<number | null>(0)

  const steps = [
    {
      id: 1,
      icon: <UserCircle className="h-8 w-8" />,
      title: "Registration & Setup",
      shortDesc: "Quick account creation and personalized profile setup",
      duration: "2 minutes",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      details: {
        overview: "Begin your cognitive health journey with a simple, secure registration process. We collect only essential information to personalize your assessment experience.",
        substeps: [
          {
            icon: <UserCircle className="h-5 w-5" />,
            title: "Create Account",
            description: "Sign up with email or social login. All data is encrypted and HIPAA-compliant."
          },
          {
            icon: <Shield className="h-5 w-5" />,
            title: "Privacy Consent",
            description: "Review and accept our privacy policy. Your data is never shared without explicit consent."
          },
          {
            icon: <FileText className="h-5 w-5" />,
            title: "Basic Profile",
            description: "Provide age, language preference, and optional demographic information for personalized analysis."
          }
        ],
        technicalDetails: [
          "End-to-end encryption for all user data",
          "HIPAA and GDPR compliant data handling",
          "Secure OAuth 2.0 authentication",
          "Anonymous data processing options available"
        ]
      }
    },
    {
      id: 2,
      icon: <Mic className="h-8 w-8" />,
      title: "Speech Analysis Tasks",
      shortDesc: "Guided speaking exercises to capture vocal and linguistic patterns",
      duration: "3-4 minutes",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      details: {
        overview: "Complete a series of carefully designed speech tasks that capture subtle cognitive markers through your voice, speech patterns, and language use.",
        substeps: [
          {
            icon: <Headphones className="h-5 w-5" />,
            title: "Audio Setup",
            description: "Quick microphone test to ensure clear audio capture. Works with any device microphone."
          },
          {
            icon: <MessageSquare className="h-5 w-5" />,
            title: "Picture Description",
            description: "Describe a series of images in detail. Captures vocabulary richness and narrative coherence."
          },
          {
            icon: <Clock className="h-5 w-5" />,
            title: "Fluency Tasks",
            description: "Speak continuously on given topics. Analyzes speech rate, pauses, and word retrieval patterns."
          },
          {
            icon: <Brain className="h-5 w-5" />,
            title: "Memory Recall",
            description: "Listen to a short story and retell it. Evaluates working memory and comprehension."
          }
        ],
        technicalDetails: [
          "Analyzes 50+ acoustic features (pitch, rhythm, pauses)",
          "Natural Language Processing for semantic analysis",
          "Detects hesitations, word-finding difficulties, and repetitions",
          "Compares patterns against age-matched normative data"
        ]
      }
    },
    {
      id: 3,
      icon: <PenTool className="h-8 w-8" />,
      title: "Text & Writing Tasks",
      shortDesc: "Written exercises to evaluate language complexity and coherence",
      duration: "2-3 minutes",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      details: {
        overview: "Engage in brief writing tasks that reveal cognitive patterns through text structure, vocabulary choice, and linguistic complexity.",
        substeps: [
          {
            icon: <PenTool className="h-5 w-5" />,
            title: "Sentence Completion",
            description: "Complete partial sentences. Assesses language processing and contextual understanding."
          },
          {
            icon: <FileText className="h-5 w-5" />,
            title: "Short Essay",
            description: "Write a brief paragraph on a familiar topic. Evaluates coherence and organization."
          },
          {
            icon: <MessageSquare className="h-5 w-5" />,
            title: "Word Association",
            description: "Type words related to given prompts. Measures semantic memory and processing speed."
          }
        ],
        technicalDetails: [
          "Analyzes vocabulary diversity and complexity",
          "Evaluates grammatical structure and syntax",
          "Measures semantic coherence and topic maintenance",
          "Detects spelling errors and typing patterns"
        ]
      }
    },
    {
      id: 4,
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      shortDesc: "Advanced machine learning algorithms process your data",
      duration: "1-2 minutes",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      details: {
        overview: "Our proprietary AI models analyze your speech and text data using state-of-the-art machine learning techniques trained on extensive cognitive health datasets.",
        substeps: [
          {
            icon: <Sparkles className="h-5 w-5" />,
            title: "Feature Extraction",
            description: "Extract 200+ linguistic, acoustic, and cognitive markers from your responses."
          },
          {
            icon: <Brain className="h-5 w-5" />,
            title: "Neural Network Processing",
            description: "Deep learning models identify subtle patterns associated with cognitive changes."
          },
          {
            icon: <BarChart3 className="h-5 w-5" />,
            title: "Risk Calculation",
            description: "Compare your patterns against validated normative databases for age and demographics."
          },
          {
            icon: <TrendingUp className="h-5 w-5" />,
            title: "Confidence Scoring",
            description: "Generate confidence intervals and reliability metrics for transparent results."
          }
        ],
        technicalDetails: [
          "Transformer-based language models (BERT, GPT architecture)",
          "Ensemble of multiple specialized AI models",
          "Trained on 50,000+ validated cognitive assessments",
          "Continuous learning from anonymized user data",
          "Cross-validated accuracy: 87% sensitivity, 92% specificity"
        ]
      }
    },
    {
      id: 5,
      icon: <FileCheck className="h-8 w-8" />,
      title: "Results & Recommendations",
      shortDesc: "Comprehensive cognitive risk score with personalized insights",
      duration: "Immediate",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      details: {
        overview: "Receive a detailed, easy-to-understand report with your cognitive risk score, key findings, and personalized recommendations for next steps.",
        substeps: [
          {
            icon: <BarChart3 className="h-5 w-5" />,
            title: "Risk Score",
            description: "Clear numerical score (0-100) indicating cognitive health status with visual indicators."
          },
          {
            icon: <TrendingUp className="h-5 w-5" />,
            title: "Domain Breakdown",
            description: "Detailed scores across memory, language, attention, and executive function domains."
          },
          {
            icon: <AlertCircle className="h-5 w-5" />,
            title: "Key Findings",
            description: "Highlighted areas of strength and potential concern with plain-language explanations."
          },
          {
            icon: <CheckCircle2 className="h-5 w-5" />,
            title: "Next Steps",
            description: "Personalized recommendations: lifestyle changes, follow-up timing, or clinical referral."
          },
          {
            icon: <FileText className="h-5 w-5" />,
            title: "Downloadable Report",
            description: "PDF report you can share with healthcare providers or keep for your records."
          }
        ],
        technicalDetails: [
          "Results compared to age-matched normative data",
          "Confidence intervals provided for all scores",
          "Longitudinal tracking for repeat assessments",
          "Secure portal for accessing historical results",
          "Optional: Direct sharing with healthcare providers"
        ]
      }
    }
  ]

  const toggleStep = (index: number) => {
    setActiveStep(activeStep === index ? null : index)
  }

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
            <Brain className="h-4 w-4 mr-2" />
            The NeuroAid Process
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How NeuroAid Works
            <span className="block text-primary-600">From Input to Insights</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our streamlined, scientifically-validated process takes you from initial assessment 
            to comprehensive cognitive risk score in just 10-15 minutes.
          </p>
        </div>

        {/* Timeline Overview - Desktop */}
        <div className="hidden lg:block mb-20">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>
            
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                  <button
                    onClick={() => toggleStep(index)}
                    className={`bg-gradient-to-r ${step.color} text-white p-4 rounded-full mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative z-10`}
                  >
                    {step.icon}
                  </button>
                  <div className="text-center px-2">
                    <div className="font-bold text-gray-900 text-sm mb-1">Step {step.id}</div>
                    <div className="text-xs text-gray-600 font-medium">{step.title}</div>
                    <div className="text-xs text-primary-600 mt-1 flex items-center justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Accordion Steps */}
        <div className="space-y-4 mb-16">
          {steps.map((step, index) => (
            <div key={step.id} className={`bg-white rounded-2xl border-2 ${activeStep === index ? step.borderColor : 'border-gray-200'} overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg`}>
              
              {/* Step Header - Clickable */}
              <button
                onClick={() => toggleStep(index)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`bg-gradient-to-r ${step.color} text-white p-3 rounded-xl shadow-md`}>
                    {step.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xs font-bold text-gray-500">STEP {step.id}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${step.bgColor} text-gray-700`}>
                        {step.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.shortDesc}</p>
                  </div>
                </div>
                <div className="ml-4">
                  {activeStep === index ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {activeStep === index && (
                <div className={`${step.bgColor} border-t-2 ${step.borderColor}`}>
                  <div className="p-8">
                    
                    {/* Overview */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Overview</h4>
                      <p className="text-gray-700 leading-relaxed">{step.details.overview}</p>
                    </div>

                    {/* Substeps */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">What Happens</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {step.details.substeps.map((substep, subIndex) => (
                          <div key={subIndex} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start space-x-3">
                              <div className={`bg-gradient-to-r ${step.color} text-white p-2 rounded-lg flex-shrink-0`}>
                                {substep.icon}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-1">{substep.title}</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">{substep.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
                        Technical Details
                      </h4>
                      <ul className="space-y-2">
                        {step.details.technicalDetails.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Time Summary */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-8 rounded-2xl shadow-xl mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 mr-3" />
              <h3 className="text-3xl font-bold">Total Time: 10-15 Minutes</h3>
            </div>
            <p className="text-lg opacity-95 max-w-3xl mx-auto">
              Complete your comprehensive cognitive screening in less time than it takes to make a cup of coffee. 
              Results are available immediately upon completion.
            </p>
          </div>
        </div>

        {/* Scientific Validation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border-2 border-primary-200 shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-primary-100 p-3 rounded-xl mr-4">
                <Brain className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Scientifically Validated</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our assessment methodology is based on peer-reviewed research in cognitive neuroscience 
              and has been validated against traditional cognitive screening tools like MMSE and MoCA.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Published in leading neuroscience journals</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Validated across diverse populations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Continuous improvement through research</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-secondary-200 shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-secondary-100 p-3 rounded-xl mr-4">
                <Shield className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Privacy & Security</h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your data security and privacy are our top priorities. We employ industry-leading 
              security measures and comply with all healthcare data regulations.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">HIPAA and GDPR compliant</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">End-to-end encryption</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">You control your data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="btn-primary text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300">
            Start Your Assessment Now
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </button>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Takes 10-15 minutes • Immediate results</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
