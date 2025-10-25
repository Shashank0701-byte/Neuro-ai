import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Calendar,
  Brain,
  MessageSquare,
  Mic,
  Heart,
  Award,
  Activity,
  Zap,
  Eye,
  Info
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

interface AssessmentAnalyticsProps {
  assessments: Assessment[];
}

const AssessmentAnalytics: React.FC<AssessmentAnalyticsProps> = ({
  assessments
}) => {
  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const completedAssessments = assessments.filter(a => a.status === 'completed');
    
    if (completedAssessments.length === 0) {
      return null;
    }

    // Basic statistics
    const totalAssessments = completedAssessments.length;
    const averageScore = completedAssessments.reduce((sum, a) => sum + a.riskScore, 0) / totalAssessments;
    const averageConfidence = completedAssessments.reduce((sum, a) => sum + a.confidence, 0) / totalAssessments;
    const totalDuration = completedAssessments.reduce((sum, a) => sum + a.duration, 0);
    
    // Score distribution
    const scoreRanges = {
      excellent: completedAssessments.filter(a => a.riskScore >= 0.8).length,
      good: completedAssessments.filter(a => a.riskScore >= 0.6 && a.riskScore < 0.8).length,
      fair: completedAssessments.filter(a => a.riskScore >= 0.4 && a.riskScore < 0.6).length,
      poor: completedAssessments.filter(a => a.riskScore < 0.4).length
    };

    // Assessment type distribution
    const typeDistribution = {
      speech: completedAssessments.filter(a => a.type === 'speech').length,
      text: completedAssessments.filter(a => a.type === 'text').length,
      comprehensive: completedAssessments.filter(a => a.type === 'comprehensive').length
    };

    // Feature averages
    const featureAverages = {
      cognitive: completedAssessments.reduce((sum, a) => sum + a.features.cognitive, 0) / totalAssessments,
      lexical: completedAssessments.reduce((sum, a) => sum + a.features.lexical, 0) / totalAssessments,
      basic: completedAssessments.reduce((sum, a) => sum + a.features.basic, 0) / totalAssessments,
      sentiment: completedAssessments.reduce((sum, a) => sum + a.features.sentiment, 0) / totalAssessments
    };

    // Trend analysis (last 5 vs previous 5)
    const recentAssessments = completedAssessments.slice(-5);
    const previousAssessments = completedAssessments.slice(-10, -5);
    
    let trend = 'stable';
    if (recentAssessments.length >= 3 && previousAssessments.length >= 3) {
      const recentAvg = recentAssessments.reduce((sum, a) => sum + a.riskScore, 0) / recentAssessments.length;
      const previousAvg = previousAssessments.reduce((sum, a) => sum + a.riskScore, 0) / previousAssessments.length;
      
      if (recentAvg > previousAvg + 0.05) trend = 'improving';
      else if (recentAvg < previousAvg - 0.05) trend = 'declining';
    }

    // Performance consistency
    const scores = completedAssessments.map(a => a.riskScore);
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = standardDeviation < 0.1 ? 'high' : standardDeviation < 0.2 ? 'moderate' : 'low';

    // Best and worst performances
    const bestAssessment = completedAssessments.reduce((best, current) => 
      current.riskScore > best.riskScore ? current : best
    );
    const worstAssessment = completedAssessments.reduce((worst, current) => 
      current.riskScore < worst.riskScore ? current : worst
    );

    // Monthly progress (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthAssessments = completedAssessments.filter(a => {
        const assessmentDate = new Date(a.timestamp);
        return assessmentDate >= monthStart && assessmentDate <= monthEnd;
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthAssessments.length,
        averageScore: monthAssessments.length > 0 
          ? monthAssessments.reduce((sum, a) => sum + a.riskScore, 0) / monthAssessments.length 
          : 0
      });
    }

    return {
      totalAssessments,
      averageScore,
      averageConfidence,
      totalDuration,
      scoreRanges,
      typeDistribution,
      featureAverages,
      trend,
      consistency,
      standardDeviation,
      bestAssessment,
      worstAssessment,
      monthlyData
    };
  }, [assessments]);

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">
          Complete some assessments to see detailed analytics and insights.
        </p>
      </div>
    );
  }

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

  const getConsistencyColor = (consistency: string) => {
    switch (consistency) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.totalAssessments}
              </div>
              <div className="text-sm text-gray-600">Total Assessments</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(analytics.averageScore * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${getTrendColor(analytics.trend)}`}>
              {getTrendIcon(analytics.trend)}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {analytics.trend}
              </div>
              <div className="text-sm text-gray-600">Trend</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(analytics.totalDuration / 60)}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Score Distribution</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.scoreRanges.excellent}
              </div>
              <div className="text-sm text-gray-600 mb-2">Excellent (80-100%)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(analytics.scoreRanges.excellent / analytics.totalAssessments) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.scoreRanges.good}
              </div>
              <div className="text-sm text-gray-600 mb-2">Good (60-79%)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(analytics.scoreRanges.good / analytics.totalAssessments) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {analytics.scoreRanges.fair}
              </div>
              <div className="text-sm text-gray-600 mb-2">Fair (40-59%)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(analytics.scoreRanges.fair / analytics.totalAssessments) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {analytics.scoreRanges.poor}
              </div>
              <div className="text-sm text-gray-600 mb-2">Needs Attention (&lt;40%)</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(analytics.scoreRanges.poor / analytics.totalAssessments) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Analysis */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Feature Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: 'cognitive', name: 'Cognitive', icon: Brain, color: 'purple' },
              { key: 'lexical', name: 'Lexical', icon: MessageSquare, color: 'blue' },
              { key: 'basic', name: 'Basic', icon: Mic, color: 'green' },
              { key: 'sentiment', name: 'Sentiment', icon: Heart, color: 'pink' }
            ].map((feature) => {
              const Icon = feature.icon;
              const score = analytics.featureAverages[feature.key as keyof typeof analytics.featureAverages];
              
              return (
                <div key={feature.key} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${feature.color}-100 mb-3`}>
                    <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(score * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{feature.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-${feature.color}-500 h-2 rounded-full`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assessment Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assessment Types</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { key: 'comprehensive', name: 'Comprehensive', icon: Brain, color: 'purple' },
                { key: 'speech', name: 'Speech Only', icon: Mic, color: 'blue' },
                { key: 'text', name: 'Text Only', icon: MessageSquare, color: 'green' }
              ].map((type) => {
                const Icon = type.icon;
                const count = analytics.typeDistribution[type.key as keyof typeof analytics.typeDistribution];
                const percentage = (count / analytics.totalAssessments) * 100;
                
                return (
                  <div key={type.key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 text-${type.color}-600 mr-3`} />
                      <span className="font-medium text-gray-900">{type.name}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`bg-${type.color}-500 h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Insights</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="font-medium text-gray-900">Consistency</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getConsistencyColor(analytics.consistency)}`}>
                  {analytics.consistency}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium text-gray-900">Best Score</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {(analytics.bestAssessment.riskScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="font-medium text-gray-900">Avg Duration</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(analytics.totalDuration / analytics.totalAssessments / 60)}m
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-900">Avg Confidence</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {(analytics.averageConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Progress</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="font-medium text-gray-900 w-20">{month.month}</span>
                </div>
                <div className="flex items-center flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${month.averageScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {month.count} tests
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12">
                  {month.averageScore > 0 ? `${(month.averageScore * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Personalized Recommendations
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics.trend === 'declining' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Performance Attention Needed</h4>
                <p className="text-red-800 text-sm">
                  Your recent scores show a declining trend. Consider consulting with a healthcare professional 
                  or reviewing your assessment conditions for consistency.
                </p>
              </div>
            )}
            
            {analytics.consistency === 'low' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Improve Consistency</h4>
                <p className="text-yellow-800 text-sm">
                  Your scores vary significantly between assessments. Try taking assessments at the same time 
                  of day and in similar conditions for more reliable results.
                </p>
              </div>
            )}
            
            {analytics.totalAssessments < 5 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Build Your Baseline</h4>
                <p className="text-blue-800 text-sm">
                  Take more assessments to establish a reliable baseline and track meaningful trends over time.
                </p>
              </div>
            )}
            
            {analytics.trend === 'improving' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Great Progress!</h4>
                <p className="text-green-800 text-sm">
                  Your scores are improving over time. Keep up the excellent work and maintain your current routine.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentAnalytics;
