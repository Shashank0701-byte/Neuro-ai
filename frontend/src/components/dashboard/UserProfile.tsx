import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  Camera,
  Edit3,
  Trash2,
  Key,
  Database,
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Lock,
  Globe,
  Smartphone
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

interface UserProfileProps {
  userData: UserData;
  onUpdate: (userData: UserData) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  userData,
  onUpdate
}) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const sections = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Simulate password change
    console.log('Changing password...');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profilePicture', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      profile: userData,
      exportDate: new Date().toISOString(),
      dataTypes: ['profile', 'assessments', 'preferences']
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_data_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{formData.name}</h3>
          <p className="text-sm text-gray-600">{formData.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Member since {new Date(formData.joinDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            disabled={!isEditing}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={formData.userId}
            disabled
            className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Report Preferences</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Report Format
            </label>
            <select
              value={formData.preferences.reportFormat}
              onChange={(e) => handlePreferenceChange('reportFormat', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="pdf">PDF Document</option>
              <option value="json">JSON Data</option>
              <option value="csv">CSV Spreadsheet</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-4">Data Sharing</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.preferences.dataSharing}
              onChange={(e) => handlePreferenceChange('dataSharing', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow anonymized data to be used for research purposes
            </span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button onClick={handleSave} className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="btn-primary"
          >
            <Key className="h-4 w-4 mr-2" />
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-gray-600 mr-3" />
            <div>
              <div className="font-medium text-gray-900">Authenticator App</div>
              <div className="text-sm text-gray-600">Not configured</div>
            </div>
          </div>
          <button className="btn-secondary">
            <Shield className="h-4 w-4 mr-2" />
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Account Deletion */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h4>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-red-900">Delete Account</h5>
              <p className="text-sm text-red-700 mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Assessment Reminders</div>
              <div className="text-sm text-gray-600">Get reminded to take regular assessments</div>
            </div>
            <input
              type="checkbox"
              checked={formData.preferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Report Generation</div>
              <div className="text-sm text-gray-600">Notify when reports are ready for download</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Score Improvements</div>
              <div className="text-sm text-gray-600">Celebrate when your scores improve</div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Research Updates</div>
              <div className="text-sm text-gray-600">Updates about cognitive health research</div>
            </div>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Notification Frequency</h4>
        <select className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>Immediate</option>
          <option>Daily digest</option>
          <option>Weekly summary</option>
          <option>Monthly summary</option>
        </select>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Notification Settings
        </button>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Data Export</h4>
        <p className="text-sm text-gray-600 mb-4">
          Download a copy of all your data including profile information, assessment history, and preferences.
        </p>
        <button onClick={handleExportData} className="btn-secondary">
          <Download className="h-4 w-4 mr-2" />
          Export My Data
        </button>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Data Usage</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{userData.totalAssessments}</div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">2.3 MB</div>
            <div className="text-sm text-gray-600">Data Storage Used</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.ceil((Date.now() - new Date(userData.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Data Retention</h4>
        <p className="text-sm text-gray-600 mb-4">
          Your assessment data is retained for analysis and trend tracking. You can request deletion of specific assessments or all data.
        </p>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Old Assessments
          </button>
          <button className="btn-secondary text-red-600 border-red-300 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === section.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'preferences' && renderPreferencesSection()}
          {activeSection === 'privacy' && renderPrivacySection()}
          {activeSection === 'notifications' && renderNotificationsSection()}
          {activeSection === 'data' && renderDataSection()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
