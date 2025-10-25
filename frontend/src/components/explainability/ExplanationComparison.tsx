import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  BarChart3, 
  Calendar,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight,
  Minus,
  Search,
  Filter
} from 'lucide-react';

interface ExplanationComparisonProps {
  currentExplanation: any;
  comparisonExplanations: any[];
  onAddComparison: (explanations: any[]) => void;
}

const ExplanationComparison: React.FC<ExplanationComparisonProps> = ({
  currentExplanation,
  comparisonExplanations,
  onAddComparison
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableExplanations, setAvailableExplanations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [selectedExplanations, setSelectedExplanations] = useState<string[]>([]);

  // Load available explanations for comparison
  useEffect(() => {
    loadAvailableExplanations();
  }, []);

  // Generate comparison when explanations change
  useEffect(() => {
    if (comparisonExplanations.length > 0) {
      generateComparison();
    }
  }, [comparisonExplanations, currentExplanation]);

  const loadAvailableExplanations = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate with mock data
      const mockExplanations = [
        {
          explanationId: 'exp-001',
          timestamp: '2024-10-25T10:30:00Z',
          riskScore: 0.75,
          confidence: 0.88,
          patientId: 'patient-123'
        },
        {
          explanationId: 'exp-002',
          timestamp: '2024-10-24T14:15:00Z',
          riskScore: 0.68,
          confidence: 0.82,
          patientId: 'patient-123'
        },
        {
          explanationId: 'exp-003',
          timestamp: '2024-10-23T09:45:00Z',
          riskScore: 0.72,
          confidence: 0.85,
          patientId: 'patient-123'
        }
      ];
      setAvailableExplanations(mockExplanations);
    } catch (error) {
      console.error('Failed to load available explanations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComparison = async () => {
    if (comparisonExplanations.length === 0) return;

    setLoading(true);
    try {
      const explanationIds = [currentExplanation.explanationId, ...comparisonExplanations.map(e => e.explanationId)];
      
      const response = await fetch('/api/explainability/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          explanationIds,
          options: {
            includeFeatureConsistency: true,
            includeTrendAnalysis: true
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setComparisonData(data.data.comparison);
      }
    } catch (error) {
      console.error('Failed to generate comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExplanationToComparison = (explanation: any) => {
    if (!comparisonExplanations.find(e => e.explanationId === explanation.explanationId)) {
      const updated = [...comparisonExplanations, explanation];
      onAddComparison(updated);
    }
  };

  const removeExplanationFromComparison = (explanationId: string) => {
    const updated = comparisonExplanations.filter(e => e.explanationId !== explanationId);
    onAddComparison(updated);
  };

  const filteredExplanations = availableExplanations.filter(exp =>
    exp.explanationId !== currentExplanation.explanationId &&
    !comparisonExplanations.find(comp => comp.explanationId === exp.explanationId) &&
    (searchTerm === '' || exp.explanationId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allExplanations = [currentExplanation, ...comparisonExplanations];

  const renderComparisonOverview = () => {
    if (!comparisonData) return null;

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Comparison Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Risk Score Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {comparisonData.riskScores.trend === 'improving' ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : comparisonData.riskScores.trend === 'declining' ? (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                ) : (
                  <Minus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {comparisonData.riskScores.trend}
              </div>
              <div className="text-sm text-gray-600">Risk Trend</div>
              <div className="text-xs text-gray-500 mt-1">
                Range: {(comparisonData.riskScores.range * 100).toFixed(1)}%
              </div>
            </div>

            {/* Average Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(comparisonData.riskScores.average * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-xs text-gray-500 mt-1">
                Across {comparisonData.explanationCount} assessments
              </div>
            </div>

            {/* Feature Consistency */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(comparisonData.featureConsistency || {})
                  .filter((f: any) => f.consistency === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Consistent Features</div>
              <div className="text-xs text-gray-500 mt-1">
                High consistency across assessments
              </div>
            </div>

            {/* Time Range */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil((new Date(comparisonData.timeRange.latest).getTime() - 
                           new Date(comparisonData.timeRange.earliest).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Days Span</div>
              <div className="text-xs text-gray-500 mt-1">
                Assessment period
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeatureConsistency = () => {
    if (!comparisonData?.featureConsistency) return null;

    const consistentFeatures = Object.entries(comparisonData.featureConsistency)
      .filter(([, data]: [string, any]) => data.consistency === 'high')
      .sort(([,a], [,b]) => Math.abs(b.averageShapValue) - Math.abs(a.averageShapValue));

    const inconsistentFeatures = Object.entries(comparisonData.featureConsistency)
      .filter(([, data]: [string, any]) => data.consistency === 'low')
      .sort(([,a], [,b]) => b.variance - a.variance);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consistent Features */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Consistent Features
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {consistentFeatures.slice(0, 8).map(([feature, data]: [string, any]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{feature}</div>
                    <div className="text-sm text-gray-500">
                      Present in {data.presentInCount}/{comparisonData.explanationCount} assessments
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      data.averageShapValue > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.averageShapValue > 0 ? '+' : ''}{data.averageShapValue.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                      σ² = {data.variance.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variable Features */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              Variable Features
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {inconsistentFeatures.slice(0, 8).map(([feature, data]: [string, any]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{feature}</div>
                    <div className="text-sm text-gray-500">
                      High variability across assessments
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-yellow-600">
                      ±{Math.sqrt(data.variance).toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                      σ² = {data.variance.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScoreComparison = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Score Comparison</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {allExplanations.map((explanation, index) => (
            <div key={explanation.explanationId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  index === 0 ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">
                    {index === 0 ? 'Current Assessment' : `Assessment ${index}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(explanation.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    explanation.riskScore >= 0.7 ? 'text-green-600' : 
                    explanation.riskScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(explanation.riskScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Risk Score</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {(explanation.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                
                {index > 0 && (
                  <button
                    onClick={() => removeExplanationFromComparison(explanation.explanationId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => {
    if (!comparisonData?.insights) return null;

    return (
      <div className="space-y-6">
        {/* Common Patterns */}
        {comparisonData.insights.commonPatterns.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Target className="h-5 w-5 text-green-500 mr-2" />
                Common Patterns
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comparisonData.insights.commonPatterns.map((pattern: any, index: number) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">
                          {pattern.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-green-800 mb-2">{pattern.message}</p>
                        {pattern.features && (
                          <div className="flex flex-wrap gap-2">
                            {pattern.features.map((feature: any, fIndex: number) => (
                              <span key={fIndex} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {feature.name}: {feature.avgImpact.toFixed(3)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Differences */}
        {comparisonData.insights.differences.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                Notable Differences
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comparisonData.insights.differences.map((difference: any, index: number) => (
                  <div key={index} className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">
                          {difference.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-yellow-800 mb-2">{difference.message}</p>
                        {difference.features && (
                          <div className="flex flex-wrap gap-2">
                            {difference.features.map((feature: any, fIndex: number) => (
                              <span key={fIndex} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                {feature.name}: σ² = {feature.variance.toFixed(4)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {comparisonData.insights.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                Recommendations
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comparisonData.insights.recommendations.map((recommendation: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          {recommendation.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-blue-800 mb-2">{recommendation.message}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {recommendation.priority} priority
                        </span>
                        {recommendation.actions && (
                          <div className="mt-2">
                            <ul className="space-y-1">
                              {recommendation.actions.map((action: string, aIndex: number) => (
                                <li key={aIndex} className="flex items-start text-sm text-blue-700">
                                  <ArrowRight className="h-3 w-3 mr-2 mt-1" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add Comparison Controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Assessments for Comparison</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by assessment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={loadAvailableExplanations}
              className="btn-secondary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExplanations.map((explanation) => (
              <div key={explanation.explanationId} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {explanation.explanationId.slice(0, 8)}...
                  </div>
                  <button
                    onClick={() => addExplanationToComparison(explanation)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Score: {(explanation.riskScore * 100).toFixed(0)}%</div>
                  <div>Confidence: {(explanation.confidence * 100).toFixed(0)}%</div>
                  <div>{new Date(explanation.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredExplanations.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No additional assessments available for comparison
            </div>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonExplanations.length > 0 && (
        <>
          {renderComparisonOverview()}
          {renderScoreComparison()}
          {renderFeatureConsistency()}
          {renderInsights()}
        </>
      )}

      {comparisonExplanations.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparisons Yet</h3>
          <p className="text-gray-600">
            Add other assessments to compare features, trends, and patterns over time.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplanationComparison;
