import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Key, Save, Eye, EyeOff, Clock } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const SettingCard = ({ icon: Icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center space-x-4 mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
        }}
      >
        <Icon className="w-6 h-6" style={{ color: '#4F70E2' }} />
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.div>
);

const Settings = () => {
  const { settings, updateGeminiApiKey, updateAutoSaveSettings, loading } = useSettings();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Load settings when component mounts
  useEffect(() => {
    if (settings) {
      setGeminiApiKey(settings.geminiApiKey || '');
      setAutoSave(settings.autoSave ?? true);
      setAutoSaveInterval(settings.autoSaveInterval ?? 30);
    }
  }, [settings]);

  const saveGeminiApiKey = async () => {
    try {
      setSaving(true);
      await updateGeminiApiKey(geminiApiKey);
      toast.success('Gemini API key saved successfully!');
    } catch (error) {

      toast.error('Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const saveAutoSaveSettings = async () => {
    try {
      setSaving(true);
      await updateAutoSaveSettings(autoSave, autoSaveInterval);
      toast.success('Auto-save settings saved successfully!');
    } catch (error) {

      toast.error('Failed to save auto-save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading settings...</div>
        </div>
      </ProfessionalBackground>
    );
  }

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 112, 226, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                borderColor: 'rgba(79, 112, 226, 0.3)',
                color: '#4F70E2'
              }}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">User Settings</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Settings
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Customize your Scribly experience with API keys, preferences, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Settings Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Gemini API Key */}
          <SettingCard icon={Key} title="Google Gemini API Key" delay={0.1}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={toggleApiKeyVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Get your free API key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <Button
              onClick={saveGeminiApiKey}
              loading={saving}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save API Key
            </Button>
          </SettingCard>

          {/* Auto-Save Settings */}
          <SettingCard icon={Clock} title="Auto-Save Settings" delay={0.2}>
            <div className="space-y-6">
              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Enable Auto-Save</h3>
                  <p className="text-gray-400 text-sm">Automatically save your notes while typing</p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    autoSave ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ${
                      autoSave ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-Save Interval */}
              {autoSave && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Choose Auto-Save Interval
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {autoSaveOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setAutoSaveInterval(option.value)}
                        className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                          autoSaveInterval === option.value
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-75">{option.description}</div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Selected: <span className="font-medium text-white">
                          {autoSaveOptions.find(opt => opt.value === autoSaveInterval)?.label}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Your notes will be automatically saved every {' '}
                      {autoSaveInterval < 60 
                        ? `${autoSaveInterval} seconds` 
                        : `${Math.floor(autoSaveInterval / 60)} minute${Math.floor(autoSaveInterval / 60) > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={saveAutoSaveSettings}
                loading={saving}
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Auto-Save Settings
              </Button>
            </div>
          </SettingCard>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-3">Need Help?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your settings are automatically synced across all your devices when you're signed in. 
              The Gemini API key enables AI-powered features in your notes, while auto-save ensures 
              your work is never lost. Choose an auto-save interval that matches your workflow - 
              shorter intervals provide more protection but may impact performance on slower devices.
            </p>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Settings;

