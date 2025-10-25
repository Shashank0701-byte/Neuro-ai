import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Image, 
  Database, 
  Calendar, 
  Settings, 
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Share2,
  Printer,
  Eye,
  Filter,
  BarChart3,
  TrendingUp,
  Brain,
  User
} from 'lucide-react';

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

interface ReportExportProps {
  userData: UserData;
  assessments: Assessment[];
  dateRange: string;
}

const ReportExport: React.FC<ReportExportProps> = ({
  userData,
  assessments,
  dateRange
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'json' | 'csv' | 'xlsx'>('pdf');
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'trends' | 'custom'>('summary');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);

  const reportTemplates = [
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and trends',
      icon: BarChart3,
      estimatedPages: 2,
      includesCharts: true
    },
    {
      id: 'detailed',
      name: 'Detailed Analysis',
      description: 'Comprehensive report with all assessment data',
      icon: FileText,
      estimatedPages: 8,
      includesCharts: true
    },
    {
      id: 'trends',
      name: 'Trend Analysis',
      description: 'Focus on score progression and patterns over time',
      icon: TrendingUp,
      estimatedPages: 4,
      includesCharts: true
    },
    {
      id: 'clinical',
      name: 'Clinical Report',
      description: 'Medical-grade report for healthcare professionals',
      icon: Brain,
      estimatedPages: 6,
      includesCharts: true
    }
  ];

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional report with charts and formatting',
      icon: FileText,
      size: '2-5 MB'
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Raw data in JSON format for developers',
      icon: Database,
      size: '50-200 KB'
    },
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      description: 'Tabular data for analysis in Excel/Sheets',
      icon: Database,
      size: '10-50 KB'
    },
    {
      id: 'xlsx',
      name: 'Excel Workbook',
      description: 'Multi-sheet Excel file with charts',
      icon: Database,
      size: '1-3 MB'
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport = {
        id: `report-${Date.now()}`,
        type: reportType,
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        filename: `cognitive_assessment_report_${reportType}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`,
        size: selectedFormat === 'pdf' ? '2.3 MB' : selectedFormat === 'json' ? '156 KB' : '45 KB',
        assessmentCount: selectedAssessments.size || assessments.length,
        status: 'ready'
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportId: string) => {
    const report = generatedReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual file URL
    link.download = report.filename;
    link.click();
  };

  const handleEmailReport = async (reportId: string) => {
    if (!emailRecipient) return;
    
    // Simulate email sending
    console.log(`Sending report ${reportId} to ${emailRecipient}`);
    // In real implementation, this would call an API to send the email
  };

  const handleScheduleReport = () => {
    const newSchedule = {
      id: `schedule-${Date.now()}`,
      type: reportType,
      format: selectedFormat,
      frequency: 'weekly', // This would be configurable
      nextGeneration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      recipient: emailRecipient,
      status: 'active'
    };
    
    setScheduledReports(prev => [newSchedule, ...prev]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Generate Assessment Report</h3>
          <p className="text-sm text-gray-600 mt-1">
            Create comprehensive reports from your assessment data
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Type Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Report Template</h4>
              <div className="space-y-3">
                {reportTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <label key={template.id} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="reportType"
                        value={template.id}
                        checked={reportType === template.id}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">{template.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>~{template.estimatedPages} pages</span>
                          {template.includesCharts && (
                            <span className="ml-3 flex items-center">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Charts included
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Export Format Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Export Format</h4>
              <div className="space-y-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <label key={format.id} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format.id}
                        checked={selectedFormat === format.id}
                        onChange={(e) => setSelectedFormat(e.target.value as any)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-600 mr-2" />
                          <span className="font-medium text-gray-900">{format.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          Estimated size: {format.size}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Report Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Charts & Visualizations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Raw Data</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Recommendations</span>
              </label>
            </div>
          </div>

          {/* Date Range & Assessment Selection */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="capitalize">
                    {dateRange.replace('d', ' days').replace('y', ' year')} 
                    ({assessments.length} assessments)
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Recipient (Optional)
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Report will include {assessments.length} assessments from {userData.name}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleScheduleReport}
                  className="btn-secondary"
                  disabled={!emailRecipient}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Weekly
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="btn-primary"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your recently generated assessment reports
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {generatedReports.map((report) => (
              <div key={report.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(report.status)}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {report.filename}
                      </div>
                      <div className="text-sm text-gray-600">
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report • {report.format.toUpperCase()} • {report.size}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Generated {new Date(report.generatedAt).toLocaleString()} • {report.assessmentCount} assessments
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="btn-secondary"
                      disabled={report.status !== 'ready'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    
                    {emailRecipient && (
                      <button
                        onClick={() => handleEmailReport(report.id)}
                        className="btn-secondary"
                        disabled={report.status !== 'ready'}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </button>
                    )}
                    
                    <button className="btn-secondary">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      {scheduledReports.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Scheduled Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Automatically generated reports sent to your email
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {scheduledReports.map((schedule) => (
              <div key={schedule.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)} Report
                    </div>
                    <div className="text-sm text-gray-600">
                      {schedule.format.toUpperCase()} • Weekly • {schedule.recipient}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Next generation: {new Date(schedule.nextGeneration).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.status}
                    </span>
                    <button className="btn-secondary">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Export Options */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Export</h3>
          <p className="text-sm text-gray-600 mt-1">
            Fast export options for common use cases
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Latest Assessment</div>
                <div className="text-sm text-gray-600">PDF Summary</div>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">All Data</div>
                <div className="text-sm text-gray-600">CSV Export</div>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Trend Analysis</div>
                <div className="text-sm text-gray-600">Chart Images</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportExport;
