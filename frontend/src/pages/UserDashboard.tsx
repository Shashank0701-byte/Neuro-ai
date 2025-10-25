import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  Download, 
  Settings, 
  BarChart3,
  Clock,
  Brain,
  FileText,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Award,
  Target,
  Activity
} from 'lucide-react';
import UserProfile from '../components/dashboard/UserProfile';
import AssessmentHistory from '../components/dashboard/AssessmentHistory';
import ScoreTrends from '../components/dashboard/ScoreTrends';
import ReportExport from '../components/dashboard/ReportExport';
import AssessmentAnalytics from '../components/dashboard/AssessmentAnalytics';
import LoadingSpinner from '../components/LoadingSpinner';

interface UserData {
  userId: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  profilePicture?: string;
  joinDate: string;
  lastAssessment?: string;
  totalAssessments: number;
  averageScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  preferences: {
    notifications: boolean;
    dataSharing: boolean;
    reportFormat: 'pdf' | 'json' | 'csv';
  };
}

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

const UserDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || 'current-user';
  
  // State management
  const [userData, setUserData] = useState<UserData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'history', label: 'Assessment History', icon: Clock },
    { id: 'trends', label: 'Score Trends', icon: TrendingUp },
    { id: 'reports', label: 'Reports & Export', icon: Download },
    { id: 'profile', label: 'Profile Settings', icon: Settings }
  ];

  useEffect(() => {
    loadUserData();
    loadAssessments();
  }, [userId, dateRange]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Mock user data - in real implementation, fetch from API
      const mockUserData: UserData = {
        userId: userId,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        dateOfBirth: '1985-03-15',
        joinDate: '2024-01-15',
        lastAssessment: '2024-10-25T14:30:00Z',
        totalAssessments: 24,
        averageScore: 0.78,
        improvementTrend: 'improving',
        preferences: {
          notifications: true,
          dataSharing: false,
          reportFormat: 'pdf'
        }
      };
      setUserData(mockUserData);
    } catch (err) {
      setError('Failed to load user data');
      console.error('User data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      // Mock assessment data - in real implementation, fetch from API
      const mockAssessments: Assessment[] = [
        {
          assessmentId: 'assess-001',
          timestamp: '2024-10-25T14:30:00Z',
          type: 'comprehensive',
          riskScore: 0.82,
          confidence: 0.91,
          duration: 450,
          features: { cognitive: 0.85, lexical: 0.78, basic: 0.80, sentiment: 0.75 },
          status: 'completed',
          notes: 'Excellent cognitive performance with strong vocabulary usage'
        },
        {
          assessmentId: 'assess-002',
          timestamp: '2024-10-20T10:15:00Z',
          type: 'speech',
          riskScore: 0.76,
          confidence: 0.88,
          duration: 320,
          features: { cognitive: 0.80, lexical: 0.72, basic: 0.78, sentiment: 0.70 },
          status: 'completed'
        },
        {
          assessmentId: 'assess-003',
          timestamp: '2024-10-15T16:45:00Z',
          type: 'text',
          riskScore: 0.74,
          confidence: 0.85,
          duration: 280,
          features: { cognitive: 0.78, lexical: 0.70, basic: 0.76, sentiment: 0.72 },
          status: 'completed'
        }
      ];
      setAssessments(mockAssessments);
    } catch (err) {
      console.error('Assessment loading error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadAssessments()]);
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining': return <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error || 'User data not found'}</p>
          <button onClick={handleRefresh} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
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
              <User className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Assessment Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {userData.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Summary Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Assessments */}
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userData.totalAssessments}
                </div>
                <div className="text-sm text-gray-600">Total Assessments</div>
              </div>
            </div>

            {/* Average Score */}
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(userData.averageScore)}`}>
                  {(userData.averageScore * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>

            {/* Improvement Trend */}
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                {getTrendIcon(userData.improvementTrend)}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {userData.improvementTrend}
                </div>
                <div className="text-sm text-gray-600">Trend</div>
              </div>
            </div>

            {/* Last Assessment */}
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {userData.lastAssessment ? 
                    Math.ceil((Date.now() - new Date(userData.lastAssessment).getTime()) / (1000 * 60 * 60 * 24)) : 
                    'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">Days Ago</div>
              </div>
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
            {/* Recent Assessments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Assessments</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.assessmentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          assessment.status === 'completed' ? 'bg-green-500' :
                          assessment.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {assessment.type} Assessment
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(assessment.timestamp).toLocaleDateString()} • {assessment.duration}s
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getScoreColor(assessment.riskScore)}`}>
                            {(assessment.riskScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {(assessment.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setActiveTab('history')}
                    className="btn-secondary"
                  >
                    View All Assessments
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {assessments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(assessments.reduce((sum, a) => sum + a.duration, 0) / 60)}
                    </div>
                    <div className="text-sm text-gray-600">Total Minutes</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(...assessments.map(a => a.riskScore * 100)).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Best Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <AssessmentHistory 
            assessments={assessments}
            onRefresh={loadAssessments}
          />
        )}

        {activeTab === 'trends' && (
          <ScoreTrends 
            assessments={assessments}
            dateRange={dateRange}
          />
        )}

        {activeTab === 'reports' && (
          <ReportExport 
            userData={userData}
            assessments={assessments}
            dateRange={dateRange}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile 
            userData={userData}
            onUpdate={setUserData}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
