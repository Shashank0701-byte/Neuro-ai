import React, { useState } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Maximize, 
  Minimize, 
  Monitor,
  Smartphone,
  Tablet,
  X
} from 'lucide-react';

interface ExplainabilityControlsProps {
  config: {
    showTechnicalDetails: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
    visualizationSize: 'small' | 'medium' | 'large';
    clinicalFocus: boolean;
  };
  onConfigChange: (config: any) => void;
}

const ExplainabilityControls: React.FC<ExplainabilityControlsProps> = ({
  config,
  onConfigChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateConfig = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const resetToDefaults = () => {
    onConfigChange({
      showTechnicalDetails: false,
      autoRefresh: false,
      refreshInterval: 30000,
      visualizationSize: 'medium',
      clinicalFocus: true
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center"
        title="Dashboard Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Dashboard Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Display Options */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Display Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Show Technical Details</span>
                    <button
                      onClick={() => updateConfig('showTechnicalDetails', !config.showTechnicalDetails)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.showTechnicalDetails ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.showTechnicalDetails ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Clinical Focus Mode</span>
                    <button
                      onClick={() => updateConfig('clinicalFocus', !config.clinicalFocus)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.clinicalFocus ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.clinicalFocus ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              {/* Visualization Size */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Visualization Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'small', label: 'Small', icon: Smartphone },
                    { value: 'medium', label: 'Medium', icon: Tablet },
                    { value: 'large', label: 'Large', icon: Monitor }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateConfig('visualizationSize', value)}
                      className={`flex flex-col items-center p-3 rounded-lg border text-sm transition-colors ${
                        config.visualizationSize === value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Refresh */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Auto Refresh</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enable Auto Refresh</span>
                    <button
                      onClick={() => updateConfig('autoRefresh', !config.autoRefresh)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.autoRefresh ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>

                  {config.autoRefresh && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Refresh Interval
                      </label>
                      <select
                        value={config.refreshInterval}
                        onChange={(e) => updateConfig('refreshInterval', parseInt(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                      >
                        <option value={15000}>15 seconds</option>
                        <option value={30000}>30 seconds</option>
                        <option value={60000}>1 minute</option>
                        <option value={300000}>5 minutes</option>
                        <option value={600000}>10 minutes</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={resetToDefaults}
                    className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </button>
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Current Settings</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Technical Details: {config.showTechnicalDetails ? 'On' : 'Off'}</div>
                  <div>Clinical Focus: {config.clinicalFocus ? 'On' : 'Off'}</div>
                  <div>Visualization: {config.visualizationSize}</div>
                  <div>Auto Refresh: {config.autoRefresh ? `${config.refreshInterval/1000}s` : 'Off'}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExplainabilityControls;
