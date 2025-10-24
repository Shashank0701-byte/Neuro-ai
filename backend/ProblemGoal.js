// Missing ProblemGoal component - creating it based on the import in App.tsx

const ProblemGoal = () => {
  return (
    <section id="problem-goal" className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            The Challenge
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Silent Crisis of
            <span className="block text-red-600">Cognitive Decline</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Millions suffer from undetected cognitive decline while traditional screening 
            methods remain inaccessible, expensive, and often too late.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="bg-white p-8 rounded-2xl border-2 border-red-200 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">The Problem</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Late detection when 80% of brain function is already compromised</span>
              </div>
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Limited access to specialized cognitive screening facilities</span>
              </div>
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Expensive and time-consuming traditional assessments</span>
              </div>
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Subjective evaluations leading to inconsistent results</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Our Goal</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Early detection before symptoms become apparent</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Accessible screening from any device, anywhere</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Affordable and quick 10-minute assessments</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Objective AI-powered analysis with consistent results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemGoal
