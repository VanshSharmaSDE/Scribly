import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Sparkles, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ocrService from '../services/ocrService';
import aiService from '../services/aiService';
import notesService from '../services/notesService';
import settingsService from '../services/settingsService';
import PhotoUpload from '../components/PhotoUpload';
import Button from '../components/Button';
import Input from '../components/Input';
import TagManager from '../components/TagManager';
import EmojiPicker from '../components/EmojiPicker';

const PhotoTextExtraction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('upload'); // upload, processing, editing, saving
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrResults, setOcrResults] = useState(null);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    emoji: '📝',
    tags: [],
    starred: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    checkAIAvailability();
    
    // Initialize OCR service
    initializeOCR();
    
    return () => {
      // Cleanup OCR service when component unmounts
      ocrService.terminate();
    };
  }, []);

  const checkAIAvailability = async () => {
    try {
      const settings = await settingsService.getUserSettings(user.userId);
      const hasApiKey = settings?.geminiApiKey && settings.geminiApiKey.trim() !== '';
      setAiAvailable(hasApiKey);
    } catch (error) {
      console.error('Error checking AI availability:', error);
      setAiAvailable(false);
    }
  };

  const initializeOCR = async () => {
    try {
      if (!ocrService.isReady()) {
        console.log('Initializing OCR service...');
        await ocrService.initialize();
      }
    } catch (error) {
      console.error('Failed to initialize OCR:', error);
      toast.error('Failed to initialize text extraction service');
    }
  };

  const handleFileUpload = async (file) => {
    setSelectedFile(file);
    setShowUploadModal(false);
    setIsProcessing(true);
    setStep('processing');
    
    try {
      // Get user settings to determine AI preference
      setProcessingStep('Checking AI settings...');
      const settings = await settingsService.getUserSettings(user.userId);
      const useLocalAI = settings?.aiProvider === 'local';

      // Extract text with AI enhancement
      setProcessingStep('Extracting and enhancing text...');
      const results = await ocrService.extractText(file, {
        enhanceWithAI: true,
        useLocalAI: useLocalAI
      });
      
      if (!results.text || results.text.trim().length === 0) {
        throw new Error('No text found in the image. Please try with a clearer image.');
      }

      setExtractedText(results.text);
      setOcrResults(results);

      // Use AI-enhanced note if available
      if (results.enhancedNote) {
        const enhanced = results.enhancedNote.enhancedNote;
        
        setNoteData({
          title: enhanced.title || extractBasicTitle(results.text),
          content: enhanced.content || results.text,
          emoji: '✨',
          tags: enhanced.tags || ['extracted-text'],
          starred: false
        });

        setGeneratedTitle(enhanced.title);
        setGeneratedTags(enhanced.tags || []);
        
        const provider = results.enhancedNote.aiProvider;
        toast.success(`Text extracted and enhanced with ${provider === 'local' ? 'Local AI' : 'Gemini AI'}!`);
      } else {
        // Fallback to basic extraction
        const basicTitle = extractBasicTitle(results.text);
        const basicTags = ['extracted-text', 'photo'];

        setNoteData({
          title: basicTitle,
          content: results.text,
          emoji: '📝',
          tags: basicTags,
          starred: false
        });

        setGeneratedTitle(basicTitle);
        setGeneratedTags(basicTags);
        
        toast.success('Text extracted successfully!');
      }

      setStep('editing');

    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to extract text from image');
      setStep('upload');
      setShowUploadModal(true);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const generateTitleAndTags = async (text) => {
    try {
      const settings = await settingsService.getUserSettings(user.userId);
      
      if (!settings?.geminiApiKey) {
        throw new Error('AI service not configured');
      }

      // Initialize AI service
      await aiService.initialize(settings.geminiApiKey);

      // Generate title
      const titlePrompt = `Based on the following extracted text, generate a concise and descriptive title (max 60 characters). Only return the title, nothing else:

${text.substring(0, 500)}...`;

      const titleResponse = await aiService.generateContent(titlePrompt);
      const title = titleResponse.trim().replace(/['"]/g, '');
      setGeneratedTitle(title);

      // Generate tags
      const tagsPrompt = `Based on the following extracted text, generate 3-5 relevant tags. Return only the tags separated by commas, no other text:

${text.substring(0, 500)}...`;

      const tagsResponse = await aiService.generateContent(tagsPrompt);
      const tags = tagsResponse
        .split(',')
        .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, ''))
        .filter(tag => tag.length > 0 && tag.length <= 20)
        .slice(0, 5);
      
      setGeneratedTags(['extracted-text', ...tags]);

    } catch (error) {
      console.error('Error generating title and tags:', error);
      // Fallback to basic extraction
      const fallbackTitle = extractBasicTitle(text);
      setGeneratedTitle(fallbackTitle);
      setGeneratedTags(['extracted-text']);
    }
  };

  const extractBasicTitle = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return 'Extracted Text Note';
    
    const firstLine = lines[0].trim();
    return firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
  };

  const handleSaveNote = async () => {
    if (!noteData.title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    if (!noteData.content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    setIsProcessing(true);
    setStep('saving');

    try {
      const noteToSave = {
        ...noteData,
        userId: user.userId,
        content: noteData.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedNote = await notesService.createNote(noteToSave);
      
      toast.success('Note created successfully!');
      navigate(`/notes/view/${savedNote.$id}`);

    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note. Please try again.');
      setStep('editing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    if (step === 'editing') {
      setStep('upload');
      setShowUploadModal(true);
      setSelectedFile(null);
      setExtractedText('');
      setOcrResults(null);
      setNoteData({
        title: '',
        content: '',
        emoji: '📝',
        tags: [],
        starred: false
      });
    } else {
      navigate('/dashboard');
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    navigate('/dashboard');
  };

  if (showUploadModal) {
    return (
      <PhotoUpload
        onTextExtracted={handleFileUpload}
        onClose={closeUploadModal}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Photo Text Extraction</h1>
                  <p className="text-gray-400 text-sm">
                    {step === 'processing' && 'Processing your image...'}
                    {step === 'editing' && 'Edit and save your note'}
                    {step === 'saving' && 'Saving your note...'}
                  </p>
                </div>
              </div>
            </div>

            {step === 'editing' && (
              <Button
                onClick={handleSaveNote}
                disabled={isProcessing || !noteData.title.trim() || !noteData.content.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Processing Step */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Processing Image</h2>
                  <p className="text-gray-400">{processingStep}</p>
                </div>

                {selectedFile && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Processing"
                      className="w-full max-h-48 object-contain rounded"
                    />
                    <p className="text-sm text-gray-400 mt-2">{selectedFile.name}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Editing Step */}
          {step === 'editing' && (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* OCR Results Summary */}
              {ocrResults && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="font-medium text-green-300">Text Extraction Complete</h3>
                  </div>
                  <div className="text-sm text-green-400">
                    Extracted {ocrResults.words} words with {ocrResults.confidence.toFixed(1)}% confidence
                  </div>
                </div>
              )}

              {/* Note Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Note Details */}
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Note Details
                    </h3>

                    <div className="space-y-4">
                      {/* Emoji and Title */}
                      <div className="flex gap-3">
                        <EmojiPicker
                          selectedEmoji={noteData.emoji}
                          onEmojiSelect={(emoji) => setNoteData({ ...noteData, emoji })}
                        />
                        <div className="flex-1">
                          <Input
                            label="Title"
                            value={noteData.title}
                            onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                            placeholder="Enter note title..."
                            required
                          />
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tags
                        </label>
                        <TagManager
                          tags={noteData.tags}
                          onTagsChange={(tags) => setNoteData({ ...noteData, tags })}
                          suggestions={generatedTags}
                        />
                      </div>

                      {/* AI Generated Info */}
                      {aiAvailable && (generatedTitle || generatedTags.length > 0) && (
                        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-300">AI Generated</span>
                          </div>
                          <div className="text-sm text-purple-400">
                            Title and tags were automatically generated from the extracted text
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Content Editor */}
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Extracted Content</h3>
                    <textarea
                      value={noteData.content}
                      onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                      placeholder="Extracted text will appear here..."
                      className="w-full h-96 bg-gray-700 text-white rounded-lg p-4 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Review and edit the extracted text as needed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Saving Step */}
          {step === 'saving' && (
            <motion.div
              key="saving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Saving Note</h2>
              <p className="text-gray-400">Creating your note with extracted text...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhotoTextExtraction;
