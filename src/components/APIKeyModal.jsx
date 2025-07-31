import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { toast } from 'react-hot-toast';
import aiService from '../services/aiService';

const APIKeyModal = ({ isOpen, onClose, currentApiKey: propCurrentApiKey, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [displayApiKey, setDisplayApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Use the prop currentApiKey or load from aiService as fallback
      const savedKey = propCurrentApiKey || aiService.getApiKey();
      if (savedKey && savedKey !== propCurrentApiKey) {
        // Only show masked version if it's different from prop
        setDisplayApiKey('••••••••••••••••' + savedKey.slice(-4));
        setIsValid(true);
      } else if (propCurrentApiKey) {
        setDisplayApiKey('••••••••••••••••' + propCurrentApiKey.slice(-4));
        setIsValid(true);
      } else {
        setDisplayApiKey('');
        setIsValid(false);
      }
      setApiKey('');
    }
  }, [isOpen, propCurrentApiKey]);

  const validateApiKey = async (key) => {
    if (!key || key.length < 10) {
      return false;
    }

    try {
      setIsValidating(true);
      // Test the API key by making a simple request
      const isValidKey = await aiService.testApiKey(key);
      return isValidKey;
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    const isValidKey = await validateApiKey(apiKey);
    
    if (isValidKey) {
      aiService.setApiKey(apiKey);
      setIsValid(true);
      setDisplayApiKey('••••••••••••••••' + apiKey.slice(-4));
      
      // Call the onSave prop if provided
      if (onSave) {
        onSave(apiKey);
      }
      
      toast.success('API key saved successfully!');
      onClose();
    } else {
      toast.error('Invalid API key. Please check and try again.');
      setIsValid(false);
    }
  };

  const handleRemoveApiKey = () => {
    aiService.removeApiKey();
    setDisplayApiKey('');
    setIsValid(false);
    setApiKey('');
    
    // Call the onSave prop with empty string if provided
    if (onSave) {
      onSave('');
    }
    
    toast.success('API key removed');
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          className="bg-scribly-gray border border-gray-800 rounded-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-scribly-red/10 rounded-lg">
                <Settings className="w-5 h-5 text-scribly-red" />
              </div>
              <h2 className="text-xl font-semibold text-white">AI Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Current Status */}
          {displayApiKey && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">API Key Active</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Current key: <span className="font-mono">{displayApiKey}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveApiKey}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Remove API Key
              </Button>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Google AI Studio API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI Studio API key"
                className="w-full"
                icon={Key}
              />
            </div>

            {/* Help Text */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300 space-y-2">
                  <p>To get your API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400">
                    <li>Visit Google AI Studio</li>
                    <li>Sign in with your Google account</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste it here</li>
                  </ol>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                  >
                    Open Google AI Studio
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || isValidating}
              className="flex-1"
            >
              {isValidating ? 'Validating...' : 'Save API Key'}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your API key is stored locally and never sent to our servers
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default APIKeyModal;
