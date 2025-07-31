import { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settingsService';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);

  // Load settings when user logs in
  useEffect(() => {
    const loadSettings = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);
          const userSettings = await settingsService.getUserSettings();
          setSettings(userSettings);
          
          // Set auto-save preferences
          setAutoSaveEnabled(userSettings.autoSave ?? true);
          setAutoSaveInterval(userSettings.autoSaveInterval ?? 30);
        } catch (error) {

          // Use default settings if loading fails
          const defaultSettings = settingsService.getDefaultSettings();
          setSettings(defaultSettings);
        } finally {
          setLoading(false);
        }
      } else {
        // User not authenticated, use default settings
        const defaultSettings = settingsService.getDefaultSettings();
        setSettings(defaultSettings);
        setLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated, user]);

  // Save settings to Appwrite
  const saveSettings = async (newSettings) => {
    try {
      if (isAuthenticated) {
        await settingsService.saveUserSettings(newSettings);
      }
      setSettings(newSettings);
      
      // Update auto-save preferences
      if (newSettings.preferences) {
        setAutoSaveEnabled(newSettings.preferences.autoSave ?? true);
        setAutoSaveInterval(newSettings.preferences.autoSaveInterval ?? 30);
      }
    } catch (error) {

      throw error;
    }
  };

  // Update Gemini API key
  const updateGeminiApiKey = async (apiKey) => {
    try {
      if (isAuthenticated) {
        await settingsService.updateGeminiApiKey(apiKey);
      }
      
      const updatedSettings = {
        ...settings,
        geminiApiKey: apiKey
      };
      setSettings(updatedSettings);
    } catch (error) {

      throw error;
    }
  };

  // Update auto-save preferences
  const updateAutoSaveSettings = async (autoSave, autoSaveInterval) => {
    try {
      if (isAuthenticated) {
        await settingsService.updateAutoSaveSettings(autoSave, autoSaveInterval);
      }
      
      const updatedSettings = {
        ...settings,
        autoSave: autoSave,
        autoSaveInterval: autoSaveInterval
      };
      setSettings(updatedSettings);
      
      // Update auto-save state
      setAutoSaveEnabled(autoSave);
      setAutoSaveInterval(autoSaveInterval);
    } catch (error) {

      throw error;
    }
  };

  // Get Gemini API key
  const getGeminiApiKey = () => {
    return settings?.geminiApiKey || '';
  };

  // Get auto-save settings
  const getAutoSaveSettings = () => {
    return {
      enabled: settings?.autoSave ?? true,
      interval: settings?.autoSaveInterval ?? 30
    };
  };

  // Clear settings (on logout)
  const clearSettings = () => {
    const defaultSettings = settingsService.getDefaultSettings();
    setSettings(defaultSettings);
    setAutoSaveEnabled(true);
    setAutoSaveInterval(30);
  };

  const value = {
    settings,
    loading,
    autoSaveEnabled,
    autoSaveInterval,
    saveSettings,
    updateGeminiApiKey,
    updateAutoSaveSettings,
    getGeminiApiKey,
    getAutoSaveSettings,
    clearSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

