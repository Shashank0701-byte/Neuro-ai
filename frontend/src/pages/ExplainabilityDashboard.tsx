import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Filter,
  Maximize2,
  Share2
} from 'lucide-react';
import ShapVisualization from '../components/explainability/ShapVisualization';
import FeatureAttributions from '../components/explainability/FeatureAttributions';
import ClinicalInsights from '../components/explainability/ClinicalInsights';
import ExplanationComparison from '../components/explainability/ExplanationComparison';
import ExplainabilityControls from '../components/explainability/ExplainabilityControls';
import LoadingSpinner from '../components/LoadingSpinner';

interface ExplanationData {
  explanationId: string;
  timestamp: string;
  riskScore: number;
  confidence: number;
  shapValues: Record<string, number>;
  featureAttributions: Record<string, any>;
  visualizations: Record<string, any>;
  insights: {
    topPositiveFeatures: any[];
    topNegativeFeatures: any[];
    keyFindings: any[];
    clinicalRelevance: any[];
    recommendations: any[];
  };
  interpretability: {
    globalImportance: Record<string, any>;
    localExplanation: any;
    uncertaintyAnalysis: any;
  };
}

const ExplainabilityDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVisualization, setSelectedVisualization] = useState('waterfall');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonExplanations, setComparisonExplanations] = useState<ExplanationData[]>([]);
  
  // Dashboard configuration
  const [dashboardConfig, setDashboardConfig] = useState({
    showTechnicalDetails: false,
    autoRefresh: false,
    refreshInterval: 30000,
    visualizationSize: 'medium',
    clinicalFocus: true
  });

  // Get explanation ID from URL params
  const explanationId = searchParams.get('explanationId');
  const scoringId = searchParams.get('scoringId');
  const mode = searchParams.get('mode') || 'single';

  useEffect(() => {
    if (explanationId) {
      loadExplanation(explanationId);
    } else if (scoringId) {
      generateExplanationFromScore(scoringId);
    }
  }, [explanationId, scoringId]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (dashboardConfig.autoRefresh && explanationId) {
      interval = setInterval(() => {
        loadExplanation(explanationId);
      }, dashboardConfig.refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dashboardConfig.autoRefresh, dashboardConfig.refreshInterval, explanationId]);

  const loadExplanation = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/explainability/explanation/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setExplanation(data.data);
      } else {
        setError(data.message || 'Failed to load explanation');
      }
    } catch (err) {
      setError('Network error while loading explanation');
      console.error('Explanation loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateExplanationFromScore = async (scoreId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/explainability/explain-score/${scoreId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            types: ['waterfall', 'bar', 'force', 'summary'],
            includeVisualizations: true
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setExplanation(data.data);
        // Update URL with new explanation ID
        navigate(`/explainability?explanationId=${data.data.explanationId}`, { replace: true });
      } else {
        setError(data.message || 'Failed to generate explanation');
      }
    } catch (err) {
      setError('Network error while generating explanation');
      console.error('Explanation generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'png' | 'json') => {
    if (!explanation) return;
    
    try {
      if (format === 'json') {
        // Export explanation data as JSON
        const dataStr = JSON.stringify(explanation, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `explanation_${explanation.explanationId}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // For PDF/PNG, we would implement a more complex export system
        // This is a placeholder for the actual implementation
        console.log(`Exporting as ${format}...`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export explanation');
    }
  };

  const handleShare = async () => {
    if (!explanation) return;
    
    try {
      const shareUrl = `${window.location.origin}/explainability?explanationId=${explanation.explanationId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Cognitive Model Explanation',
          text: 'View this cognitive health assessment explanation',
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // You could show a toast notification here
        console.log('Share URL copied to clipboard');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3 },
    { id: 'features', label: 'Feature Analysis', icon: Brain },
    { id: 'insights', label: 'Clinical Insights', icon: Info },
    { id: 'comparison', label: 'Comparison', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">
            {explanationId ? 'Loading explanation...' : 'Generating SHAP explanation...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Explanation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Explanation Available</h2>
          <p className="text-gray-600 mb-4">
            Please provide an explanation ID or scoring ID to view the dashboard.
          </p>
          <button
            onClick={() => navigate('/cognitive-scoring')}
            className="btn-primary"
          >
            Go to Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Model Explainability Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Understanding cognitive health predictions
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Dashboard Controls */}
              <ExplainabilityControls
                config={dashboardConfig}
                onConfigChange={setDashboardConfig}
              />
              
              {/* Action Buttons */}
              <button
                onClick={() => handleExport('json')}
                className="btn-secondary"
                title="Export Data"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleShare}
                className="btn-secondary"
                title="Share Explanation"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => explanationId && loadExplanation(explanationId)}
                className="btn-secondary"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Summary Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  explanation.riskScore >= 0.7 ? 'bg-green-500' : 
                  explanation.riskScore >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-900">
                  Risk Score: {(explanation.riskScore * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Confidence: {(explanation.confidence * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                Generated: {new Date(explanation.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              ID: {explanation.explanationId.slice(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    explanation.riskScore >= 0.7 ? 'bg-green-100' : 
                    explanation.riskScore >= 0.4 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Brain className={`h-6 w-6 ${
                      explanation.riskScore >= 0.7 ? 'text-green-600' : 
                      explanation.riskScore >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cognitive Health</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(explanation.riskScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Model Confidence</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(explanation.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Key Features</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Object.keys(explanation.featureAttributions).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Key Findings</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {explanation.insights.keyFindings.slice(0, 3).map((finding, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        finding.importance === 'high' ? 'bg-red-500' :
                        finding.importance === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{finding.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {finding.type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Features Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Positive Features</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {explanation.insights.topPositiveFeatures.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {feature.feature}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${feature.contribution}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {feature.contribution.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Areas for Attention</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {explanation.insights.topNegativeFeatures.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {feature.feature}
                        </span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${Math.abs(feature.contribution)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.abs(feature.contribution).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visualizations' && (
          <ShapVisualization
            explanation={explanation}
            selectedType={selectedVisualization}
            onTypeChange={setSelectedVisualization}
            config={dashboardConfig}
          />
        )}

        {activeTab === 'features' && (
          <FeatureAttributions
            explanation={explanation}
            config={dashboardConfig}
          />
        )}

        {activeTab === 'insights' && (
          <ClinicalInsights
            explanation={explanation}
            config={dashboardConfig}
          />
        )}

        {activeTab === 'comparison' && (
          <ExplanationComparison
            currentExplanation={explanation}
            comparisonExplanations={comparisonExplanations}
            onAddComparison={setComparisonExplanations}
          />
        )}
      </div>
    </div>
  );
};

export default ExplainabilityDashboard;
