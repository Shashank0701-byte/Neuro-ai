import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Calendar,
  Target,
  Activity,
  Brain,
  MessageSquare,
  Mic,
  Heart,
  Info,
  Download,
  Maximize2
} from 'lucide-react';

interface Assessment {
  assessmentId: string;
  timestamp: string;
  type: 'speech' | 'text' | 'comprehensive';
  riskScore: number;
  confidence: number;
  duration: number;
  features: {
    cognitive: number;
    lexical: number;
    basic: number;
    sentiment: number;
  };
  status: 'completed' | 'in_progress' | 'failed';
  notes?: string;
}

interface ScoreTrendsProps {
  assessments: Assessment[];
  dateRange: string;
}

const ScoreTrends: React.FC<ScoreTrendsProps> = ({
  assessments,
  dateRange
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'riskScore' | 'cognitive' | 'lexical' | 'basic' | 'sentiment'>('riskScore');
  const [showConfidence, setShowConfidence] = useState(true);

  // Filter assessments based on date range
  const filteredAssessments = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }
    
    return assessments
      .filter(a => a.status === 'completed' && new Date(a.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [assessments, dateRange]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (filteredAssessments.length < 2) return null;
    
    const scores = filteredAssessments.map(a => 
      selectedMetric === 'riskScore' ? a.riskScore : a.features[selectedMetric as keyof typeof a.features]
    );
    
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const change = lastScore - firstScore;
    const percentChange = (change / firstScore) * 100;
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Calculate trend direction
    const recentScores = scores.slice(-3);
    const earlierScores = scores.slice(0, 3);
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;
    
    let trend: 'improving' | 'stable' | 'declining';
    if (recentAvg > earlierAvg + 0.05) trend = 'improving';
    else if (recentAvg < earlierAvg - 0.05) trend = 'declining';
    else trend = 'stable';
    
    return {
      change,
      percentChange,
      average,
      min,
      max,
      trend,
      dataPoints: scores.length
    };
  }, [filteredAssessments, selectedMetric]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredAssessments.map((assessment, index) => ({
      x: index,
      date: new Date(assessment.timestamp).toLocaleDateString(),
      timestamp: assessment.timestamp,
      value: selectedMetric === 'riskScore' ? assessment.riskScore : assessment.features[selectedMetric as keyof typeof assessment.features],
      confidence: assessment.confidence,
      type: assessment.type,
      assessmentId: assessment.assessmentId
    }));
  }, [filteredAssessments, selectedMetric]);

  // Feature comparison data
  const featureComparison = useMemo(() => {
    if (filteredAssessments.length === 0) return null;
    
    const latest = filteredAssessments[filteredAssessments.length - 1];
    const features = [
      { name: 'Cognitive', value: latest.features.cognitive, color: 'bg-purple-500', icon: Brain },
      { name: 'Lexical', value: latest.features.lexical, color: 'bg-blue-500', icon: MessageSquare },
      { name: 'Basic', value: latest.features.basic, color: 'bg-green-500', icon: Mic },
      { name: 'Sentiment', value: latest.features.sentiment, color: 'bg-yellow-500', icon: Heart }
    ];
    
    return features.sort((a, b) => b.value - a.value);
  }, [filteredAssessments]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderLineChart = () => {
    if (chartData.length === 0) return null;
    
    const maxValue = Math.max(...chartData.map(d => d.value));
    const minValue = Math.min(...chartData.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    const chartHeight = 300;
    const chartWidth = 600;
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - ((point.value - minValue + padding) / (range + 2 * padding)) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="relative">
        <svg width="100%" height="300" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="border rounded">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Main line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {chartData.map((point, index) => {
            const x = (index / (chartData.length - 1)) * chartWidth;
            const y = chartHeight - ((point.value - minValue + padding) / (range + 2 * padding)) * chartHeight;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 cursor-pointer"
                title={`${point.date}: ${(point.value * 100).toFixed(0)}%`}
              />
            );
          })}
          
          {/* Confidence band if enabled */}
          {showConfidence && (
            <polyline
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1"
              strokeDasharray="3,3"
              points={chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * chartWidth;
                const confidenceValue = point.confidence;
                const y = chartHeight - ((confidenceValue - minValue + padding) / (range + 2 * padding)) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}
        </svg>
        
        {/* Chart labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{chartData[0]?.date}</span>
          <span>{chartData[chartData.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    if (chartData.length === 0) return null;
    
    const maxValue = Math.max(...chartData.map(d => d.value));
    
    return (
      <div className="space-y-2">
        {chartData.map((point, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-xs text-gray-600 truncate">
              {point.date}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(point.value / maxValue) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {(point.value * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Score Trends Analysis</h3>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary">
                <Download className="h-4 w-4 mr-2" />
                Export Chart
              </button>
              <button className="btn-secondary">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Metric Selection */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="riskScore">Overall Score</option>
              <option value="cognitive">Cognitive Features</option>
              <option value="lexical">Lexical Features</option>
              <option value="basic">Basic Features</option>
              <option value="sentiment">Sentiment Features</option>
            </select>

            {/* Chart Type */}
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
            </select>

            {/* Show Confidence */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show Confidence</span>
            </label>

            {/* Date Range Display */}
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="capitalize">{dateRange.replace('d', ' days').replace('y', ' year')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Statistics */}
      {trendStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${getTrendColor(trendStats.trend)}`}>
                {getTrendIcon(trendStats.trend)}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {trendStats.trend}
                </div>
                <div className="text-sm text-gray-600">Overall Trend</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(trendStats.average * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {(trendStats.max * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {trendStats.dataPoints}
                </div>
                <div className="text-sm text-gray-600">Data Points</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedMetric === 'riskScore' ? 'Overall Score' : `${selectedMetric} Features`} Trend
          </h3>
          {trendStats && (
            <p className="text-sm text-gray-600 mt-1">
              {trendStats.percentChange > 0 ? '+' : ''}{trendStats.percentChange.toFixed(1)}% change over selected period
            </p>
          )}
        </div>
        <div className="p-6">
          {chartType === 'line' && renderLineChart()}
          {chartType === 'bar' && renderBarChart()}
          {chartType === 'area' && renderLineChart()} {/* Simplified - would be different in real implementation */}
          
          {chartData.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">
                No completed assessments found for the selected time period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature Breakdown */}
      {featureComparison && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Latest Assessment Breakdown</h3>
            <p className="text-sm text-gray-600 mt-1">
              Feature scores from your most recent assessment
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureComparison.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.name} className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className={`p-3 rounded-full ${feature.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        <Icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(feature.value * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{feature.name}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${feature.color}`}
                        style={{ width: `${feature.value * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {trendStats && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" />
              Trend Insights
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Performance Analysis</h4>
                <p className="text-blue-800 text-sm">
                  Your {selectedMetric === 'riskScore' ? 'overall score' : `${selectedMetric} features`} show a{' '}
                  <strong>{trendStats.trend}</strong> trend over the selected period. 
                  {trendStats.trend === 'improving' && ' Keep up the excellent progress!'}
                  {trendStats.trend === 'declining' && ' Consider reviewing recent changes or consulting with a healthcare professional.'}
                  {trendStats.trend === 'stable' && ' Your performance remains consistent.'}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Statistical Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Range:</span>
                    <span className="ml-2 font-medium">
                      {(trendStats.min * 100).toFixed(0)}% - {(trendStats.max * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Variability:</span>
                    <span className="ml-2 font-medium">
                      {((trendStats.max - trendStats.min) * 100).toFixed(0)}% range
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Quality:</span>
                    <span className="ml-2 font-medium">
                      {trendStats.dataPoints} assessments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreTrends;
