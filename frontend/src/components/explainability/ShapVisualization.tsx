import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Eye, 
  Download, 
  Maximize2, 
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

interface ShapVisualizationProps {
  explanation: any;
  selectedType: string;
  onTypeChange: (type: string) => void;
  config: any;
}

const ShapVisualization: React.FC<ShapVisualizationProps> = ({
  explanation,
  selectedType,
  onTypeChange,
  config
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const visualizationTypes = [
    {
      id: 'waterfall',
      name: 'Waterfall Plot',
      description: 'Shows how each feature contributes to the final prediction',
      icon: TrendingUp,
      interactive: false,
      format: 'png'
    },
    {
      id: 'bar',
      name: 'Feature Importance',
      description: 'Simple bar chart of feature importance rankings',
      icon: BarChart3,
      interactive: false,
      format: 'png'
    },
    {
      id: 'force',
      name: 'Force Plot',
      description: 'Interactive visualization showing feature impacts',
      icon: Zap,
      interactive: true,
      format: 'html'
    },
    {
      id: 'summary',
      name: 'Summary Plot',
      description: 'Overview of feature importance across predictions',
      icon: Eye,
      interactive: false,
      format: 'png'
    },
    {
      id: 'dependence',
      name: 'Dependence Plot',
      description: 'Shows how feature values affect predictions',
      icon: TrendingUp,
      interactive: false,
      format: 'png'
    }
  ];

  const currentVisualization = visualizationTypes.find(v => v.id === selectedType);
  const availableVisualizations = visualizationTypes.filter(v => 
    explanation.visualizations && explanation.visualizations[v.id]
  );

  const handleImageLoad = (type: string) => {
    setImageLoaded(prev => ({ ...prev, [type]: true }));
  };

  const handleImageError = (type: string) => {
    setImageLoaded(prev => ({ ...prev, [type]: false }));
    setError(`Failed to load ${type} visualization`);
  };

  const downloadVisualization = async (type: string) => {
    const visualization = explanation.visualizations[type];
    if (!visualization || !visualization.filename) return;

    try {
      const response = await fetch(`/api/explainability/visualization/${visualization.filename}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = visualization.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download visualization');
    }
  };

  const renderVisualization = () => {
    const visualization = explanation.visualizations[selectedType];
    
    if (!visualization) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Visualization not available</p>
            <p className="text-sm text-gray-500 mt-2">
              This visualization type was not generated for this explanation
            </p>
          </div>
        </div>
      );
    }

    if (visualization.status === 'failed') {
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">Visualization generation failed</p>
            <p className="text-sm text-red-500 mt-2">
              {visualization.error || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      );
    }

    if (visualization.status === 'pending') {
      return (
        <div className="flex items-center justify-center h-96 bg-blue-50 rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-blue-600">Generating visualization...</p>
            <p className="text-sm text-blue-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      );
    }

    // Render based on format
    if (visualization.format === 'html' && visualization.interactive) {
      return (
        <div className="relative">
          <iframe
            src={`/api/explainability/visualization/${visualization.filename}`}
            className="w-full h-96 border-0 rounded-lg"
            title={`${selectedType} visualization`}
            onLoad={() => handleImageLoad(selectedType)}
          />
          {!imageLoaded[selectedType] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
      );
    }

    // Default to image rendering
    return (
      <div className="relative">
        <img
          src={`/api/explainability/visualization/${visualization.filename}`}
          alt={`${selectedType} visualization`}
          className={`w-full h-auto rounded-lg shadow-sm ${
            config.visualizationSize === 'large' ? 'max-h-none' : 
            config.visualizationSize === 'small' ? 'max-h-64' : 'max-h-96'
          }`}
          onLoad={() => handleImageLoad(selectedType)}
          onError={() => handleImageError(selectedType)}
        />
        {!imageLoaded[selectedType] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-white p-8 overflow-auto' : ''}`}>
      {/* Visualization Type Selector */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">SHAP Visualizations</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadVisualization(selectedType)}
                className="btn-secondary"
                disabled={!explanation.visualizations[selectedType]}
                title="Download Visualization"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="btn-secondary"
                title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Type Selection Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {availableVisualizations.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              const visualization = explanation.visualizations[type.id];
              
              return (
                <button
                  key={type.id}
                  onClick={() => onTypeChange(type.id)}
                  className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!visualization || visualization.status === 'failed'}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.name}
                  {visualization?.status === 'pending' && (
                    <RefreshCw className="h-3 w-3 ml-2 animate-spin" />
                  )}
                  {visualization?.status === 'failed' && (
                    <AlertCircle className="h-3 w-3 ml-2 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Visualization Description */}
          {currentVisualization && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    {currentVisualization.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {currentVisualization.description}
                  </p>
                  {currentVisualization.interactive && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✨ This visualization is interactive - hover and click to explore
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Main Visualization */}
          <div className="visualization-container">
            {renderVisualization()}
          </div>

          {/* Visualization Metadata */}
          {explanation.visualizations[selectedType] && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Visualization Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">
                    {currentVisualization?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2 font-medium uppercase">
                    {explanation.visualizations[selectedType].format}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium capitalize ${
                    explanation.visualizations[selectedType].status === 'ready' ? 'text-green-600' :
                    explanation.visualizations[selectedType].status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {explanation.visualizations[selectedType].status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Interactive:</span>
                  <span className="ml-2 font-medium">
                    {currentVisualization?.interactive ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHAP Values Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SHAP Values Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Base Value</div>
              <div className="text-xl font-semibold text-gray-900">
                {explanation.baseValue.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Expected model output
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Prediction</div>
              <div className="text-xl font-semibold text-gray-900">
                {explanation.riskScore.toFixed(3)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Actual model output
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Impact</div>
              <div className={`text-xl font-semibold ${
                (explanation.riskScore - explanation.baseValue) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(explanation.riskScore - explanation.baseValue > 0 ? '+' : '') + 
                 (explanation.riskScore - explanation.baseValue).toFixed(3)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Difference from baseline
              </div>
            </div>
          </div>

          {/* Top Contributing Features */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">Top Contributing Features</h4>
            <div className="space-y-3">
              {Object.entries(explanation.shapValues)
                .sort(([,a], [,b]) => Math.abs(b as number) - Math.abs(a as number))
                .slice(0, 8)
                .map(([feature, value]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {feature}
                    </span>
                    <div className="flex items-center ml-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            (value as number) > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(value as number) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-16 text-right ${
                        (value as number) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(value as number) > 0 ? '+' : ''}{(value as number).toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details (if enabled) */}
      {config.showTechnicalDetails && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Technical Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Model Information</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Model Type:</dt>
                    <dd className="font-medium">{explanation.metadata?.modelType || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Processing Time:</dt>
                    <dd className="font-medium">
                      {explanation.metadata?.processingTime?.toFixed(2) || 'N/A'}s
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Feature Count:</dt>
                    <dd className="font-medium">{explanation.metadata?.featureCount || 0}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">SHAP Configuration</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Explainer Type:</dt>
                    <dd className="font-medium">TreeExplainer</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Visualization Types:</dt>
                    <dd className="font-medium">{availableVisualizations.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Generated:</dt>
                    <dd className="font-medium">
                      {new Date(explanation.timestamp).toLocaleTimeString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapVisualization;
