import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, ToggleLeft, ToggleRight, Settings, Bot, Clock } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  useEffect(() => {
    if (isOpen) {
      // Load saved settings
      const savedApiKey = localStorage.getItem('scribly_gemini_api_key') || '';
      const savedAutoSave = localStorage.getItem('scribly_auto_save') === 'true';
      
      setApiKey(savedApiKey);
      setIsAutoSaveEnabled(savedAutoSave);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('scribly_gemini_api_key', apiKey.trim());
      toast.success('API key saved successfully!');
    } else {
      localStorage.removeItem('scribly_gemini_api_key');
      toast.success('API key removed');
    }
  };

  const handleToggleAutoSave = () => {
    const newValue = !isAutoSaveEnabled;
    setIsAutoSaveEnabled(newValue);
    localStorage.setItem('scribly_auto_save', newValue.toString());
    
    if (newValue) {
      toast.success('Auto-save enabled! Notes will save automatically every 2 seconds.');
    } else {
      toast.success('Auto-save disabled');
    }
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
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your Google Gemini API key..."
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all"
                        />
                        <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        onClick={handleSaveApiKey}
                        className="bg-blue-600 items-center flex hover:bg-blue-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save API Key
                      </Button>
                      
                      <div className="text-xs text-gray-500">
                        {apiKey ? 'API key is set' : 'No API key configured'}
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
                    Auto Save
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Automatically save your notes every 2 seconds while editing to prevent data loss.
                  </p>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-white font-medium">Enable Auto Save</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isAutoSaveEnabled 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {isAutoSaveEnabled ? 'ON' : 'OFF'}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {isAutoSaveEnabled 
                          ? 'Notes will be saved automatically every 2 seconds' 
                          : 'Manual save required'
                        }
                      </p>
                    </div>
                    
                    <button
                      onClick={handleToggleAutoSave}
                      className="ml-4 p-1 transition-colors"
                    >
                      {isAutoSaveEnabled ? (
                        <ToggleRight className="h-8 w-8 text-green-400" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {isAutoSaveEnabled && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center space-x-2 text-green-300 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Auto Save Active</span>
                      </div>
                      <p className="text-green-400/80 text-xs mt-1">
                        Your notes will be automatically saved every 2 seconds while you type. You'll see a notification when each auto-save occurs.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tips:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Auto save only works when you have a note title</li>
                    <li>• Manual save is still available when auto save is enabled</li>
                    <li>• Auto save pauses when you haven't typed for more than 5 seconds</li>
                    <li>• Your changes are also saved when you navigate away from a note</li>
                  </ul>
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
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
