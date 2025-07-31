import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, ToggleLeft, ToggleRight, Settings, Bot, Clock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';
import settingsService from '../services/settingsService';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [activeTab, setActiveTab] = useState('ai');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAutoSaveConfirm, setShowAutoSaveConfirm] = useState(false);
  const [pendingAutoSaveChange, setPendingAutoSaveChange] = useState(null);

  // Auto-save interval options with user-friendly labels
  const autoSaveOptions = [
    { value: 10, label: '10 seconds', description: 'Very frequent' },
    { value: 30, label: '30 seconds', description: 'Default' },
    { value: 60, label: '1 minute', description: 'Balanced' },
    { value: 120, label: '2 minutes', description: 'Moderate' },
    { value: 300, label: '5 minutes', description: 'Less frequent' },
    { value: 600, label: '10 minutes', description: 'Minimal' },
    { value: 900, label: '15 minutes', description: 'Manual-like' }
  ];

  // Load settings from cloud on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !isOpen) return;
      
      try {
        setLoading(true);
        const settings = await settingsService.getUserSettings(user.$id);
        
        if (settings) {
          setApiKey(settings.geminiApiKey || '');
          setIsAutoSaveEnabled(settings.autoSaveEnabled);
          setAutoSaveInterval(settings.autoSaveInterval);
        }
      } catch (error) {

        // Fallback to localStorage for backward compatibility
        const savedApiKey = localStorage.getItem('scribly_gemini_api_key') || '';
        const savedAutoSave = localStorage.getItem('scribly_auto_save') === 'true';
        
        setApiKey(savedApiKey);
        setIsAutoSaveEnabled(savedAutoSave);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, isOpen]);

  // Auto-save API key changes to cloud
  const handleApiKeyChange = async (newApiKey) => {
    setApiKey(newApiKey);
    
    if (user && newApiKey.trim() !== '') {
      try {
        await settingsService.updateGeminiApiKey(user.$id, newApiKey);
      } catch (error) {

        // Fallback to localStorage
        localStorage.setItem('scribly_gemini_api_key', newApiKey.trim());
      }
    }
  };

  // Validate API key with Gemini service
  const validateApiKey = async (key = apiKey) => {
    if (!key.trim()) {
      toast.error('Please enter an API key first');
      return false;
    }
    
    try {
      setIsValidating(true);
      const isValid = await aiService.validateApiKey(key);
      
      if (isValid) {
        toast.success('API key is valid and working!');
        return true;
      } else {
        toast.error('API key validation failed. Please check your key.');
        return false;
      }
    } catch (error) {

      toast.error(error.message || 'API key validation failed. Please check your key.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (isSaving) return; // Prevent multiple clicks
    
    try {
      setIsSaving(true);
      
      if (apiKey.trim()) {
        if (user) {
          try {
            await settingsService.updateGeminiApiKey(user.$id, apiKey.trim());
            toast.success('API key saved successfully!');
          } catch (error) {

            // Fallback to localStorage
            localStorage.setItem('scribly_gemini_api_key', apiKey.trim());
            toast.success('API key saved locally!');
          }
        } else {
          localStorage.setItem('scribly_gemini_api_key', apiKey.trim());
          toast.success('API key saved locally!');
        }
      } else {
        if (user) {
          try {
            await settingsService.updateGeminiApiKey(user.$id, '');
            toast.success('API key removed');
          } catch (error) {
            localStorage.removeItem('scribly_gemini_api_key');
            toast.success('API key removed');
          }
        } else {
          localStorage.removeItem('scribly_gemini_api_key');
          toast.success('API key removed');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoSave = async () => {
    const newValue = !isAutoSaveEnabled;
    await saveAutoSaveSettings(newValue, autoSaveInterval);
  };

  // Save auto-save settings to cloud with confirmation
  const handleAutoSaveSettingsChange = async (enabled, interval) => {
    // If changing interval and auto-save is enabled, show confirmation
    if (enabled && interval !== autoSaveInterval && isAutoSaveEnabled) {
      setPendingAutoSaveChange({ enabled, interval });
      setShowAutoSaveConfirm(true);
      return;
    }
    
    // Direct save for toggle or first-time setup
    await saveAutoSaveSettings(enabled, interval);
  };

  // Actual save function
  const saveAutoSaveSettings = async (enabled, interval) => {
    if (isSaving) return; // Prevent multiple clicks
    
    try {
      setIsSaving(true);
      setIsAutoSaveEnabled(enabled);
      setAutoSaveInterval(interval);
      
      if (user) {
        try {
          await settingsService.updateAutoSaveSettings(user.$id, enabled, interval);
          const intervalLabel = autoSaveOptions.find(opt => opt.value === interval)?.label || `${interval} seconds`;
          toast.success(`Auto-save settings updated! ${enabled ? `Saving every ${intervalLabel}` : 'Auto-save disabled'}`);
        } catch (error) {

          // Fallback to localStorage
          localStorage.setItem('scribly_auto_save', enabled.toString());
          localStorage.setItem('scribly_auto_save_interval', interval.toString());
          toast.success('Auto-save settings saved locally!');
        }
      } else {
        localStorage.setItem('scribly_auto_save', enabled.toString());
        localStorage.setItem('scribly_auto_save_interval', interval.toString());
        const intervalLabel = autoSaveOptions.find(opt => opt.value === interval)?.label || `${interval} seconds`;
        toast.success(`Auto-save settings saved! ${enabled ? `Saving every ${intervalLabel}` : 'Auto-save disabled'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm auto-save interval change
  const confirmAutoSaveChange = async () => {
    if (pendingAutoSaveChange) {
      await saveAutoSaveSettings(pendingAutoSaveChange.enabled, pendingAutoSaveChange.interval);
      setPendingAutoSaveChange(null);
    }
    setShowAutoSaveConfirm(false);
  };

  // Cancel auto-save interval change
  const cancelAutoSaveChange = () => {
    setPendingAutoSaveChange(null);
    setShowAutoSaveConfirm(false);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <p className="text-sm text-gray-400">Manage your preferences</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'ai'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'general'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>General</span>
            </button>
          </div>

          <div className="p-6 max-h-[calc(95vh-240px)] overflow-y-auto">
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Key className="h-5 w-5 mr-2 text-blue-400" />
                    Google Gemini API Key
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Enter your Google Gemini API key to enable AI features like note generation and smart tags.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => handleApiKeyChange(e.target.value)}
                          placeholder="Enter your Google Gemini API key..."
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all pr-20"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                            title={showApiKey ? "Hide API key" : "Show API key"}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <Key className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleSaveApiKey}
                          className="bg-blue-600 items-center flex hover:bg-blue-700 text-white"
                          disabled={loading || isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save API Key'}
                        </Button>
                        
                        {apiKey.trim() && (
                          <Button
                            onClick={() => validateApiKey()}
                            className="bg-green-600 items-center flex hover:bg-green-700 text-white"
                            disabled={isValidating}
                          >
                            {isValidating ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {isValidating ? 'Validating...' : 'Validate'}
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {apiKey ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>API key is configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>No API key configured</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <h4 className="text-sm font-medium text-blue-300 mb-2">How to get your API key:</h4>
                      <ol className="text-xs text-gray-400 space-y-1">
                        <li>1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google AI Studio</a></li>
                        <li>2. Sign in with your Google account</li>
                        <li>3. Click "Create API Key"</li>
                        <li>4. Copy and paste the key here</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    Auto Save Settings
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Automatically save your notes while editing to prevent data loss. Choose how frequently you want your notes to be saved.
                  </p>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  ) : (
                    <>
                      {/* Auto Save Toggle */}
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-white font-medium">Enable Auto Save</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isAutoSaveEnabled 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {isAutoSaveEnabled ? 'ENABLED' : 'DISABLED'}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">
                            {isAutoSaveEnabled 
                              ? `Notes will be saved automatically every ${autoSaveOptions.find(opt => opt.value === autoSaveInterval)?.label || '30 seconds'}` 
                              : 'Manual save required - press Ctrl+S to save'
                            }
                          </p>
                        </div>
                        
                        <button
                          onClick={handleToggleAutoSave}
                          className="ml-4 p-1 transition-colors"
                          disabled={isSaving}
                        >
                          {isAutoSaveEnabled ? (
                            <ToggleRight className={`h-8 w-8 ${isSaving ? 'text-gray-400 opacity-50' : 'text-green-400'}`} />
                          ) : (
                            <ToggleLeft className={`h-8 w-8 ${isSaving ? 'text-gray-400 opacity-50' : 'text-gray-400'}`} />
                          )}
                        </button>
                      </div>

                      {/* Auto Save Interval Selection */}
                      {isAutoSaveEnabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Auto Save Frequency
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {autoSaveOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleAutoSaveSettingsChange(isAutoSaveEnabled, option.value)}
                                  disabled={isSaving}
                                  className={`p-3 rounded-xl border text-left transition-all ${
                                    autoSaveInterval === option.value
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                      : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50'
                                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="font-medium text-sm">{option.label}</div>
                                  <div className="text-xs opacity-70">{option.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="flex items-center space-x-2 text-green-300 text-sm">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Auto Save Active</span>
                            </div>
                            <p className="text-green-400/80 text-xs mt-1">
                              Your notes will be automatically saved every {autoSaveOptions.find(opt => opt.value === autoSaveInterval)?.label || '30 seconds'} while you type. 
                              {user ? ' Settings are synced across all your devices.' : ' Settings are saved locally on this device.'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Auto Save Tips:</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• Auto save only works when you have a note title</li>
                          <li>• Manual save (Ctrl+S) is still available when auto save is enabled</li>
                          <li>• Auto save pauses when you haven't typed for more than 5 seconds</li>
                          <li>• Your changes are also saved when you navigate away from a note</li>
                          <li>• Choose a longer interval if you prefer fewer interruptions</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-700/50">
            <Button
              onClick={handleClose}
              variant="outline"
              className="px-6"
            >
              Close
            </Button>
          </div>
        </motion.div>

        {/* Auto Save Change Confirmation Modal */}
        {showAutoSaveConfirm && pendingAutoSaveChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="p-3 bg-blue-500/20 rounded-full inline-flex mb-4">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Change Auto Save Frequency?
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  You're about to change auto-save from{' '}
                  <span className="font-medium text-blue-300">
                    {autoSaveOptions.find(opt => opt.value === autoSaveInterval)?.label || '30 seconds'}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium text-green-300">
                    {autoSaveOptions.find(opt => opt.value === pendingAutoSaveChange.interval)?.label}
                  </span>
                  . This will affect how often your notes are automatically saved.
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={cancelAutoSaveChange}
                    variant="outline"
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAutoSaveChange}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Confirm Change'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;

