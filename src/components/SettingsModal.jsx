import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Save, ToggleLeft, ToggleRight, Settings, Bot, Clock, Eye, EyeOff, CheckCircle, Upload, HardDrive, Cloud, Trash2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';
import settingsService from '../services/settingsService';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

// Skeleton Loading Component - Enhanced UX with staggered animations
const SkeletonLoader = ({ className = '', height = 'h-4', width = 'w-full', delay = '0s' }) => (
  <div 
    className={`${height} ${width} bg-gray-700/50 rounded-lg animate-pulse ${className}`}
    style={{ animationDelay: delay }}
  ></div>
);

// Enhanced Skeleton Card with comprehensive loading states for better UX
const SkeletonCard = ({ children, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Provider Selection Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <SkeletonLoader height="h-6" width="w-6" className="rounded-lg" delay="0s" />
            <SkeletonLoader height="h-6" width="w-32" delay="0.1s" />
          </div>
          <SkeletonLoader height="h-4" width="w-3/4" delay="0.2s" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLoader height="h-20" delay="0.3s" />
            <SkeletonLoader height="h-20" delay="0.4s" />
          </div>
        </div>
        
        {/* Settings Section Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <SkeletonLoader height="h-6" width="w-6" className="rounded-lg" delay="0.5s" />
            <SkeletonLoader height="h-6" width="w-40" delay="0.6s" />
          </div>
          <SkeletonLoader height="h-4" width="w-2/3" delay="0.7s" />
          <div className="space-y-3">
            <SkeletonLoader height="h-12" delay="0.8s" />
            <SkeletonLoader height="h-12" delay="0.9s" />
            <SkeletonLoader height="h-12" delay="1.0s" />
          </div>
          <div className="flex space-x-3">
            <SkeletonLoader height="h-10" width="w-24" delay="1.1s" />
            <SkeletonLoader height="h-10" width="w-24" delay="1.2s" />
          </div>
        </div>
        
        {/* Additional Info Skeleton */}
        <div className="space-y-3">
          <SkeletonLoader height="h-16" delay="0.8s" />
        </div>
      </div>
    );
  }
  return children;
};

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiProvider, setAiProvider] = useState(''); // Start with empty string to avoid false toast
  const [localModelPath, setLocalModelPath] = useState('');
  const [modelStatus, setModelStatus] = useState('not-loaded'); // 'not-loaded', 'loading', 'loaded', 'error'
  const [modelInfo, setModelInfo] = useState(null);
  const [isModelInitialized, setIsModelInitialized] = useState(false);
  const [showLocalAIWarning, setShowLocalAIWarning] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ progress: 0, text: '', timeElapsed: 0 });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [activeTab, setActiveTab] = useState('ai');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAutoSaveConfirm, setShowAutoSaveConfirm] = useState(false);
  const [pendingAutoSaveChange, setPendingAutoSaveChange] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

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
          // Only set aiProvider if it's different from current to avoid unnecessary toast
          const newProvider = settings.aiProvider || 'gemini';
          if (aiProvider !== newProvider) {
            setAiProvider(newProvider);
          }
          setLocalModelPath(settings.localModelPath || '');
          setIsAutoSaveEnabled(settings.autoSaveEnabled);
          setAutoSaveInterval(settings.autoSaveInterval);
        } else {
          // Set defaults only if no settings found
          if (!aiProvider) setAiProvider('gemini');
          setApiKey('');
          setLocalModelPath('');
          setIsAutoSaveEnabled(true);
          setAutoSaveInterval(30);
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
        // Set defaults instead of localStorage fallback
        setApiKey('');
        if (!aiProvider) setAiProvider('gemini');
        setLocalModelPath('');
        setIsAutoSaveEnabled(true);
        setAutoSaveInterval(30);
      } finally {
        setLoading(false);
        
        // Load available models for local AI
        const loadModels = async (settingsData) => {
          try {
            const localAIService = (await import('../services/localAIService')).default;
            const models = localAIService.getAvailableModels();
            setAvailableModels(models);
            
            // Check if a model is currently loaded and update status accordingly
            if (settingsData?.localModelPath && settingsData?.aiProvider === 'local') {
              await checkModelStatus(settingsData.localModelPath);
            }
          } catch (error) {
            console.error('Failed to load available models:', error);
          }
        };
        loadModels();
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
        console.warn('Failed to save API key to cloud:', error);
        // Don't use localStorage fallback - let the user know it failed
      }
    }
  };

  // Handle AI provider change
  const handleAiProviderChange = async (provider) => {
    const previousProvider = aiProvider;
    
    // Show warning popup when switching from cloud to local
    if (previousProvider === 'gemini' && provider === 'local') {
      setShowLocalAIWarning(true);
      return; // Don't proceed with the change yet
    }
    
    setAiProvider(provider);
    
    if (user) {
      try {
        await settingsService.updateAiProvider(user.$id, provider);
        // Only show toast if the provider actually changed
        if (previousProvider !== provider) {
          toast.success(`AI Provider set to ${provider === 'gemini' ? 'Cloud AI (Gemini)' : 'Local AI'}`);
        }
      } catch (error) {
        console.warn('Failed to save AI provider:', error);
        // Revert the state change if save failed
        setAiProvider(previousProvider);
        toast.error('Failed to save AI provider setting');
      }
    }
  };

  // Confirm local AI switch after warning
  const confirmLocalAISwitch = async () => {
    setShowLocalAIWarning(false);
    setAiProvider('local');
    
    if (user) {
      try {
        await settingsService.updateAiProvider(user.$id, 'local');
        toast.success('AI Provider set to Local AI');
      } catch (error) {
        console.warn('Failed to save AI provider:', error);
        setAiProvider('gemini'); // Revert on error
        toast.error('Failed to save AI provider setting');
      }
    } else {
      // Show success toast even for users not logged in
      toast.success('AI Provider set to Local AI');
    }
  };

  // Handle local model selection
  const handleModelSelect = async (modelId) => {
    // Check if this model is already selected and initialized
    if (localModelPath === modelId && isModelInitialized) {
      toast.success('This model is already downloaded and ready to use!');
      return;
    }

    // Reset any previous cancelling state
    setIsCancelling(false);
    
    setLocalModelPath(modelId);
    setModelStatus('loading');
    setShowDownloadModal(true);
    setDownloadProgress({ progress: 0, text: 'Preparing download...', timeElapsed: 0 });
    
    try {
      // Save the selected model to settings
      if (user) {
        await settingsService.updateLocalModelPath(user.$id, modelId);
      }
      
      // Initialize the actual model with WebLLM
      const localAIService = (await import('../services/localAIService')).default;
      
      // Clear any existing callbacks to prevent duplicates
      localAIService.clearProgressCallback();
      
      // Set up new progress callback
      localAIService.setProgressCallback((progress) => {
        setDownloadProgress(progress);
        
        if (progress.error) {
          setModelStatus('error');
          setIsModelInitialized(false);
          setShowDownloadModal(false);
          localAIService.clearProgressCallback();
          return;
        }
        
        if (progress.cancelled) {
          setModelStatus('not-loaded');
          setIsModelInitialized(false);
          setShowDownloadModal(false);
          localAIService.clearProgressCallback();
          toast.error('Download cancelled');
          return;
        }
        
        if (progress.progress >= 1) {
          setModelStatus('loaded');
          setIsModelInitialized(true);
          setModelInfo({
            name: modelId.split('-')[0] + ' ' + modelId.split('-')[1],
            id: modelId
          });
          setTimeout(() => {
            setShowDownloadModal(false);
            localAIService.clearProgressCallback();
            toast.success('Local AI model loaded successfully!');
          }, 1000);
        }
      });
      
      await localAIService.initializeModel(modelId);
      
    } catch (error) {
      console.error('Failed to load model:', error);
      setModelStatus('error');
      setIsModelInitialized(false);
      setShowDownloadModal(false);
      
      // Clear callbacks on error
      const localAIService = (await import('../services/localAIService')).default;
      localAIService.clearProgressCallback();
      
      toast.error('Failed to load AI model: ' + error.message);
    }
  };

  // Handle canceling download
  const handleCancelDownload = async () => {
    // Prevent multiple clicks
    if (isCancelling) return;
    
    try {
      setIsCancelling(true);
      
      // Show immediate feedback
      toast.loading('Cancelling download and clearing data...');
      
      // Update progress to show cancellation and cleanup in progress
      setDownloadProgress({ 
        progress: 0, 
        text: 'Cancelling download and clearing cached data...', 
        timeElapsed: 0 
      });
      
      const localAIService = (await import('../services/localAIService')).default;
      
      // Clear callbacks immediately
      localAIService.clearProgressCallback();
      
      // Cancel the download and clear cached data
      const cancelled = await localAIService.cancelDownload();
      
      // Also explicitly clear model cache to ensure downloaded data is removed
      const cacheCleared = await localAIService.clearModelCache();
      
      // Update UI state after successful cancellation and cleanup
      setModelStatus('not-loaded');
      setIsModelInitialized(false);
      setShowDownloadModal(false);
      setDownloadProgress({ progress: 0, text: '', timeElapsed: 0 });
      setLocalModelPath('');
      
      // Update settings to clear model path
      if (user) {
        await settingsService.updateLocalModelPath(user.$id, '');
      }
      
      if (cancelled && cacheCleared) {
        toast.success('Download cancelled and all cached data cleared');
        
        // Update storage info to reflect freed space
        await updateStorageInfo();
      } else if (cancelled) {
        toast.success('Download cancelled (cache clearing may be incomplete)');
      } else {
        toast.error('Download cancellation failed, but UI has been reset');
      }
      
    } catch (error) {
      console.error('Failed to cancel download:', error);
      toast.error('Failed to cancel download: ' + error.message);
    } finally {
      // Reset cancelling state after a brief delay for extra safety
      setTimeout(() => {
        setIsCancelling(false);
      }, 300);
      // Ensure UI is in correct state
      setDownloadProgress({ progress: 0, text: '', timeElapsed: 0 });
    }
  };

  // Handle local model file selection (deprecated - keeping for backward compatibility)
  const handleModelFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // For browser security, we can only get the file name, not the actual path
    // In a real implementation, you'd need to handle the file upload/storage differently
    const fileName = file.name;
    setLocalModelPath(fileName);
    setModelStatus('loading');
    
    try {
      // Save the model file name to settings (in real app, you'd upload the file)
      if (user) {
        await settingsService.updateLocalModelPath(user.$id, fileName);
      }
      
      // For demo purposes, simulate loading based on file name
      setTimeout(() => {
        if (fileName.includes('.gguf') || fileName.includes('.bin')) {
          setModelStatus('loaded');
          setModelInfo({
            name: fileName,
            size: (file.size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
          });
          toast.success('Local AI model path saved! (Note: In production, actual model loading would be implemented)');
        } else {
          setModelStatus('error');
          toast.error('Please select a valid .gguf or .bin model file');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Failed to save model path:', error);
      setModelStatus('error');
      toast.error('Failed to save model path. Please try again.');
    }
  };

  // Test local model
  const testLocalModel = async () => {
    if (modelStatus !== 'loaded') {
      toast.error('Please load a model first');
      return;
    }
    
    try {
      setIsValidating(true);
      
      // Test the actual loaded model
      const localAIService = (await import('../services/localAIService')).default;
      
      // First check if model is ready
      if (!localAIService.isReady()) {
        toast.error('Model not loaded. Please load the model first.');
        return;
      }
      
      const testResult = await localAIService.testModel();
      
      if (testResult.success) {
        toast.success('Local AI model is working correctly!');
      } else {
        toast.error('Model test failed: ' + testResult.error);
      }
      
    } catch (error) {
      console.error('Model test failed:', error);
      toast.error('Model test failed: ' + error.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-initialize model if not ready when needed
  const checkModelStatus = async (modelId) => {
    if (!modelId) return;
    
    try {
      const localAIService = (await import('../services/localAIService')).default;
      
      // Check if model is already ready
      if (localAIService.isReady() && localAIService.getCurrentModel() === modelId) {
        setModelStatus('loaded');
        setIsModelInitialized(true);
        setModelInfo({
          name: modelId.split('-')[0] + ' ' + modelId.split('-')[1],
          id: modelId
        });
      } else {
        setModelStatus('not-loaded');
        setIsModelInitialized(false);
      }
      
    } catch (error) {
      console.error('Failed to check model status:', error);
      setModelStatus('error');
      setIsModelInitialized(false);
    }
  };

  // Delete local model
  const handleDeleteModel = async () => {
    try {
      setIsDeleting(true);
      
      const localAIService = (await import('../services/localAIService')).default;
      const result = await localAIService.deleteModel(localModelPath);
      
      if (result.success) {
        // Reset model state
        setLocalModelPath('');
        setModelStatus('not-loaded');
        setModelInfo(null);
        
        // Update settings
        if (user) {
          await settingsService.updateLocalModelPath(user.$id, '');
        }
        
        // Update storage info
        await updateStorageInfo();
        
        toast.success(`Model deleted successfully! Freed up storage space.`);
      } else {
        toast.error('Failed to delete model: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      toast.error('Failed to delete model: ' + error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Update storage info
  const updateStorageInfo = async () => {
    try {
      const localAIService = (await import('../services/localAIService')).default;
      const info = await localAIService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  };

  // Load storage info on component mount
  useEffect(() => {
    if (isOpen && aiProvider === 'local') {
      updateStorageInfo();
    }
  }, [isOpen, aiProvider]);

  // Check model status when localModelPath or aiProvider changes
  useEffect(() => {
    if (isOpen && aiProvider === 'local' && localModelPath) {
      checkModelStatus(localModelPath);
    }
  }, [isOpen, aiProvider, localModelPath]);

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
          await settingsService.updateGeminiApiKey(user.$id, apiKey.trim());
          toast.success('API key saved successfully!');
        } else {
          toast.error('Please log in to save your API key');
        }
      } else {
        if (user) {
          await settingsService.updateGeminiApiKey(user.$id, '');
          toast.success('API key removed');
        } else {
          toast.error('Please log in to manage your API key');
        }
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('Failed to save API key. Please try again.');
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
    <>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[98vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
            {loading ? (
              <div className="flex items-center space-x-3">
                <SkeletonLoader height="h-10" width="w-10" className="rounded-lg" delay="0s" />
                <div>
                  <SkeletonLoader height="h-6" width="w-24" className="mb-2" delay="0.1s" />
                  <SkeletonLoader height="h-4" width="w-32" delay="0.2s" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Settings</h2>
                  <p className="text-sm text-gray-400">Manage your preferences</p>
                </div>
              </div>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          {loading ? (
            <div className="flex border-b border-gray-700/50">
              <SkeletonLoader height="h-12" width="w-32" className="mx-6 my-4" delay="0s" />
              <SkeletonLoader height="h-12" width="w-32" className="mx-6 my-4" delay="0.1s" />
            </div>
          ) : (
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
          )}

          <div className="p-4 sm:p-6 max-h-[calc(95vh-200px)] sm:max-h-[calc(95vh-240px)] overflow-y-auto">
            {activeTab === 'ai' && (
              <SkeletonCard isLoading={loading}>
                <div className="space-y-6">
                  {/* AI Provider Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Bot className="h-5 w-5 mr-2 text-blue-400" />
                      AI Provider
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Choose between cloud-based AI or run AI models locally on your device.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => handleAiProviderChange('gemini')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        aiProvider === 'gemini'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Cloud className="h-5 w-5" />
                        <span className="font-medium">Cloud AI</span>
                      </div>
                      <p className="text-xs opacity-70">Google Gemini API</p>
                      <p className="text-xs opacity-70 mt-1">Fast, reliable, requires API key</p>
                    </button>
                    
                    <button
                      onClick={() => handleAiProviderChange('local')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        aiProvider === 'local'
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <HardDrive className="h-5 w-5" />
                        <span className="font-medium">Local AI</span>
                        <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-medium">
                          BETA
                        </span>
                      </div>
                      <p className="text-xs opacity-70">Run models locally</p>
                      <p className="text-xs opacity-70 mt-1">Private, offline, requires model file</p>
                    </button>
                  </div>
                </div>

                {/* Gemini API Settings */}
                {aiProvider === 'gemini' && (
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

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <Button
                            onClick={handleSaveApiKey}
                            className="bg-blue-600 items-center flex justify-center hover:bg-blue-700 text-white px-4 py-2 min-w-[120px] w-full sm:w-auto"
                            disabled={loading || isSaving}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save API Key'}
                          </Button>
                          
                          {apiKey.trim() && (
                            <Button
                              onClick={() => validateApiKey()}
                              className="bg-green-600 items-center flex justify-center hover:bg-green-700 text-white px-4 py-2 min-w-[120px] w-full sm:w-auto"
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
                        
                        <div className="text-xs text-gray-500 mt-4 sm:mt-0">
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
                )}

                {/* Local AI Settings */}
                {aiProvider === 'local' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <HardDrive className="h-5 w-5 mr-2 text-green-400" />
                      Local AI Model
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-medium">
                        BETA
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Select an AI model to run locally in your browser. Models are automatically downloaded and cached when first used.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Model Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Choose Model ({availableModels.length} available, optimized for browser)
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {availableModels.map((model) => {
                            const isSelected = localModelPath === model.id;
                            const isInitialized = isSelected && isModelInitialized && modelStatus === 'loaded';
                            const isDisabled = isInitialized;
                            
                            return (
                              <button
                                key={model.id}
                                onClick={() => !isDisabled && handleModelSelect(model.id)}
                                disabled={isDisabled}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                  isInitialized
                                    ? 'bg-green-500/20 border-green-500/50 text-green-300 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                    : 'bg-gray-800/30 border-gray-600/30 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50 cursor-pointer'
                                } ${isDisabled ? 'opacity-75' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium flex items-center space-x-2">
                                      <span>
                                        {model.name}
                                        {model.id === 'Phi-3-mini-4k-instruct-q4f16_1-MLC' && ' (Recommended)'}
                                      </span>
                                      {isInitialized && (
                                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                          READY
                                        </span>
                                      )}
                                      {isSelected && !isInitialized && modelStatus !== 'loading' && (
                                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                          NEEDS INIT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs opacity-70 mt-1">
                                      {model.size} • {model.category} model
                                    </div>
                                    <div className="text-xs opacity-60 mt-1">
                                      {model.description}
                                    </div>
                                    <div className="text-xs opacity-50 mt-1">
                                      {model.recommended}
                                    </div>
                                    {isInitialized && (
                                      <div className="text-xs text-green-400 mt-2 font-medium">
                                        ✓ Downloaded and ready to use
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end space-y-1">
                                    {isInitialized && (
                                      <CheckCircle className="h-5 w-5 text-green-400" />
                                    )}
                                    {isSelected && !isInitialized && (
                                      <div className="text-xs text-yellow-400">Click to initialize</div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Model Status */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="text-white font-medium">Model Status</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              modelStatus === 'loaded' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : modelStatus === 'loading'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : modelStatus === 'error'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {modelStatus === 'loaded' && 'READY'}
                              {modelStatus === 'loading' && 'DOWNLOADING...'}
                              {modelStatus === 'error' && 'ERROR'}
                              {modelStatus === 'not-loaded' && 'SELECT MODEL'}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                            {localModelPath && modelStatus !== 'loading' && (
                              <>
                                <Button
                                  onClick={testLocalModel}
                                  className="bg-green-600 items-center flex justify-center hover:bg-green-700 text-white px-4 py-2 min-w-[100px] w-full sm:w-auto"
                                  disabled={isValidating || modelStatus !== 'loaded'}
                                >
                                  {isValidating ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {isValidating ? 'Testing...' : 'Test'}
                                </Button>
                                
                                <Button
                                  onClick={() => setShowDeleteConfirm(true)}
                                  className="bg-red-600 items-center flex justify-center hover:bg-red-700 text-white px-4 py-2 min-w-[100px] w-full sm:w-auto"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Storage Information */}
                        {storageInfo && (
                          <div className="p-4 bg-gray-800/20 border border-gray-600/30 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-300">Browser Storage</span>
                              <button 
                                onClick={updateStorageInfo}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Refresh
                              </button>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Used: {storageInfo.usedGB} GB</span>
                              <span>Available: {storageInfo.availableGB} GB</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((storageInfo.used / storageInfo.available) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Information */}
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">How it works:</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                          <li>• Models run entirely in your browser using WebAssembly</li>
                          <li>• First-time setup downloads and caches the model automatically</li>
                          <li>• No internet required after initial download</li>
                          <li>• Your data never leaves your device</li>
                          <li>• Models are cached for future sessions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </SkeletonCard>
            )}

            {activeTab === 'general' && (
              <SkeletonCard isLoading={loading}>
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
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl mb-2">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {autoSaveOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleAutoSaveSettingsChange(isAutoSaveEnabled, option.value)}
                                  disabled={isSaving}
                                  className={`p-3 rounded-xl border text-left transition-all min-h-[60px] ${
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

                      <div className="p-4 bg-gray-800/30 border border-gray-600/50 rounded-xl mt-4">
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
              </SkeletonCard>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t border-gray-700/50 p-4 sm:p-6 bg-gray-900/95">
            <div className="flex justify-end">
              <Button
                onClick={handleClose}
                variant="outline"
                className="px-4 sm:px-6 py-2 w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
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
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={cancelAutoSaveChange}
                    variant="outline"
                    className="flex-1 px-4 py-2 min-h-[40px]"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAutoSaveChange}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 min-h-[40px] flex items-center justify-center"
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

        {/* Delete Model Confirmation Modal */}
        {showDeleteConfirm && (
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
                <div className="p-3 bg-red-500/20 rounded-full inline-flex mb-4">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete AI Model?
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  This will permanently delete the <span className="font-medium text-red-300">{modelInfo?.name || 'current model'}</span> from your browser's cache and free up storage space. You'll need to download it again if you want to use it later.
                </p>
                
                {storageInfo && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                    <div className="text-xs text-red-300 mb-1">
                      💾 Storage Impact
                    </div>
                    <div className="text-xs text-gray-400">
                      Currently using {storageInfo.usedGB} GB of {storageInfo.availableGB} GB available
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 px-4 py-2 min-h-[40px]"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteModel}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center px-4 py-2 min-h-[40px]"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Model
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Download Progress Modal */}
        {showDownloadModal && (
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
                  <HardDrive className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Downloading AI Model
                </h3>
                <p className="text-gray-300 text-sm mb-6">
                  {downloadProgress.text || 'Preparing download...'}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(downloadProgress.progress || 0) * 100}%` }}
                  ></div>
                </div>
                
                {/* Progress Details */}
                <div className="flex justify-between text-xs text-gray-400 mb-4">
                  <span>{Math.round((downloadProgress.progress || 0) * 100)}% complete</span>
                  <span>
                    {downloadProgress.timeElapsed ? 
                      `${Math.round(downloadProgress.timeElapsed)}s elapsed` : 
                      'Initializing...'
                    }
                  </span>
                </div>
                
                {/* Cancel Button */}
                <div className="mb-4">
                  <Button
                    onClick={handleCancelDownload}
                    variant="secondary"
                    size="sm"
                    disabled={isCancelling}
                    className="bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed mx-auto px-4 py-2 min-w-[160px] w-full sm:w-auto"
                  >
                    {isCancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                        Clearing Data...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel & Clear Data
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-xs">
                    💡 This model will be cached in your browser for future use. The download only happens once!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>

    {/* Local AI Warning Modal */}
    <AnimatePresence>
      {showLocalAIWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLocalAIWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900/95 backdrop-blur-sm border border-yellow-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-yellow-500/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <HardDrive className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-white">Switching to Local AI</h3>
                    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-medium">
                      BETA
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Important Performance Notice</p>
                </div>
              </div>
              <button
                onClick={() => setShowLocalAIWarning(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <h4 className="text-yellow-300 font-medium mb-2">⚠️ Performance Notice</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Local AI models run directly in your browser using your device's CPU and GPU. 
                    Response times may be slower compared to cloud AI, depending on your machine's specifications.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Factors affecting speed:</strong> CPU performance, available RAM, and browser optimization</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Benefits:</strong> Complete privacy, offline functionality, no API costs</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Note:</strong> This is normal behavior and not a software fault</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Button
                  onClick={() => setShowLocalAIWarning(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 min-w-[120px] w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLocalAISwitch}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white min-w-[120px] w-full sm:w-auto"
                >
                  Switch to Local AI
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default SettingsModal;

