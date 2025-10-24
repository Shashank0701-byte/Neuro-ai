import { AlertTriangle, Target, TrendingDown, Clock, Brain, CheckCircle2 } from 'lucide-react'

const ProblemGoal = () => {
  const problems = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Delayed Diagnosis",
      description: "Average 3-7 year delay between symptom onset and diagnosis, missing critical intervention windows.",
      stat: "3-7 years"
    },
    {
      icon: <TrendingDown className="h-6 w-6" />,
      title: "Late-Stage Detection",
      description: "80% of brain function may be compromised by the time symptoms become noticeable.",
      stat: "80% loss"
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Limited Accessibility",
      description: "Traditional screening requires specialized clinics, trained professionals, and expensive equipment.",
      stat: "High barriers"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Subjective Methods",
      description: "Current assessments rely on subjective observations, leading to inconsistent results.",
      stat: "Inconsistent"
    }
  ]

  const goals = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Enable early detection before significant cognitive decline occurs"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Provide accessible screening from anywhere, anytime"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Deliver objective, AI-powered analysis with consistent accuracy"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Offer non-invasive assessment using only speech and text patterns"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      text: "Scale cognitive screening to reach millions globally"
    }
  ]

  return (
    <section id="problem-goal" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            The Challenge & Our Solution
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Addressing the Crisis in
            <span className="block text-red-600">Cognitive Health Screening</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Current approaches to cognitive decline detection are failing millions. 
            NeuroAid is revolutionizing early screening with AI-powered, accessible technology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Problem Section */}
          <div>
            <div className="flex items-center mb-8">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">The Problem</h3>
                <p className="text-gray-600">Current State of Cognitive Screening</p>
              </div>
            </div>

            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl border-2 border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-start">
                    <div className="bg-red-50 p-2 rounded-lg mr-4 flex-shrink-0">
                      <div className="text-red-600">
                        {problem.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{problem.title}</h4>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                          {problem.stat}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact Highlight */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-red-900 mb-2">Critical Impact</h4>
                  <p className="text-sm text-red-800 leading-relaxed">
                    Late-stage diagnosis severely limits treatment effectiveness, reduces quality of life, 
                    and places enormous burden on families and healthcare systems. Early intervention can 
                    slow decline by up to 40%, but only if detected in time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Section */}
          <div>
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-3 rounded-xl mr-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Our Goal</h3>
                <p className="text-gray-600">NeuroAid's Mission & Objectives</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl border-2 border-primary-200 mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Deliver a Reliable, Scalable, Non-Invasive Early Screening Tool
              </h4>
              <p className="text-gray-700 leading-relaxed mb-6">
                NeuroAid leverages cutting-edge artificial intelligence and natural language processing 
                to detect subtle cognitive changes through speech and text analysis—enabling early 
                intervention when it matters most.
              </p>
              
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <div 
                    key={index}
                    className="flex items-start bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="text-green-600 mr-3 flex-shrink-0 mt-0.5">
                      {goal.icon}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {goal.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Differentiators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-primary-200 text-center">
                <div className="text-3xl font-bold text-primary-600 mb-1">5-10 min</div>
                <div className="text-xs text-gray-600">Quick Assessment</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-secondary-200 text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-1">100%</div>
                <div className="text-xs text-gray-600">Non-Invasive</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-green-200 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
                <div className="text-xs text-gray-600">Accessible</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">AI-Powered</div>
                <div className="text-xs text-gray-600">Objective Analysis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-10 rounded-2xl shadow-xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Transform Cognitive Health Screening
          </h3>
          <p className="text-lg mb-8 max-w-3xl mx-auto opacity-95">
            Join us in making early cognitive screening accessible to everyone, everywhere. 
            Early detection saves lives and preserves quality of life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              Start Free Assessment
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-4 rounded-lg transition-all duration-300">
              Learn More About Our Technology
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemGoal
