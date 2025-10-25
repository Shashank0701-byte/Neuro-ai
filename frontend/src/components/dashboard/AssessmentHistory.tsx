import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Brain, 
  FileText, 
  Mic, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onRefresh: () => void;
}

const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  assessments,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());

  // Filter and sort assessments
  const filteredAssessments = useMemo(() => {
    let filtered = assessments.filter(assessment => {
      const matchesSearch = searchTerm === '' || 
        assessment.assessmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assessment.notes && assessment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = filterType === 'all' || assessment.type === filterType;
      const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort assessments
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'score':
          comparison = a.riskScore - b.riskScore;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [assessments, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'speech': return <Mic className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'comprehensive': return <Brain className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleSelectAssessment = (assessmentId: string) => {
    const newSelected = new Set(selectedAssessments);
    if (newSelected.has(assessmentId)) {
      newSelected.delete(assessmentId);
    } else {
      newSelected.add(assessmentId);
    }
    setSelectedAssessments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAssessments.size === filteredAssessments.length) {
      setSelectedAssessments(new Set());
    } else {
      setSelectedAssessments(new Set(filteredAssessments.map(a => a.assessmentId)));
    }
  };

  const handleViewExplanation = (assessmentId: string) => {
    navigate(`/explainability?scoringId=${assessmentId}`);
  };

  const handleExportSelected = () => {
    const selectedData = filteredAssessments.filter(a => selectedAssessments.has(a.assessmentId));
    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessments_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Assessment History</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredAssessments.length} of {assessments.length} assessments
              </span>
              {selectedAssessments.size > 0 && (
                <button
                  onClick={handleExportSelected}
                  className="btn-secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedAssessments.size})
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="speech">Speech</option>
              <option value="text">Text</option>
              <option value="comprehensive">Comprehensive</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="duration">Sort by Duration</option>
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
        </div>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedAssessments.size === filteredAssessments.length && filteredAssessments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Select All
              </span>
            </label>
            <button
              onClick={onRefresh}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-1 inline" />
              Refresh
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.assessmentId} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedAssessments.has(assessment.assessmentId)}
                    onChange={() => handleSelectAssessment(assessment.assessmentId)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  
                  <div className="ml-4 flex-1">
                    {/* Assessment Header */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-4">
                        {getTypeIcon(assessment.type)}
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {assessment.type} Assessment
                        </span>
                      </div>
                      
                      <div className="flex items-center mr-4">
                        {getStatusIcon(assessment.status)}
                        <span className="ml-1 text-sm text-gray-600 capitalize">
                          {assessment.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {assessment.assessmentId.slice(0, 8)}...
                      </span>
                    </div>

                    {/* Assessment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Date & Time</div>
                        <div className="font-medium text-gray-900">
                          {new Date(assessment.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(assessment.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Score</div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(assessment.riskScore)}`}>
                          {(assessment.riskScore * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Confidence: {(assessment.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-medium text-gray-900">
                          {Math.floor(assessment.duration / 60)}m {assessment.duration % 60}s
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Features</div>
                        <div className="flex space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                            C: {(assessment.features.cognitive * 100).toFixed(0)}%
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                            L: {(assessment.features.lexical * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {assessment.notes && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">Notes</div>
                        <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                          {assessment.notes}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleViewExplanation(assessment.assessmentId)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Explanation
                      </button>
                      
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </button>
                      
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssessments.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'No assessments have been completed yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination would go here in a real implementation */}
      {filteredAssessments.length > 10 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {Math.min(10, filteredAssessments.length)} of {filteredAssessments.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary" disabled>Previous</button>
              <span className="px-3 py-2 text-sm text-gray-700">Page 1 of 1</span>
              <button className="btn-secondary" disabled>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
