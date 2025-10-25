import React, { useState } from 'react';
import { 
  Heart, 
  Brain, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  User,
  FileText,
  Star,
  ArrowRight
} from 'lucide-react';

interface ClinicalInsightsProps {
  explanation: any;
  config: any;
}

const ClinicalInsights: React.FC<ClinicalInsightsProps> = ({
  explanation,
  config
}) => {
  const [activeInsightTab, setActiveInsightTab] = useState('findings');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<number>>(new Set());

  const insightTabs = [
    { id: 'findings', label: 'Key Findings', icon: Brain },
    { id: 'clinical', label: 'Clinical Relevance', icon: Heart },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'interpretation', label: 'Interpretation', icon: MessageCircle }
  ];

  const toggleRecommendation = (index: number) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRecommendations(newExpanded);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'text-purple-600 bg-purple-100';
      case 'moderate': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderKeyFindings = () => (
    <div className="space-y-6">
      {/* Risk Assessment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-blue-900">Cognitive Assessment Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${
              explanation.riskScore >= 0.7 ? 'text-green-600' : 
              explanation.riskScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(explanation.riskScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Cognitive Health Score</div>
            <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
              explanation.riskScore >= 0.7 ? 'bg-green-100 text-green-700' : 
              explanation.riskScore >= 0.4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {explanation.riskScore >= 0.7 ? 'Low Risk' : 
               explanation.riskScore >= 0.4 ? 'Moderate Risk' : 'High Risk'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(explanation.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Model Confidence</div>
            <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
              explanation.confidence >= 0.8 ? 'bg-green-100 text-green-700' : 
              explanation.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {explanation.confidence >= 0.8 ? 'High Confidence' : 
               explanation.confidence >= 0.6 ? 'Moderate Confidence' : 'Low Confidence'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Object.keys(explanation.featureAttributions).length}
            </div>
            <div className="text-sm text-gray-600">Features Analyzed</div>
            <div className="text-xs mt-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Comprehensive Analysis
            </div>
          </div>
        </div>
      </div>

      {/* Key Findings List */}
      <div className="space-y-4">
        {explanation.insights.keyFindings.map((finding: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${getImportanceColor(finding.importance)}`}>
                {finding.importance === 'high' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : finding.importance === 'medium' ? (
                  <Info className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {finding.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(finding.importance)}`}>
                    {finding.importance} priority
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{finding.message}</p>
                {finding.feature && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-1" />
                    <span>Primary feature: <strong>{finding.feature}</strong></span>
                    {finding.impact && (
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        finding.impact === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {finding.impact} impact
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClinicalRelevance = () => (
    <div className="space-y-6">
      {explanation.insights.clinicalRelevance.map((relevance: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  {relevance.domain === 'cognitive_function' && <Brain className="h-5 w-5 text-blue-600" />}
                  {relevance.domain === 'language_function' && <MessageCircle className="h-5 w-5 text-blue-600" />}
                  {relevance.domain === 'speech_fluency' && <User className="h-5 w-5 text-blue-600" />}
                  {!['cognitive_function', 'language_function', 'speech_fluency'].includes(relevance.domain) && 
                    <Heart className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {relevance.domain.replace('_', ' ')}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getSignificanceColor(relevance.clinicalSignificance)}`}>
                    {relevance.clinicalSignificance} significance
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{relevance.message}</p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Clinical Recommendation</h4>
                  <p className="text-sm text-gray-700">{relevance.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      {explanation.insights.recommendations.map((recommendation: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getPriorityIcon(recommendation.priority)}
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    {recommendation.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.priority} priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleRecommendation(index)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {expandedRecommendations.has(index) ? 'Show Less' : 'Show More'}
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">{recommendation.message}</p>
            
            {recommendation.feature && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Target className="h-4 w-4 mr-1" />
                <span>Target feature: <strong>{recommendation.feature}</strong></span>
              </div>
            )}
            
            {expandedRecommendations.has(index) && recommendation.actionItems && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Action Items
                </h4>
                <ul className="space-y-2">
                  {recommendation.actionItems.map((action: string, actionIndex: number) => (
                    <li key={actionIndex} className="flex items-start text-sm text-blue-800">
                      <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInterpretation = () => (
    <div className="space-y-6">
      {/* Global Interpretation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Global Model Interpretation
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Feature Importance Ranking</h4>
              <div className="space-y-2">
                {Object.entries(explanation.interpretability.globalImportance)
                  .sort(([,a], [,b]) => (a as any).rank - (b as any).rank)
                  .slice(0, 5)
                  .map(([feature, importance]: [string, any]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">#{importance.rank} {feature}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${importance.percentageContribution}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {importance.percentageContribution.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Model Behavior</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                  <span>
                    {Object.values(explanation.featureAttributions).filter((attr: any) => attr.direction === 'positive').length} features 
                    contributed positively
                  </span>
                </div>
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
                  <span>
                    {Object.values(explanation.featureAttributions).filter((attr: any) => attr.direction === 'negative').length} features 
                    raised concerns
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>
                    Top feature contributed {Math.max(...Object.values(explanation.featureAttributions).map((attr: any) => attr.percentageContribution)).toFixed(1)}% 
                    to the decision
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local Explanation */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Local Prediction Explanation
          </h3>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{explanation.interpretability.localExplanation.summary}</p>
          </div>
          
          <h4 className="font-medium text-gray-900 mb-4">Feature Values & Impacts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(explanation.interpretability.localExplanation.featureValues)
              .slice(0, 8)
              .map(([feature, data]: [string, any]) => (
                <div key={feature} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{feature}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      data.impact === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {data.impact}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>Value: {typeof data.value === 'number' ? data.value.toFixed(3) : data.value}</div>
                    <div>SHAP: {data.shapValue.toFixed(4)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Uncertainty Analysis */}
      {explanation.interpretability.uncertaintyAnalysis && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Uncertainty Analysis
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Confidence Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Model Confidence</span>
                    <span className="font-medium">{(explanation.interpretability.uncertaintyAnalysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Uncertainty Level</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      explanation.interpretability.uncertaintyAnalysis.uncertaintyLevel === 'low' ? 'bg-green-100 text-green-700' :
                      explanation.interpretability.uncertaintyAnalysis.uncertaintyLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {explanation.interpretability.uncertaintyAnalysis.uncertaintyLevel}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Uncertainty Sources</h4>
                <ul className="space-y-2">
                  {explanation.interpretability.uncertaintyAnalysis.sources.map((source: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {explanation.interpretability.uncertaintyAnalysis.recommendations.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Recommendations to Reduce Uncertainty</h4>
                <ul className="space-y-1">
                  {explanation.interpretability.uncertaintyAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-yellow-800">
                      <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-yellow-600" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {insightTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInsightTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeInsightTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeInsightTab === 'findings' && renderKeyFindings()}
        {activeInsightTab === 'clinical' && renderClinicalRelevance()}
        {activeInsightTab === 'recommendations' && renderRecommendations()}
        {activeInsightTab === 'interpretation' && renderInterpretation()}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <User className="h-5 w-5 mr-2" />
            Schedule Follow-up
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <Clock className="h-5 w-5 mr-2" />
            Track Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalInsights;
