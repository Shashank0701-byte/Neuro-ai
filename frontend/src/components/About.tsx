import { TrendingUp, Globe, Clock, Users, Brain, AlertTriangle, Target, Heart } from 'lucide-react'

const About = () => {
  const statistics = [
    {
      icon: <Users className="h-8 w-8" />,
      number: "55M+",
      label: "People living with dementia worldwide",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      number: "10M",
      label: "New cases diagnosed every year",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      number: "$1.3T",
      label: "Annual global cost of dementia care",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      number: "3-7 years",
      label: "Average delay in diagnosis",
      color: "from-blue-500 to-blue-600"
    }
  ]

  const challenges = [
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Late Detection",
      description: "Most cognitive decline is detected only after significant symptoms appear, missing crucial early intervention opportunities."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Limited Access",
      description: "Traditional screening requires specialized clinics and trained professionals, creating barriers for many communities."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Subjective Assessment",
      description: "Current methods rely heavily on subjective observations, leading to inconsistent and delayed diagnoses."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Family Impact",
      description: "Delayed diagnosis affects not just patients but entire families, limiting time for planning and intervention."
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
            <Brain className="h-4 w-4 mr-2" />
            About NeuroAid
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transforming Cognitive Health
            <span className="block text-primary-600">Through Early Detection</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Cognitive decline affects millions worldwide, yet early detection remains one of healthcare's 
            greatest challenges. NeuroAid is revolutionizing this landscape with AI-powered screening 
            that makes early intervention possible for everyone.
          </p>
        </div>

        {/* Global Impact Statistics */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            The Global Challenge
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-all duration-300">
                <div className={`bg-gradient-to-r ${stat.color} text-white p-3 rounded-full w-fit mx-auto mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The Problem */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                The Challenge We Face
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Dementia and cognitive decline represent one of the most pressing health challenges of our time. 
                With an aging global population, the number of affected individuals is expected to triple by 2050.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Yet despite advances in medical science, early detection remains elusive. Traditional screening 
                methods are often inaccessible, expensive, and detect changes only after significant cognitive 
                decline has already occurred.
              </p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Critical Gap</span>
                </div>
                <p className="text-red-700 text-sm">
                  By the time symptoms are noticeable, up to 80% of brain function may already be compromised, 
                  severely limiting treatment options and quality of life improvements.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {challenges.map((challenge, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="text-red-600 mb-3">
                    {challenge.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{challenge.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                The Power of Early Intervention
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Research consistently shows that early detection and intervention can significantly improve 
                outcomes for individuals with cognitive decline. When identified in the earliest stages, 
                interventions can:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Slow cognitive decline by up to 40% with lifestyle interventions</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Enable better treatment planning and medication effectiveness</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Provide families time to plan and adapt support systems</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Maintain independence and quality of life for longer periods</span>
                </li>
              </ul>
            </div>
            <div className="lg:order-1">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-2xl border border-primary-200">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full w-fit mx-auto mb-4">
                    <Brain className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">NeuroAid's Mission</h4>
                  <p className="text-gray-600">
                    Making early cognitive screening accessible to everyone, everywhere
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <Target className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Accessible Screening</div>
                        <div className="text-sm text-gray-600">No clinic visits or special equipment needed</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-secondary-100 p-2 rounded-lg mr-3">
                        <Clock className="h-5 w-5 text-secondary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Early Detection</div>
                        <div className="text-sm text-gray-600">Identify changes before symptoms appear</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Better Outcomes</div>
                        <div className="text-sm text-gray-600">Enable timely intervention and support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-gray-50 to-white p-12 rounded-2xl border border-gray-200">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Join the Fight Against Cognitive Decline
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Every day matters when it comes to brain health. Take the first step towards proactive 
            cognitive care with NeuroAid's revolutionary screening technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Start Your Assessment
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn About Our Research
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
