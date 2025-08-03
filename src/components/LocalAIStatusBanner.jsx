import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Download, Settings, X, RefreshCw } from 'lucide-react';
import { useLocalAI } from '../hooks/useLocalAI';
import { useSettings } from '../contexts/SettingsContext';
import Button from './Button';

const LocalAIStatusBanner = () => {
  const { localAIStatus, initializeLocalAI } = useLocalAI();
  const { settings } = useSettings();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Only show if user has selected local AI provider but model is not ready
  const shouldShow = 
    settings?.aiProvider === 'local' && 
    settings?.localModelPath && 
    !localAIStatus.isReady && 
    !isDismissed;

  if (!shouldShow) return null;

  const handleInitialize = async () => {
    if (!settings?.localModelPath) return;
    
    setIsInitializing(true);
    try {
      await initializeLocalAI(settings.localModelPath);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleOpenSettings = () => {
    // Dispatch custom event to open settings modal
    window.dispatchEvent(new CustomEvent('openSettings', { detail: { tab: 'ai' } }));
  };

  const getBannerContent = () => {
    if (localAIStatus.isLoading) {
      return {
        icon: <RefreshCw className="h-5 w-5 animate-spin" />,
        title: 'Initializing Local AI Model',
        message: `Loading "${settings.localModelPath}"... This may take a few moments.`,
        action: 'Initializing...',
        actionHandler: () => {}, // No action while loading
        actionIcon: <RefreshCw className="h-4 w-4 animate-spin" />,
        variant: 'info'
      };
    } else if (localAIStatus.needsInitialization && localAIStatus.error === 'Model not downloaded yet') {
      return {
        icon: <Download className="h-5 w-5" />,
        title: 'Local AI Model Not Downloaded',
        message: `Your selected model "${settings.localModelPath}" needs to be downloaded first.`,
        action: 'Download Model',
        actionHandler: handleOpenSettings,
        actionIcon: <Settings className="h-4 w-4" />,
        variant: 'warning'
      };
    } else if (localAIStatus.needsInitialization) {
      return {
        icon: <AlertCircle className="h-5 w-5" />,
        title: 'Initialize Local AI Model',
        message: `Click to initialize "${settings.localModelPath}" for AI features.`,
        action: 'Initialize Model',
        actionHandler: handleInitialize,
        actionIcon: <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />,
        variant: 'info'
      };
    } else {
      return {
        icon: <AlertCircle className="h-5 w-5" />,
        title: 'Local AI Model Issue',
        message: localAIStatus.error || 'There was an issue with your local AI model.',
        action: 'Open Settings',
        actionHandler: handleOpenSettings,
        actionIcon: <Settings className="h-4 w-4" />,
        variant: 'error'
      };
    }
  };

  const bannerContent = getBannerContent();
  
  const variants = {
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300'
  };

  const iconVariants = {
    warning: 'text-yellow-400',
    info: 'text-blue-400', 
    error: 'text-red-400'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -50, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative border rounded-lg p-4 mb-4 ${variants[bannerContent.variant]}`}
      >
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 ${iconVariants[bannerContent.variant]}`}>
            {bannerContent.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1">
              {bannerContent.title}
            </h4>
            <p className="text-sm opacity-90">
              {bannerContent.message}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={bannerContent.actionHandler}
              disabled={isInitializing || localAIStatus.isLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-sm px-3 py-1"
            >
              {bannerContent.actionIcon}
              <span>{bannerContent.action}</span>
            </Button>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocalAIStatusBanner;
