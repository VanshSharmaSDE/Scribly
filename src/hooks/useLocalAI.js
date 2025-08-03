import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

export const useLocalAI = () => {
  const { settings } = useSettings();
  const [localAIStatus, setLocalAIStatus] = useState({
    isReady: false,
    isLoading: false,
    error: null,
    modelPath: null,
    needsInitialization: false
  });

  // Check status when component mounts or settings change (no auto-initialization)
  useEffect(() => {
    const checkLocalAIStatus = async () => {
      // Only proceed if user has selected local AI provider
      if (settings?.aiProvider !== 'local' || !settings?.localModelPath) {
        setLocalAIStatus(prev => ({
          ...prev,
          isReady: false,
          isLoading: false,
          needsInitialization: false,
          modelPath: null
        }));
        return;
      }

      try {
        const localAIService = (await import('../services/localAIService')).default;
        
        // Check if already initialized
        const isReady = localAIService.isReady() && localAIService.getCurrentModel() === settings.localModelPath;
        
        setLocalAIStatus(prev => ({
          ...prev,
          isReady: isReady,
          isLoading: false,
          needsInitialization: !isReady,
          error: isReady ? null : 'Model needs manual initialization',
          modelPath: settings.localModelPath
        }));
      } catch (error) {
        console.error('Local AI status check error:', error);
        setLocalAIStatus(prev => ({
          ...prev,
          isReady: false,
          isLoading: false,
          needsInitialization: true,
          error: 'Model needs manual initialization',
          modelPath: settings.localModelPath
        }));
      }
    };

    checkLocalAIStatus();
  }, [settings?.aiProvider, settings?.localModelPath]);

  // Manual initialization function
  const initializeLocalAI = async (modelPath) => {
    setLocalAIStatus(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      needsInitialization: false
    }));

    const toastId = toast.loading('Initializing local AI model...');

    try {
      const localAIService = (await import('../services/localAIService')).default;
      
      // Reset auto-init flag to allow re-attempt
      localAIService.resetAutoInit();
      
      await localAIService.initializeModel(modelPath);
      
      setLocalAIStatus(prev => ({
        ...prev,
        isReady: true,
        isLoading: false,
        modelPath: modelPath
      }));

      toast.success('Local AI model initialized successfully!', { id: toastId });
      return true;
    } catch (error) {
      console.error('Manual local AI initialization failed:', error);
      
      setLocalAIStatus(prev => ({
        ...prev,
        isReady: false,
        isLoading: false,
        needsInitialization: true,
        error: error.message
      }));

      toast.error('Failed to initialize local AI: ' + error.message, { id: toastId });
      return false;
    }
  };

  // Check current status
  const checkStatus = async () => {
    try {
      const localAIService = (await import('../services/localAIService')).default;
      const isReady = localAIService.isReady();
      const currentModel = localAIService.getCurrentModel();
      
      setLocalAIStatus(prev => ({
        ...prev,
        isReady,
        modelPath: currentModel,
        needsInitialization: !isReady && settings?.aiProvider === 'local' && settings?.localModelPath
      }));

      return { isReady, modelPath: currentModel };
    } catch (error) {
      console.error('Error checking local AI status:', error);
      return { isReady: false, modelPath: null };
    }
  };

  return {
    localAIStatus,
    initializeLocalAI,
    checkStatus,
    setLocalAIStatus
  };
};
