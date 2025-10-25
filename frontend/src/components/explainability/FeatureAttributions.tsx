import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  MessageSquare, 
  BarChart3,
  Filter,
  Search,
  ArrowUpDown,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

interface FeatureAttributionsProps {
  explanation: any;
  config: any;
}

const FeatureAttributions: React.FC<FeatureAttributionsProps> = ({
  explanation,
  config
}) => {
  const [sortBy, setSortBy] = useState<'importance' | 'alphabetical' | 'contribution'>('importance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlySignificant, setShowOnlySignificant] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  // Feature categories with colors and descriptions
  const featureCategories = {
    cognitive: {
      name: 'Cognitive Health Indicators',
      color: 'purple',
      description: 'Core cognitive function measurements',
      features: ['cognitiveHealthScore', 'syntacticComplexity', 'informationDensity', 'hesitationRatio']
    },
    lexical: {
      name: 'Vocabulary & Language',
      color: 'blue',
      description: 'Language complexity and vocabulary usage',
      features: ['vocabularySize', 'lexicalDiversity', 'complexWordRatio', 'averageWordLength']
    },
    basic: {
      name: 'Speech Patterns',
      color: 'green',
      description: 'Basic speech production metrics',
      features: ['wordCount', 'sentenceCount', 'averageWordsPerSentence', 'typeTokenRatio']
    },
    sentiment: {
      name: 'Emotional Indicators',
      color: 'yellow',
      description: 'Emotional tone and sentiment analysis',
      features: ['sentimentScore', 'sentimentPolarity']
    }
  };

  // Get category for a feature
  const getFeatureCategory = (featureName: string) => {
    for (const [categoryKey, category] of Object.entries(featureCategories)) {
      if (category.features.includes(featureName)) {
        return { key: categoryKey, ...category };
      }
    }
    return { key: 'other', name: 'Other Features', color: 'gray', description: 'Miscellaneous features' };
  };

  // Process and filter features
  const processedFeatures = useMemo(() => {
    let features = Object.entries(explanation.featureAttributions || {})
      .map(([name, attribution]: [string, any]) => ({
        name,
        ...attribution,
        category: getFeatureCategory(name)
      }));

    // Apply search filter
    if (searchTerm) {
      features = features.filter(feature => 
        feature.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      features = features.filter(feature => feature.category.key === filterCategory);
    }

    // Apply significance filter
    if (showOnlySignificant) {
      features = features.filter(feature => feature.percentageContribution > 5);
    }

    // Apply sorting
    features.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'importance':
          comparison = b.absoluteImportance - a.absoluteImportance;
          break;
        case 'contribution':
          comparison = b.percentageContribution - a.percentageContribution;
          break;
        case 'alphabetical':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return features;
  }, [explanation.featureAttributions, sortBy, sortOrder, filterCategory, searchTerm, showOnlySignificant]);

  // Category summary statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    Object.keys(featureCategories).forEach(categoryKey => {
      const categoryFeatures = processedFeatures.filter(f => f.category.key === categoryKey);
      const totalContribution = categoryFeatures.reduce((sum, f) => sum + f.absoluteImportance, 0);
      const avgContribution = categoryFeatures.length > 0 ? totalContribution / categoryFeatures.length : 0;
      
      stats[categoryKey] = {
        count: categoryFeatures.length,
        totalContribution,
        avgContribution,
        positiveCount: categoryFeatures.filter(f => f.direction === 'positive').length,
        negativeCount: categoryFeatures.filter(f => f.direction === 'negative').length
      };
    });
    
    return stats;
  }, [processedFeatures]);

  const toggleFeatureExpansion = (featureName: string) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(featureName)) {
      newExpanded.delete(featureName);
    } else {
      newExpanded.add(featureName);
    }
    setExpandedFeatures(newExpanded);
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' = 'bg') => {
    const colorMap = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
  };

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Feature Categories Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(featureCategories).map(([categoryKey, category]) => {
              const stats = categoryStats[categoryKey];
              return (
                <div key={categoryKey} className={`p-4 rounded-lg border ${getColorClasses(category.color, 'bg')} ${getColorClasses(category.color, 'border')}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${getColorClasses(category.color, 'text')}`}>
                      {category.name}
                    </h4>
                    <span className={`text-sm ${getColorClasses(category.color, 'text')}`}>
                      {stats?.count || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span>{stats?.positiveCount || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      <span>{stats?.negativeCount || 0}</span>
                    </div>
                    <div className="font-medium">
                      {((stats?.totalContribution || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Feature Analysis</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {processedFeatures.length} features
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(featureCategories).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="importance">Sort by Importance</option>
              <option value="contribution">Sort by Contribution</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'desc' ? 'Desc' : 'Asc'}
            </button>
          </div>

          {/* Additional Filters */}
          <div className="mt-4 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlySignificant}
                onChange={(e) => setShowOnlySignificant(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show only significant features (&gt;5% contribution)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Feature Analysis</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {processedFeatures.map((feature, index) => (
            <div key={feature.name} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Feature Header */}
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      feature.direction === 'positive' ? 'bg-green-500' :
                      feature.direction === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <h4 className="text-lg font-medium text-gray-900">{feature.name}</h4>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getColorClasses(feature.category.color, 'bg')} ${getColorClasses(feature.category.color, 'text')}`}>
                      {feature.category.name}
                    </span>
                  </div>

                  {/* Feature Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        {feature.direction === 'positive' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : feature.direction === 'negative' ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <Minus className="h-4 w-4 text-gray-400 mr-1" />
                        )}
                        <span className="text-sm font-medium">SHAP Value</span>
                      </div>
                      <span className={`font-semibold ${
                        feature.direction === 'positive' ? 'text-green-600' :
                        feature.direction === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {feature.shapValue > 0 ? '+' : ''}{feature.shapValue.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium mr-2">Contribution</span>
                      <span className="font-semibold text-blue-600">
                        {feature.percentageContribution.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium mr-2">Importance</span>
                      <span className="font-semibold text-purple-600">
                        {feature.absoluteImportance.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Contribution Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>High Impact (&gt;10%) Visualization</span>
                      <span>{feature.percentageContribution.toFixed(1)}% of total</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          feature.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(feature.percentageContribution, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Feature Interpretation */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <p className="text-sm text-gray-700">{feature.interpretation}</p>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <button
                    onClick={() => toggleFeatureExpansion(feature.name)}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                  >
                    {expandedFeatures.has(feature.name) ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show Details
                      </>
                    )}
                  </button>

                  {expandedFeatures.has(feature.name) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">Technical Details</h5>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-blue-700 font-medium">Direction:</dt>
                          <dd className="text-blue-600 capitalize">{feature.direction}</dd>
                        </div>
                        <div>
                          <dt className="text-blue-700 font-medium">Absolute Impact:</dt>
                          <dd className="text-blue-600">{feature.absoluteImportance.toFixed(6)}</dd>
                        </div>
                        <div>
                          <dt className="text-blue-700 font-medium">Category:</dt>
                          <dd className="text-blue-600">{feature.category.name}</dd>
                        </div>
                        <div>
                          <dt className="text-blue-700 font-medium">Rank:</dt>
                          <dd className="text-blue-600">#{index + 1} of {processedFeatures.length}</dd>
                        </div>
                      </dl>
                      
                      {config.showTechnicalDetails && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <h6 className="font-medium text-blue-900 mb-2">Advanced Metrics</h6>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div>Raw SHAP Value: {feature.shapValue}</div>
                            <div>Normalized Contribution: {(feature.percentageContribution / 100).toFixed(4)}</div>
                            <div>Feature Category: {feature.category.key}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Feature Rank Badge */}
                <div className="ml-4 flex-shrink-0">
                  <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {processedFeatures.length === 0 && (
          <div className="p-12 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to see more features.
            </p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attribution Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {processedFeatures.filter(f => f.direction === 'positive').length}
              </div>
              <div className="text-sm text-gray-600">Positive Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {processedFeatures.filter(f => f.direction === 'negative').length}
              </div>
              <div className="text-sm text-gray-600">Negative Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {processedFeatures.filter(f => f.percentageContribution > 10).length}
              </div>
              <div className="text-sm text-gray-600">High Impact (&gt;10%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(processedFeatures.reduce((sum, f) => sum + f.absoluteImportance, 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Total Attribution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureAttributions;
