import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Save, Edit, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import aiService from '../services/aiService';
import { parseMarkdown } from '../utils/markdown';
import { useSettings } from '../contexts/SettingsContext';
import settingsService from '../services/settingsService';

const AIGeneratorModal = ({ 
  isOpen, 
  onClose, 
  onSaveNote, 
  onEditNote,
  isAIConfigured = true // Default to true since Dashboard pre-checks this
}) => {
  const { settings } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNote, setGeneratedNote] = useState(null);
  const [noteOptions, setNoteOptions] = useState({
    noteType: 'general',
    tone: 'professional',
    language: 'English'
  });

  const noteTypes = [
    { value: 'general', label: 'General Note' },
    { value: 'meeting', label: 'Meeting Notes' },
    { value: 'project', label: 'Project Plan' },
    { value: 'todo', label: 'Todo List' },
    { value: 'research', label: 'Research Notes' },
    { value: 'brainstorm', label: 'Brainstorm Ideas' },
    { value: 'summary', label: 'Summary' },
    { value: 'analysis', label: 'Analysis' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'creative', label: 'Creative' },
    { value: 'technical', label: 'Technical' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    // The isAIConfigured prop is already checked by the parent component
    // so we trust it and proceed with generation
    setIsGenerating(true);
    try {
      // Initialize AI service based on user settings
      const userSettings = await settingsService.getUserSettings();
      
      if (userSettings.aiProvider === 'local') {
        if (!userSettings.localModelPath) {
          toast.error('Please select a local AI model in settings first.');
          return;
        }
        
        // For local AI, check if it's initialized, if not, show error
        const localAIService = (await import('../services/localAIService')).default;
        if (!localAIService.isReady()) {
          toast.error('Local AI model is not initialized. Please use the dashboard notification to initialize it first.');
          return;
        }
        
        await aiService.setProvider('local', { modelPath: userSettings.localModelPath });
      } else {
        // Use settings from context (now immediately available after API key update)
        const apiKey = settings?.geminiApiKey;
        await aiService.setProvider('gemini', { apiKey });
      }

      const noteData = await aiService.generateNote(prompt, noteOptions);
      
      // Validate the generated note data
      if (!noteData || typeof noteData !== 'object') {
        throw new Error('Invalid note data received from AI service');
      }
      
      if (!noteData.title || !noteData.content) {
        throw new Error('Incomplete note data - missing title or content');
      }
      
      console.log('Generated note data:', noteData);
      setGeneratedNote(noteData);
    } catch (error) {
      console.error('Error generating note:', error);
      toast.error('Failed to generate note: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedNote && onSaveNote) {
      onSaveNote(generatedNote);
      handleReset();
      onClose();
    }
  };

  const handleEdit = () => {
    if (generatedNote && onEditNote) {
      onEditNote(generatedNote);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setPrompt('');
    setGeneratedNote(null);
    setIsGenerating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">AI Note Generator</h2>
                <p className="text-sm text-gray-400">Generate intelligent notes with AI assistance</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            {!generatedNote ? (
              // Generation Form
              <div className="space-y-6">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What kind of note would you like to create?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., 'Create a meeting agenda for a product planning session', 'Generate a study guide for machine learning basics', 'Write a project proposal for a mobile app'..."
                    className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all resize-none"
                    disabled={isGenerating}
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Note Type
                    </label>
                    <select
                      value={noteOptions.noteType}
                      onChange={(e) => setNoteOptions(prev => ({ ...prev, noteType: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      disabled={isGenerating}
                    >
                      {noteTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tone
                    </label>
                    <select
                      value={noteOptions.tone}
                      onChange={(e) => setNoteOptions(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      disabled={isGenerating}
                    >
                      {toneOptions.map(tone => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={noteOptions.language}
                      onChange={(e) => setNoteOptions(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                      disabled={isGenerating}
                    >
                      {languageOptions.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex flex-col items-center pt-4 space-y-3">
                  {!isAIConfigured && (
                    <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm text-center">
                      ⚠️ Please configure AI provider in settings (Gemini API key or local model)
                    </div>
                  )}
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating || !isAIConfigured}
                    variant="primary"
                    className="px-8 items-center flex py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Note
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // Generated Note Preview
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    ✨ Note Generated Successfully!
                  </h3>
                  <p className="text-gray-400">Review your AI-generated note below</p>
                </div>

                {/* Note Preview */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{generatedNote?.emoji || '📝'}</span>
                    <h4 className="text-xl font-semibold text-white">{generatedNote?.title || 'Untitled Note'}</h4>
                  </div>

                  <div className="prose prose-invert max-w-none mb-4">
                    <div 
                      className="text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: parseMarkdown(generatedNote?.content || 'No content generated.')
                      }} 
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(generatedNote?.tags || []).map((tag, index) => {
                      // Enhanced security: Ensure tag is safe to render
                      let safeTag = typeof tag === 'string' ? tag : String(tag || 'unknown');
                      
                      // Security check for dangerous patterns
                      if (safeTag.includes('[object') || 
                          safeTag.includes('function') || 
                          safeTag.includes('prototype') ||
                          safeTag.includes('constructor') ||
                          safeTag.includes('__proto__')) {
                        safeTag = 'filtered';
                      }
                      
                      return (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          #{safeTag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    className="px-6 items-center flex py-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    className="px-6 py-2 items-center flex"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Note
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-6 py-2 "
                  >
                    Generate Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIGeneratorModal;

