import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  X,
  Bold,
  Italic,
  Type,
  List,
  Link2,
  Palette,
  Eye,
  Wand2,
  Sparkles,
  ListOrdered,
  Quote,
  Code,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Table,
  Image,
  Calendar,
  CheckSquare,
  Minus,
  FileText,
  Hash,
  Star,
  Archive,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
  Heart,
  Coffee,
  Lightbulb,
  Target,
  Bookmark,
  Smile,
  Search,
  Clock,
  Settings,
  Camera,
} from "lucide-react";
import Button from "../components/Button";
import ProfessionalBackground from "../components/ProfessionalBackground";
import Breadcrumb from "../components/Breadcrumb";
import TagManager from "../components/TagManager";
import UnsavedChangesModal from "../components/UnsavedChangesModal";
import PhotoUpload from "../components/PhotoUpload";
import { useAuth } from "../contexts/AuthContext";
import notesService from "../services/notesService";
import aiService from "../services/aiService";
import settingsService from "../services/settingsService";
import ocrService from "../services/ocrService";
import { parseMarkdown } from "../utils/markdown";

const NoteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [tags, setTags] = useState([]);
  const [customStyle, setCustomStyle] = useState({
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff",
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
  });

  // Original values to track changes
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [originalEmoji, setOriginalEmoji] = useState("📝");
  const [originalTags, setOriginalTags] = useState([]);
  const [originalCustomStyle, setOriginalCustomStyle] = useState({
    backgroundColor: "#1e3a8a",
    textColor: "#ffffff",
    fontSize: "16px",
    fontFamily: "Inter, sans-serif",
  });

  const [showStylePanel, setShowStylePanel] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingNote, setGeneratingNote] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState("general");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState("");
  const [autoSaveSettings, setAutoSaveSettings] = useState({
    enabled: true,
    interval: 30,
  });
  const [currentNoteId, setCurrentNoteId] = useState(id);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [processingMessages, setProcessingMessages] = useState([]);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Load auto-save settings on component mount
  useEffect(() => {
    const loadAutoSaveSettings = async () => {
      try {
        const settings = await settingsService.getAutoSaveSettings();
        setAutoSaveSettings(settings);
      } catch (error) {
        // Fallback to default settings if error
        setAutoSaveSettings({ enabled: true, interval: 30 });
      }
    };

    if (user) {
      loadAutoSaveSettings();
    }
  }, [user]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            insertText("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertText("*", "*");
            break;
          case "u":
            e.preventDefault();
            insertText("<u>", "</u>");
            break;
          case "k":
            e.preventDefault();
            insertText("[Link Text](", ")");
            break;
        }
      }

      // Close emoji picker on Escape
      if (e.key === "Escape" && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [content, showEmojiPicker]);

  // Handle click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEmojiPicker && !e.target.closest(".emoji-picker-container")) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Track changes to detect unsaved content
  useEffect(() => {
    const hasChanges =
      title !== originalTitle ||
      content !== originalContent ||
      emoji !== originalEmoji ||
      JSON.stringify(tags) !== JSON.stringify(originalTags) ||
      JSON.stringify(customStyle) !== JSON.stringify(originalCustomStyle);

    setHasUnsavedChanges(hasChanges);
  }, [
    title,
    content,
    emoji,
    tags,
    customStyle,
    originalTitle,
    originalContent,
    originalEmoji,
    originalTags,
    originalCustomStyle,
  ]);

  // Auto-save functionality
  useEffect(() => {
    if (
      autoSaveSettings.enabled &&
      user &&
      (title.trim() || content.trim()) &&
      title.trim()
    ) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save using settings from Appwrite
      const timeout = setTimeout(async () => {
        try {
          const noteData = {
            title: title.trim(),
            content: content.trim(),
            emoji,
            tags,
            customStyle,
            userId: user.$id,
          };

          let savedNote;
          if (currentNoteId) {
            // Update existing note
            savedNote = await notesService.updateNote(currentNoteId, noteData);
          } else {
            // Create new note and update current note ID
            savedNote = await notesService.createNote(noteData);
            setCurrentNoteId(savedNote.$id);
            // Update the URL to reflect the new note ID
            window.history.replaceState(
              null,
              "",
              `/notes/edit/${savedNote.$id}`
            );
          }

          // Update original values to current values after successful auto-save
          setOriginalTitle(title);
          setOriginalContent(content);
          setOriginalEmoji(emoji);
          setOriginalTags([...tags]);
          setOriginalCustomStyle({ ...customStyle });

          setHasUnsavedChanges(false);
          setLastAutoSave(new Date());

          // Show auto-save notification
          toast.success("Note saved automatically", {
            duration: 2000,
            icon: "💾",
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          });
        } catch (error) {
          // Don't show error toast for auto-save failures to avoid spam
        }
      }, autoSaveSettings.interval * 1000); // Convert seconds to milliseconds

      setAutoSaveTimeout(timeout);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [
    title,
    content,
    emoji,
    tags,
    customStyle,
    user,
    currentNoteId,
    autoSaveSettings,
  ]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, []);

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      // Store the navigation target and show modal
      if (!currentNoteId) {
        setPendingNavigation("/dashboard");
      } else {
        setPendingNavigation(`/notes/view/${currentNoteId}`);
      }
      setShowUnsavedModal(true);
      return;
    }

    // Navigate immediately if no unsaved changes
    if (!currentNoteId) {
      navigate("/dashboard");
    } else {
      navigate(`/notes/view/${currentNoteId}`);
    }
  };

  // Modal handlers
  const handleModalSave = async () => {
    await handleSave();
    // Navigate after successful save
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleModalDiscard = () => {
    // Navigate without saving
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleModalClose = () => {
    // Close modal and stay on current page
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const emojiOptions = [
    "📝",
    "💡",
    "📚",
    "💼",
    "🎯",
    "⭐",
    "🔥",
    "💭",
    "📋",
    "🚀",
    "💻",
    "🎨",
    "📊",
    "🎵",
    "📷",
    "🌟",
  ];

  const backgroundOptions = [
    { name: "Deep Blue", color: "#1e3a8a" },
    { name: "Forest Green", color: "#166534" },
    { name: "Crimson Red", color: "#dc2626" },
    { name: "Royal Purple", color: "#7c3aed" },
    { name: "Slate Gray", color: "#374151" },
    { name: "Amber Orange", color: "#d97706" },
    { name: "Teal", color: "#0f766e" },
    { name: "Rose", color: "#e11d48" },
    { name: "Indigo", color: "#4f46e5" },
    { name: "Emerald", color: "#059669" },
    { name: "Violet", color: "#8b5cf6" },
    { name: "Sky Blue", color: "#0284c7" },
  ];

  const fontSizeOptions = [
    { label: "Extra Small (12px)", value: "12px" },
    { label: "Small (14px)", value: "14px" },
    { label: "Medium (16px)", value: "16px" },
    { label: "Large (18px)", value: "18px" },
    { label: "Extra Large (20px)", value: "20px" },
    { label: "Huge (24px)", value: "24px" },
  ];

  const fontFamilyOptions = [
    { label: "Inter (Modern)", value: "Inter, sans-serif" },
    { label: "Georgia (Serif)", value: "Georgia, serif" },
    { label: "Times New Roman (Classic)", value: '"Times New Roman", serif' },
    { label: "Arial (Clean)", value: "Arial, sans-serif" },
    { label: "Helvetica (Swiss)", value: "Helvetica, sans-serif" },
    { label: "Courier New (Mono)", value: '"Courier New", monospace' },
    { label: "Roboto (Google)", value: "Roboto, sans-serif" },
    { label: "Open Sans (Friendly)", value: '"Open Sans", sans-serif' },
    { label: "Merriweather (Reading)", value: "Merriweather, serif" },
    { label: "Source Code Pro (Code)", value: '"Source Code Pro", monospace' },
  ];

  useEffect(() => {
    // Set current note ID for auto-save functionality
    setCurrentNoteId(id);

    // Check if we have AI-generated note data from navigation state
    if (location.state?.aiGeneratedNote) {
      const aiNote = location.state.aiGeneratedNote;
      setTitle(aiNote.title);
      setContent(aiNote.content);
      setEmoji(aiNote.emoji);
      setTags(aiNote.tags || []);

      // For new AI-generated notes, original values should be empty
      setOriginalTitle("");
      setOriginalContent("");
      setOriginalEmoji("📝");
      setOriginalTags([]);
      setOriginalCustomStyle({
        backgroundColor: "#1e3a8a",
        textColor: "#ffffff",
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
      });

      setHasUnsavedChanges(true);
      setLoading(false);

      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
      return;
    }

    // Load existing note if editing
    if (id) {
      loadNote();
    } else {
      // For new notes, set original values to empty
      setOriginalTitle("");
      setOriginalContent("");
      setOriginalEmoji("📝");
      setOriginalTags([]);
      setOriginalCustomStyle({
        backgroundColor: "#1e3a8a",
        textColor: "#ffffff",
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
      });
      setLoading(false);
    }
  }, [id, location.state]);

  const loadNote = async () => {
    try {
      const note = await notesService.getNote(id);
      const noteTitle = note.title;
      const noteContent = note.content;
      const noteEmoji = note.emoji;
      const noteTags = note.tags || [];
      const noteCustomStyle = note.customStyle || {
        backgroundColor: "#1e3a8a",
        textColor: "#ffffff",
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
      };

      // Set current values
      setTitle(noteTitle);
      setContent(noteContent);
      setEmoji(noteEmoji);
      setTags(noteTags);
      setCustomStyle(noteCustomStyle);

      // Set original values for change tracking
      setOriginalTitle(noteTitle);
      setOriginalContent(noteContent);
      setOriginalEmoji(noteEmoji);
      setOriginalTags([...noteTags]);
      setOriginalCustomStyle({ ...noteCustomStyle });

      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error("Failed to load note");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save notes");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }

    setSaving(true);

    // Show loading toast
    const loadingToast = toast.loading(
      !currentNoteId ? "Creating note..." : "Saving changes..."
    );

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        emoji,
        tags,
        customStyle,
        userId: user.$id,
      };

      let savedNote;
      if (currentNoteId) {
        // Update existing note
        savedNote = await notesService.updateNote(currentNoteId, noteData);
      } else {
        // Create new note
        savedNote = await notesService.createNote(noteData);
        setCurrentNoteId(savedNote.$id);
      }

      // Update original values to current values after successful save
      setOriginalTitle(title);
      setOriginalContent(content);
      setOriginalEmoji(emoji);
      setOriginalTags([...tags]);
      setOriginalCustomStyle({ ...customStyle });

      setHasUnsavedChanges(false); // Clear unsaved changes flag

      // Show success toast
      toast.dismiss(loadingToast);
      toast.success(
        !currentNoteId || !id
          ? "Note created successfully!"
          : "Note saved successfully!",
        {
          duration: 3000,
        }
      );

      // Navigate to view mode after a short delay
      setTimeout(() => {
        navigate(`/notes/view/${savedNote.$id}`);
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  // Add processing message to the popup
  const addProcessingMessage = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newMessage = {
      id: Date.now(),
      message,
      type, // 'info', 'success', 'warning', 'error'
      timestamp
    };
    setProcessingMessages(prev => [...prev, newMessage]);
  };

  // Clear processing messages
  const clearProcessingMessages = () => {
    setProcessingMessages([]);
    setProcessingStep('');
    setProcessingProgress(0);
  };

  const handlePhotoUpload = async (file) => {
    setProcessingPhoto(true);
    setShowPhotoUpload(false);
    setShowProcessingPopup(true);
    clearProcessingMessages();

    try {
      addProcessingMessage('📤 Starting photo text extraction...', 'info');
      setProcessingStep('Initializing OCR...');
      setProcessingProgress(10);

      // Get user settings to determine AI preference
      const settings = await settingsService.getUserSettings(user.$id);
      const useLocalAI = settings?.aiProvider === "local";

      addProcessingMessage(`🔧 Using ${useLocalAI ? 'Local AI' : 'Gemini AI'} for enhancement`, 'info');
      setProcessingStep('Preparing image analysis...');
      setProcessingProgress(20);

      // Extract text with AI enhancement
      const ocrResults = await ocrService.extractText(file, {
        enhanceWithAI: true,
        useLocalAI: useLocalAI,
        logger: addProcessingMessage, // Pass our logging function to OCR service
        progressCallback: setProcessingProgress // Pass progress callback
      });

      setProcessingStep('Processing results...');
      setProcessingProgress(80);

      if (!ocrResults.text || ocrResults.text.trim().length === 0) {
        addProcessingMessage('❌ No text found in image', 'error');
        toast.error(
          "No text found in the image. Please try with a clearer image."
        );
        return;
      }

      addProcessingMessage(`📝 Extracted ${ocrResults.text.length} characters`, 'info');
      setProcessingStep('Enhancing content with AI...');

      // Use AI-enhanced content if available, otherwise use raw OCR text
      let extractedContent = ocrResults.text; // Default to raw OCR text
      let extractedTitle = "";
      let extractedTags = [];

      if (
        ocrResults.enhancedNote &&
        ocrResults.enhancedNote.enhancedNote &&
        ocrResults.enhancedNote.enhancedNote.content
      ) {
        const enhanced = ocrResults.enhancedNote.enhancedNote; // Access the actual enhanced note data
        // Use AI-enhanced content (this is the formatted, refined content)
        extractedContent = enhanced.content;
        extractedTitle = enhanced.title || "";
        extractedTags = enhanced.tags || [];

        const provider = ocrResults.enhancedNote.aiProvider;
        setProcessingStep('Applying AI-enhanced content to note...');
        
        toast.success(
          `Text extracted and enhanced with ${
            provider === "local" ? "Local AI" : "Gemini AI"
          }! Using AI-refined content.`
        );
        console.log("Using AI-enhanced content:", {
          title: extractedTitle,
          contentPreview: extractedContent.substring(0, 100) + "...",
          tags: extractedTags,
          provider: provider,
        });
      } else {
        // Fallback to raw OCR text if AI enhancement failed
        addProcessingMessage('⚠️ AI enhancement not available, using raw OCR text', 'warning');
        setProcessingStep('Using raw extracted text...');
        
        console.warn("AI enhancement not available, using raw OCR text");
        console.log(
          "Using raw OCR text:",
          extractedContent.substring(0, 100) + "..."
        );
        toast.success(
          "Text extracted successfully! (No AI enhancement available)"
        );
      }

      // If content is empty, set the extracted content
      if (!content.trim()) {
        setContent(extractedContent);
      } else {
        // Append to existing content with a separator
        setContent((prevContent) => {
          const separator = prevContent.trim() ? "\n\n---\n\n" : "";
          return prevContent + separator + extractedContent;
        });
      }

      // If title is empty, use extracted title or generate from first line
      if (!title.trim()) {
        if (extractedTitle) {
          setTitle(extractedTitle);
          addProcessingMessage(`📝 Set note title: "${extractedTitle}"`, 'success');
        } else {
          const lines = ocrResults.text
            .split("\n")
            .filter((line) => line.trim());
          if (lines.length > 0) {
            const firstLine = lines[0].trim();
            const generatedTitle =
              firstLine.length > 60
                ? firstLine.substring(0, 57) + "..."
                : firstLine;
            setTitle(generatedTitle);
            addProcessingMessage(`📝 Generated title from first line: "${generatedTitle}"`, 'info');
          }
        }
      }

      // Add extracted tags to existing tags
      if (extractedTags.length > 0) {
        const newTags = extractedTags.filter((tag) => !tags.includes(tag));
        if (newTags.length > 0) {
          setTags((prevTags) => [...prevTags, ...newTags]);
          addProcessingMessage(`🏷️ Added ${newTags.length} new tags to note`, 'success');
        }
      } else if (!tags.includes("extracted-text")) {
        setTags((prevTags) => [...prevTags, "extracted-text"]);
        addProcessingMessage('🏷️ Added "extracted-text" tag', 'info');
      }

      addProcessingMessage('✅ Photo text extraction completed successfully!', 'success');
      setProcessingStep('Finalizing...');
      setProcessingProgress(100);
      
      // Close popup after a short delay
      setTimeout(() => {
        setShowProcessingPopup(false);
      }, 2000);

    } catch (error) {
      console.error("Error extracting text from image:", error);
      addProcessingMessage(`❌ Error: ${error.message}`, 'error');
      toast.error("Failed to extract text from image");
    } finally {
      setProcessingPhoto(false);
    }
  };

  const extractBasicTitle = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return "Extracted Text Note";

    const firstLine = lines[0].trim();
    return firstLine.length > 60
      ? firstLine.substring(0, 57) + "..."
      : firstLine;
  };

  const handleGenerateTags = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Please add a title or content first");
      return;
    }

    setGeneratingTags(true);

    try {
      // Get user's AI settings
      const settings = await settingsService.getUserSettings(user.$id);
      const aiProvider = settings?.aiProvider || "gemini";

      // Show loading toast
      const loadingToast = toast.loading("Generating AI tags...");

      try {
        // Initialize AI service based on provider
        if (aiProvider === "local") {
          if (settings?.localModelPath) {
            await aiService.setProvider("local", {
              modelPath: settings.localModelPath,
            });
          } else {
            toast.error("Please configure local AI model in settings");
            toast.dismiss(loadingToast);
            return;
          }
        } else {
          const userApiKey = settings?.geminiApiKey;
          if (!userApiKey) {
            toast.error("Please set your Google Gemini API key in settings");
            toast.dismiss(loadingToast);
            return;
          }
          await aiService.setProvider("gemini", { apiKey: userApiKey });
        }

        // Generate tags based on title and content
        const generatedTags = await aiService.generateTagsForNote(
          title,
          content
        );

        if (generatedTags && generatedTags.length > 0) {
          // Merge with existing tags, avoiding duplicates
          const newTags = [...new Set([...tags, ...generatedTags])];
          setTags(newTags);

          // Dismiss loading toast and show success
          toast.dismiss(loadingToast);
          toast.success(
            `Generated ${generatedTags.length} new tags: ${generatedTags.join(
              ", "
            )}`,
            {
              duration: 4000,
            }
          );
        } else {
          toast.dismiss(loadingToast);
          toast.error("No tags could be generated for this content");
        }
      } catch (error) {
        toast.dismiss(loadingToast);

        // More specific error messages
        if (error.message?.includes("API key")) {
          toast.error(
            "Invalid API key. Please check your Google Gemini API key in settings."
          );
        } else if (error.message?.includes("quota")) {
          toast.error("API quota exceeded. Please try again later.");
        } else if (error.message?.includes("network")) {
          toast.error("Network error. Please check your internet connection.");
        } else {
          toast.error(`Failed to generate tags: ${error.message}`);
        }
      }
    } catch (error) {
      toast.error("Failed to get API key from settings");
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleManualAIGeneration = async (prompt) => {
    setGeneratingNote(true);

    try {
      // Get user's AI settings
      const settings = await settingsService.getUserSettings(user.$id);
      const aiProvider = settings?.aiProvider || "gemini";

      // Initialize AI service based on provider
      if (aiProvider === "local") {
        if (settings?.localModelPath) {
          await aiService.setProvider("local", {
            modelPath: settings.localModelPath,
          });
        } else {
          toast.error("Please configure local AI model in settings");
          return;
        }
      } else {
        const userApiKey = settings?.geminiApiKey;
        if (!userApiKey) {
          toast.error("Please set your Google Gemini API key in settings");
          return;
        }
        await aiService.setProvider("gemini", { apiKey: userApiKey });
      }

      // Generate note content
      const generatedNote = await aiService.generateNote({
        topic: prompt || title || "Interesting topic",
        type: "general",
        tone: "professional",
        language: "English",
      });

      // Update the form with generated content
      setTitle(generatedNote.title);
      setContent(generatedNote.content);
      setEmoji(generatedNote.emoji);
      setTags([...new Set([...tags, ...(generatedNote.tags || [])])]);

      toast.success("Note generated successfully!");
    } catch (error) {
      if (error.message?.includes("get API key")) {
        toast.error("Failed to get API key from settings");
      } else {
        toast.error("Failed to generate note. Please check your API key.");
      }
    } finally {
      setGeneratingNote(false);
    }
  };

  const handleGenerateContentFromTitle = async () => {
    if (!title.trim()) {
      toast.error("Please add a title first");
      return;
    }

    setGeneratingNote(true);

    try {
      // Get user's AI settings
      const settings = await settingsService.getUserSettings(user.$id);
      const aiProvider = settings?.aiProvider || "gemini";

      // Initialize AI service based on provider
      if (aiProvider === "local") {
        if (settings?.localModelPath) {
          await aiService.setProvider("local", {
            modelPath: settings.localModelPath,
          });
        } else {
          toast.error("Please configure local AI model in settings");
          return;
        }
      } else {
        const userApiKey = settings?.geminiApiKey;
        if (!userApiKey) {
          toast.error("Please set your Google Gemini API key in settings");
          return;
        }
        await aiService.setProvider("gemini", { apiKey: userApiKey });
      }

      // Generate content based on title using the new method
      const generatedContent = await aiService.generateContentFromTitle(title, {
        noteType: selectedNoteType,
        tone: "professional",
        language: "English",
        length: "medium",
      });

      // Only update content, keep existing title and other fields
      setContent(generatedContent);

      toast.success("Content generated successfully!");
    } catch (error) {
      if (error.message?.includes("get API key")) {
        toast.error("Failed to get API key from settings");
      } else {
        toast.error(`Error generating content: ${error.message}`);
      }
    } finally {
      setGeneratingNote(false);
    }
  };

  const insertText = (before, after = "") => {
    const textarea = document.getElementById("note-content");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtNewLine = (text) => {
    const textarea = document.getElementById("note-content");
    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);

    // Check if we need a new line before
    const needsNewLineBefore =
      beforeCursor.length > 0 && !beforeCursor.endsWith("\n");
    const needsNewLineAfter =
      afterCursor.length > 0 && !afterCursor.startsWith("\n");

    const prefix = needsNewLineBefore ? "\n" : "";
    const suffix = needsNewLineAfter ? "\n" : "";

    const newText = beforeCursor + prefix + text + suffix + afterCursor;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + prefix.length + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertList = (type = "unordered") => {
    const textarea = document.getElementById("note-content");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      // Convert selected text to list
      const lines = selectedText.split("\n");
      const listItems = lines
        .map((line, index) => {
          if (line.trim()) {
            return type === "ordered"
              ? `${index + 1}. ${line.trim()}`
              : `- ${line.trim()}`;
          }
          return line;
        })
        .join("\n");

      const newText =
        content.substring(0, start) + listItems + content.substring(end);
      setContent(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + listItems.length);
      }, 0);
    } else {
      // Insert new list item
      const listItem = type === "ordered" ? "1. " : "- ";
      insertAtNewLine(listItem);
    }
  };

  const insertTable = (rows = 3, cols = 3) => {
    let table = "\n";

    // Create header row
    const headerCells = Array(cols)
      .fill("Header")
      .map((_, i) => `Header ${i + 1}`);
    table += `| ${headerCells.join(" | ")} |\n`;

    // Create separator row
    const separators = Array(cols).fill("---");
    table += `| ${separators.join(" | ")} |\n`;

    // Create data rows
    for (let i = 0; i < rows - 1; i++) {
      const dataCells = Array(cols)
        .fill("Data")
        .map((_, j) => `Cell ${i + 1},${j + 1}`);
      table += `| ${dataCells.join(" | ")} |\n`;
    }

    table += "\n";
    insertAtNewLine(table);
  };

  const insertCallout = (type = "info") => {
    const callouts = {
      info: "> ℹ️ **Info:** Your info message here",
      warning: "> ⚠️ **Warning:** Your warning message here",
      success: "> ✅ **Success:** Your success message here",
      error: "> ❌ **Error:** Your error message here",
      note: "> 📝 **Note:** Your note here",
      tip: "> 💡 **Tip:** Your tip here",
    };

    insertAtNewLine(callouts[type] || callouts.info);
  };

  const insertTemplate = (templateType) => {
    const templates = {
      meeting: `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 

## Next Steps
- `,

      todo: `# Todo List - ${new Date().toLocaleDateString()}

## High Priority
- [ ] 
- [ ] 

## Medium Priority
- [ ] 
- [ ] 

## Low Priority
- [ ] 
- [ ] 

## Completed
- [x] `,

      project: `# Project Plan

## Overview
Brief description of the project

## Objectives
- 
- 
- 

## Timeline
| Phase | Start Date | End Date | Status |
| --- | --- | --- | --- |
| Planning | | | 🟡 In Progress |
| Development | | | ⚪ Not Started |
| Testing | | | ⚪ Not Started |
| Launch | | | ⚪ Not Started |

## Resources
- 
- 

## Risks & Mitigation
- **Risk:** 
  - **Mitigation:** `,

      journal: `# Daily Journal - ${new Date().toLocaleDateString()}

## How I'm Feeling
😊 

## Today's Highlights
- 
- 
- 

## Challenges Faced
- 
- 

## Lessons Learned
- 
- 

## Tomorrow's Goals
- [ ] 
- [ ] 
- [ ] 

## Gratitude
- 
- 
- `,

      research: `# Research Notes

## Topic
Brief description of what you're researching

## Key Questions
1. 
2. 
3. 

## Sources
- [Source 1](url)
- [Source 2](url)
- [Source 3](url)

## Findings
### Main Points
- 
- 
- 

### Supporting Evidence
- 
- 

## Conclusions
- 
- 

## Next Steps
- [ ] 
- [ ] `,
    };

    setContent(templates[templateType] || "");
  };

  const insertEmoji = (emoji) => {
    insertText(emoji, "");
  };

  const quickEmojis = [
    "😊",
    "❤️",
    "👍",
    "🎉",
    "💡",
    "⭐",
    "🔥",
    "💯",
    "✅",
    "❌",
    "⚠️",
    "📝",
    "💼",
    "🎯",
    "🚀",
    "💻",
    "📱",
    "🌟",
    "🎨",
    "📊",
  ];
  const statusEmojis = ["🟢", "🟡", "🔴", "⚪", "🟤", "🟣", "⚫"];

  // Comprehensive emoji database with categories
  const emojiDatabase = {
    "Smileys & People": [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "☺️",
      "😚",
      "😙",
      "🥲",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
      "☠️",
      "💩",
      "🤡",
      "👹",
      "👺",
      "👻",
      "👽",
      "👾",
      "🤖",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
    ],
    "Animals & Nature": [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐻‍❄️",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐽",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🐣",
      "🐥",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🐝",
      "🐛",
      "🦋",
      "🐌",
      "🐞",
      "🐜",
      "🦟",
      "🦗",
      "🕷️",
      "🕸️",
      "🦂",
      "🐢",
      "🐍",
      "🦎",
      "🦖",
      "🦕",
      "🐙",
      "🦑",
      "🦐",
      "🦞",
      "🦀",
      "🐡",
      "🐠",
      "🐟",
      "🐬",
      "🐳",
      "🐋",
      "🦈",
      "🐊",
      "🐅",
      "🐆",
      "🦓",
      "🦍",
      "🦧",
      "🐘",
      "🦛",
      "🦏",
      "🐪",
      "🐫",
      "🦒",
      "🦘",
      "🐃",
      "🐂",
      "🐄",
      "🐎",
      "🐖",
      "🐏",
      "🐑",
      "🦙",
      "🐐",
      "🦌",
      "🐕",
      "🐩",
      "🦮",
      "🐕‍🦺",
      "🐈",
      "🐈‍⬛",
      "🐓",
      "🦃",
      "🦚",
      "🦜",
      "🦢",
      "🦩",
      "🕊️",
      "🐇",
      "🦝",
      "🦨",
      "🦡",
      "🦦",
      "🦥",
      "🐁",
      "🐀",
      "🐿️",
      "🦔",
    ],
    "Food & Drink": [
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🫐",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶️",
      "🫑",
      "🌽",
      "🥕",
      "🫒",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
      "🥖",
      "🍞",
      "🥨",
      "🥯",
      "🧇",
      "🥞",
      "🧈",
      "🍯",
      "🥛",
      "🍼",
      "☕",
      "🍵",
      "🧃",
      "🥤",
      "🍶",
      "🍺",
      "🍻",
      "🥂",
      "🍷",
      "🥃",
      "🍸",
      "🍹",
      "🧉",
      "🍾",
      "🧊",
      "🥄",
      "🍴",
      "🍽️",
      "🥣",
      "🥡",
      "🥢",
      "🧂",
    ],
    "Activities & Sports": [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🪃",
      "🥅",
      "⛳",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛷",
      "⛸️",
      "🥌",
      "🎿",
      "⛷️",
      "🏂",
      "🪂",
      "🏋️‍♀️",
      "🏋️",
      "🏋️‍♂️",
      "🤼‍♀️",
      "🤼",
      "🤼‍♂️",
      "🤸‍♀️",
      "🤸",
      "🤸‍♂️",
      "⛹️‍♀️",
      "⛹️",
      "⛹️‍♂️",
      "🤺",
      "🤾‍♀️",
      "🤾",
      "🤾‍♂️",
      "🏌️‍♀️",
      "🏌️",
      "🏌️‍♂️",
      "🏇",
      "🧘‍♀️",
      "🧘",
      "🧘‍♂️",
      "🏄‍♀️",
      "🏄",
      "🏄‍♂️",
      "🏊‍♀️",
      "🏊",
      "🏊‍♂️",
      "🤽‍♀️",
      "🤽",
      "🤽‍♂️",
      "🚣‍♀️",
      "🚣",
      "🚣‍♂️",
      "🧗‍♀️",
      "🧗",
      "🧗‍♂️",
      "🚵‍♀️",
      "🚵",
      "🚵‍♂️",
      "🚴‍♀️",
      "🚴",
      "🚴‍♂️",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖️",
      "🏵️",
      "🎗️",
      "🎫",
      "🎟️",
      "🎪",
      "🤹",
      "🤹‍♀️",
      "🤹‍♂️",
      "🎭",
      "🩰",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎵",
      "🎶",
      "🥁",
      "🪘",
      "🎹",
      "🎷",
      "🎺",
      "🪗",
      "🎸",
      "🪕",
      "🎻",
      "🎲",
      "♟️",
      "🎯",
      "🎳",
      "🎮",
      "🎰",
      "🧩",
    ],
    "Travel & Places": [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🚎",
      "🏎️",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🛻",
      "🚚",
      "🚛",
      "🚜",
      "🏍️",
      "🛵",
      "🚲",
      "🛴",
      "🛹",
      "🛼",
      "🚁",
      "✈️",
      "🛩️",
      "🛫",
      "🛬",
      "🪂",
      "💺",
      "🚀",
      "🛸",
      "🚁",
      "🛶",
      "⛵",
      "🚤",
      "🛥️",
      "🛳️",
      "⛴️",
      "🚢",
      "⚓",
      "⛽",
      "🚧",
      "🚨",
      "🚥",
      "🚦",
      "🛑",
      "🚏",
      "🗺️",
      "🗿",
      "🗽",
      "🗼",
      "🏰",
      "🏯",
      "🏟️",
      "🎡",
      "🎢",
      "🎠",
      "⛲",
      "⛱️",
      "🏖️",
      "🏝️",
      "🏜️",
      "🌋",
      "⛰️",
      "🏔️",
      "🗻",
      "🏕️",
      "⛺",
      "🛖",
      "🏠",
      "🏡",
      "🏘️",
      "🏚️",
      "🏗️",
      "🏭",
      "🏢",
      "🏬",
      "🏣",
      "🏤",
      "🏥",
      "🏦",
      "🏨",
      "🏪",
      "🏫",
      "🏩",
      "💒",
      "🏛️",
      "⛪",
      "🕌",
      "🛕",
      "🕍",
      "⛩️",
      "🕋",
      "⛲",
      "⛱️",
      "🌁",
      "🌃",
      "🏙️",
      "🌄",
      "🌅",
      "🌆",
      "🌇",
      "🌉",
      "♨️",
      "🎠",
      "🎡",
      "🎢",
      "💈",
      "🎪",
    ],
    "Objects & Symbols": [
      "⌚",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥️",
      "🖨️",
      "🖱️",
      "🖲️",
      "🕹️",
      "🗜️",
      "💽",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📸",
      "📹",
      "🎥",
      "📽️",
      "🎞️",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙️",
      "🎚️",
      "🎛️",
      "🧭",
      "⏱️",
      "⏲️",
      "⏰",
      "🕰️",
      "⌛",
      "⏳",
      "📡",
      "🔋",
      "🔌",
      "💡",
      "🔦",
      "🕯️",
      "🪔",
      "🧯",
      "🛢️",
      "💸",
      "💵",
      "💴",
      "💶",
      "💷",
      "🪙",
      "💰",
      "💳",
      "💎",
      "⚖️",
      "🪜",
      "🧰",
      "🔧",
      "🔨",
      "⚒️",
      "🛠️",
      "⛏️",
      "🪓",
      "🪚",
      "🔩",
      "⚙️",
      "🪤",
      "🧱",
      "⛓️",
      "🧲",
      "🔫",
      "💣",
      "🧨",
      "🪓",
      "🔪",
      "🗡️",
      "⚔️",
      "🛡️",
      "🚬",
      "⚰️",
      "🪦",
      "⚱️",
      "🏺",
      "🔮",
      "📿",
      "🧿",
      "💈",
      "⚗️",
      "🔭",
      "🔬",
      "🕳️",
      "🩹",
      "🩺",
      "💊",
      "💉",
      "🩸",
      "🧬",
      "🦠",
      "🧫",
      "🧪",
      "🌡️",
      "🧹",
      "🧺",
      "🧻",
      "🚽",
      "🚰",
      "🚿",
      "🛁",
      "🛀",
      "🧼",
      "🪥",
      "🪒",
      "🧽",
      "🧴",
      "🛎️",
      "🔑",
      "🗝️",
      "🚪",
      "🪑",
      "🛋️",
      "🛏️",
      "🛌",
      "🧸",
      "🖼️",
      "🛍️",
      "🛒",
      "🎁",
      "🎈",
      "🎏",
      "🎀",
      "🎊",
      "🎉",
      "🎎",
      "🏮",
      "🎐",
      "🧧",
      "✉️",
      "📩",
      "📨",
      "📧",
      "💌",
      "📥",
      "📤",
      "📦",
      "🏷️",
      "📪",
      "📫",
      "📬",
      "📭",
      "📮",
      "📯",
      "📜",
      "📃",
      "📄",
      "📑",
      "📊",
      "📈",
      "📉",
      "🗒️",
      "🗓️",
      "📅",
      "📆",
      "📇",
      "📋",
      "📌",
      "📍",
      "📎",
      "🖇️",
      "📏",
      "📐",
      "✂️",
      "🗃️",
      "🗄️",
      "🗑️",
      "🔒",
      "🔓",
      "🔏",
      "🔐",
      "🔑",
      "🗝️",
      "🔨",
      "🪓",
      "⛏️",
      "⚒️",
      "🛠️",
      "🗡️",
      "⚔️",
      "🔫",
      "🪃",
      "🏹",
      "🛡️",
      "🪚",
      "🔧",
      "🪛",
      "🔩",
      "⚙️",
      "🗜️",
      "⚖️",
      "🦯",
      "🔗",
      "⛓️",
      "🪝",
      "🧰",
      "🧲",
      "🪜",
      "🧪",
      "🧫",
      "🧬",
      "🔬",
      "🔭",
      "📡",
    ],
    Flags: [
      "🏁",
      "🚩",
      "🎌",
      "🏴",
      "🏳️",
      "🏳️‍🌈",
      "🏳️‍⚧️",
      "🏴‍☠️",
      "🇦🇫",
      "🇦🇽",
      "🇦🇱",
      "🇩🇿",
      "🇦🇸",
      "🇦🇩",
      "🇦🇴",
      "🇦🇮",
      "🇦🇶",
      "🇦🇬",
      "🇦🇷",
      "🇦🇲",
      "🇦🇼",
      "🇦🇺",
      "🇦🇹",
      "🇦🇿",
      "🇧🇸",
      "🇧🇭",
      "🇧🇩",
      "🇧🇧",
      "🇧🇾",
      "🇧🇪",
      "🇧🇿",
      "🇧🇯",
      "🇧🇲",
      "🇧🇹",
      "🇧🇴",
      "🇧🇦",
      "🇧🇼",
      "🇧🇷",
      "🇮🇴",
      "🇻🇬",
      "🇧🇳",
      "🇧🇬",
      "🇧🇫",
      "🇧🇮",
      "🇰🇭",
      "🇨🇲",
      "🇨🇦",
      "🇮🇨",
      "🇨🇻",
      "🇧🇶",
      "🇰🇾",
      "🇨🇫",
      "🇹🇩",
      "🇨🇱",
      "🇨🇳",
      "🇨🇽",
      "🇨🇨",
      "🇨🇴",
      "🇰🇲",
      "🇨🇬",
      "🇨🇩",
      "🇨🇰",
      "🇨🇷",
      "🇨🇮",
      "🇭🇷",
      "🇨🇺",
      "🇨🇼",
      "🇨🇾",
      "🇨🇿",
      "🇩🇰",
      "🇩🇯",
      "🇩🇲",
      "🇩🇴",
      "🇪🇨",
      "🇪🇬",
      "🇸🇻",
      "🇬🇶",
      "🇪🇷",
      "🇪🇪",
      "🇪🇹",
      "🇪🇺",
      "🇫🇰",
      "🇫🇴",
      "🇫🇯",
      "🇫🇮",
      "🇫🇷",
      "🇬🇫",
      "🇵🇫",
      "🇹🇫",
      "🇬🇦",
      "🇬🇲",
      "🇬🇪",
      "🇩🇪",
      "🇬🇭",
      "🇬🇮",
      "🇬🇷",
      "🇬🇱",
      "🇬🇩",
      "🇬🇵",
      "🇬🇺",
      "🇬🇹",
      "🇬🇬",
      "🇬🇳",
      "🇬🇼",
      "🇬🇾",
      "🇭🇹",
      "🇭🇳",
      "🇭🇰",
      "🇭🇺",
      "🇮🇸",
      "🇮🇳",
      "🇮🇩",
      "🇮🇷",
      "🇮🇶",
      "🇮🇪",
      "🇮🇲",
      "🇮🇱",
      "🇮🇹",
      "🇯🇲",
      "🇯🇵",
      "🎌",
      "🇯🇪",
      "🇯🇴",
      "🇰🇿",
      "🇰🇪",
      "🇰🇮",
      "🇽🇰",
      "🇰🇼",
      "🇰🇬",
      "🇱🇦",
      "🇱🇻",
      "🇱🇧",
      "🇱🇸",
      "🇱🇷",
      "🇱🇾",
      "🇱🇮",
      "🇱🇹",
      "🇱🇺",
      "🇲🇴",
      "🇲🇰",
      "🇲🇬",
      "🇲🇼",
      "🇲🇾",
      "🇲🇻",
      "🇲🇱",
      "🇲🇹",
      "🇲🇭",
      "🇲🇶",
      "🇲🇷",
      "🇲🇺",
      "🇾🇹",
      "🇲🇽",
      "🇫🇲",
      "🇲🇩",
      "🇲🇨",
      "🇲🇳",
      "🇲🇪",
      "🇲🇸",
      "🇲🇦",
      "🇲🇿",
      "🇲🇲",
      "🇳🇦",
      "🇳🇷",
      "🇳🇵",
      "🇳🇱",
      "🇳🇨",
      "🇳🇿",
      "🇳🇮",
      "🇳🇪",
      "🇳🇬",
      "🇳🇺",
      "🇳🇫",
      "🇰🇵",
      "🇲🇵",
      "🇳🇴",
      "🇴🇲",
      "🇵🇰",
      "🇵🇼",
      "🇵🇸",
      "🇵🇦",
      "🇵🇬",
      "🇵🇾",
      "🇵🇪",
      "🇵🇭",
      "🇵🇳",
      "🇵🇱",
      "🇵🇹",
      "🇵🇷",
      "🇶🇦",
      "🇷🇪",
      "🇷🇴",
      "🇷🇺",
      "🇷🇼",
      "🇼🇸",
      "🇸🇲",
      "🇸🇹",
      "🇸🇦",
      "🇸🇳",
      "🇷🇸",
      "🇸🇨",
      "🇸🇱",
      "🇸🇬",
      "🇸🇽",
      "🇸🇰",
      "🇸🇮",
      "🇬🇸",
      "🇸🇧",
      "🇸🇴",
      "🇿🇦",
      "🇰🇷",
      "🇸🇸",
      "🇪🇸",
      "🇱🇰",
      "🇧🇱",
      "🇸🇭",
      "🇰🇳",
      "🇱🇨",
      "🇲🇫",
      "🇵🇲",
      "🇻🇨",
      "🇸🇩",
      "🇸🇷",
      "🇸🇯",
      "🇸🇿",
      "🇸🇪",
      "🇨🇭",
      "🇸🇾",
      "🇹🇼",
      "🇹🇯",
      "🇹🇿",
      "🇹🇭",
      "🇹🇱",
      "🇹🇬",
      "🇹🇰",
      "🇹🇴",
      "🇹🇹",
      "🇹🇳",
      "🇹🇷",
      "🇹🇲",
      "🇹🇨",
      "🇹🇻",
      "🇻🇮",
      "🇺🇬",
      "🇺🇦",
      "🇦🇪",
      "🇬🇧",
      "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
      "🇺🇸",
      "🇺🇾",
      "🇺🇿",
      "🇻🇺",
      "🇻🇦",
      "🇻🇪",
      "🇻🇳",
      "🇼🇫",
      "🇪🇭",
      "🇾🇪",
      "🇿🇲",
      "🇿🇼",
    ],
    "Hearts & Symbols": [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "♥️",
      "💌",
      "💋",
      "💍",
      "💎",
      "👑",
      "🎩",
      "🎓",
      "📿",
      "💄",
      "👠",
      "👡",
      "👢",
      "👞",
      "👟",
      "🥾",
      "🩴",
      "👒",
      "🧢",
      "⛑️",
      "📯",
      "🎺",
      "🥁",
      "🎷",
      "🎸",
      "🎻",
      "🎹",
      "🥂",
      "🍾",
      "🍺",
      "🍻",
      "🥃",
      "🍸",
      "🍹",
      "🍷",
      "🍶",
      "☕",
      "🍵",
      "🧃",
      "🥤",
      "🧋",
      "🧉",
      "🧊",
      "⭐",
      "🌟",
      "✨",
      "⚡",
      "☄️",
      "💫",
      "🔥",
      "💥",
      "💢",
      "💯",
      "💫",
      "💤",
      "💨",
      "🕳️",
      "💣",
      "💥",
      "💫",
      "💦",
      "💧",
      "🌊",
      "💔",
      "❤️‍🔥",
      "❤️‍🩹",
      "💘",
      "💝",
      "💖",
      "💗",
      "💓",
      "💞",
      "💕",
      "💟",
      "❣️",
      "💔",
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🤎",
      "🖤",
      "🤍",
      "♠️",
      "♥️",
      "♦️",
      "♣️",
      "♟️",
      "🃏",
      "🀄",
      "🎴",
      "🎭",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎵",
      "🎶",
      "🎹",
      "🥁",
      "🎷",
      "🎺",
      "🎸",
      "🎻",
      "🎲",
      "♟️",
      "🎯",
      "🎳",
      "🎮",
      "🎰",
      "🧩",
    ],
  };

  // Filter emojis based on search term
  const getFilteredEmojis = () => {
    if (!emojiSearchTerm) {
      return emojiDatabase;
    }

    const filtered = {};
    Object.entries(emojiDatabase).forEach(([category, emojis]) => {
      const matchingEmojis = emojis.filter((emoji) => {
        // Simple emoji search - you can enhance this with emoji names/descriptions
        return category.toLowerCase().includes(emojiSearchTerm.toLowerCase());
      });
      if (matchingEmojis.length > 0) {
        filtered[category] = matchingEmojis;
      }
    });

    return filtered;
  };

  const insertCurrentDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    insertText(date, "");
  };

  const insertCurrentTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    insertText(time, "");
  };

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  return (
    <ProfessionalBackground>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pt-16">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumb noteTitle={!id ? null : title} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleBackNavigation}
                className={`px-4 py-2 text-gray-400 hover:text-white rounded-lg border transition-all duration-200 text-sm sm:text-base ${
                  hasUnsavedChanges
                    ? "border-orange-500/50 hover:border-orange-400"
                    : "border-blue-500/50 hover:border-blue-400"
                }`}
              >
                {!id ? "Back to Dashboard" : "Back to Note"}
              </button>

              {hasUnsavedChanges && (
                <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">
                  Unsaved changes
                </span>
              )}

              {/* Auto-save status */}
              {localStorage.getItem("scribly_auto_save") === "true" && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Auto-save ON</span>
                </span>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {!id ? "Create Note" : "Edit Note"}
              </h1>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                onClick={() => setShowPhotoUpload(true)}
                variant="outline"
                disabled={saving || processingPhoto}
                className="border-purple-500 flex items-center text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
              >
                {processingPhoto ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Extract Text
                  </>
                )}
              </Button>
              <Button
                onClick={handleSave}
                loading={saving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
          {/* Main Editor */}
          <div className="flex-1 order-1 xl:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden"
            >
              {/* Title and Emoji */}
              <div className="p-4 sm:p-6 border-b border-gray-700/50">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="text-2xl sm:text-3xl bg-transparent border-none outline-none cursor-pointer"
                  >
                    {emojiOptions.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    className="flex-1 text-xl sm:text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-4 ">
                  <TagManager
                    tags={tags}
                    onTagsChange={setTags}
                    noteTitle={title}
                    noteContent={content}
                    onGenerateAITags={handleGenerateTags}
                    isGeneratingTags={generatingTags}
                  />
                </div>
              </div>

              {/* Toolbar */}
              <div className="p-4 sm:p-6 border-b border-gray-700/50 space-y-4">
                {/* Main Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {/* Text Formatting Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertText("**", "**")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => insertText("*", "*")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => insertText("<u>", "</u>")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => insertText("~~", "~~")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Strikethrough"
                      >
                        <Strikethrough className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    {/* Headings Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertAtNewLine("# ")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Heading 1"
                      >
                        <Heading1 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("## ")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Heading 2"
                      >
                        <Heading2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("### ")}
                        className="p-2 sm:p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Heading 3"
                      >
                        <Heading3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    {/* Lists & Structure Group - Hidden on small screens */}
                    <div className="hidden sm:flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertList("unordered")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Bullet List"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertList("ordered")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("- [ ] ")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Checklist"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertTable(3, 3)}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Insert Table (3x3)"
                      >
                        <Table className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Content Elements Group - Hidden on small screens */}
                    <div className="hidden md:flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertAtNewLine("> ")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Quote"
                      >
                        <Quote className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertText("`", "`")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Inline Code"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertText("[Link Text](", ")")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Link (Ctrl+K)"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("---")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Horizontal Rule"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-600/30 font-mono self-start lg:self-auto">
                    {content.length} chars
                  </span>
                </div>

                {/* Secondary Toolbar - Templates, Emojis & Quick Inserts */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
                    {/* Templates Dropdown */}
                    <div className="relative group">
                      <button className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Templates</span>
                        <span className="sm:hidden">Temp</span>
                      </button>
                      <div className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl py-2 min-w-[200px] sm:min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <button
                          onClick={() => insertTemplate("meeting")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">📝</span>
                          Meeting Notes
                        </button>
                        <button
                          onClick={() => insertTemplate("todo")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">✅</span>
                          Todo List
                        </button>
                        <button
                          onClick={() => insertTemplate("project")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">🎯</span>
                          Project Plan
                        </button>
                        <button
                          onClick={() => insertTemplate("journal")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">📔</span>
                          Daily Journal
                        </button>
                        <button
                          onClick={() => insertTemplate("research")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">🔬</span>
                          Research Notes
                        </button>
                      </div>
                    </div>

                    {/* Callouts Dropdown */}
                    <div className="relative group">
                      <button className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Callouts</span>
                        <span className="sm:hidden">Call</span>
                      </button>
                      <div className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl py-2 min-w-[180px] sm:min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <button
                          onClick={() => insertCallout("info")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">ℹ️</span>
                          Info
                        </button>
                        <button
                          onClick={() => insertCallout("warning")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">⚠️</span>
                          Warning
                        </button>
                        <button
                          onClick={() => insertCallout("success")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">✅</span>
                          Success
                        </button>
                        <button
                          onClick={() => insertCallout("error")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">❌</span>
                          Error
                        </button>
                        <button
                          onClick={() => insertCallout("note")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">📝</span>
                          Note
                        </button>
                        <button
                          onClick={() => insertCallout("tip")}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center"
                        >
                          <span className="mr-3">💡</span>
                          Tip
                        </button>
                      </div>
                    </div>

                    {/* Emoji Picker */}
                    <div className="relative emoji-picker-container">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max"
                      >
                        <Smile className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Emojis</span>
                        <span className="sm:hidden">😀</span>
                      </button>

                      {showEmojiPicker && (
                        <div
                          className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/20"
                          onClick={() => setShowEmojiPicker(false)}
                        >
                          <div
                            className="bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl w-80 sm:w-96 max-h-80 sm:max-h-96 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Emoji Search */}
                            <div className="p-3 sm:p-4 border-b border-gray-700/50">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search emojis..."
                                  value={emojiSearchTerm}
                                  onChange={(e) =>
                                    setEmojiSearchTerm(e.target.value)
                                  }
                                  className="w-full pl-8 sm:pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                />
                              </div>
                            </div>

                            {/* Quick Emojis */}
                            <div className="p-3 sm:p-4 border-b border-gray-700/50">
                              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                Quick Access
                              </h4>
                              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                                {quickEmojis.map((emoji, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      insertEmoji(emoji);
                                      setShowEmojiPicker(false);
                                    }}
                                    className="p-1.5 sm:p-2 hover:bg-gray-700/50 rounded-md transition-all duration-200 text-base sm:text-lg hover:scale-110"
                                    title={`Insert ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Emoji Categories */}
                            <div className="max-h-48 sm:max-h-64 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                              {Object.entries(getFilteredEmojis()).map(
                                ([category, emojis]) => (
                                  <div key={category}>
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                      {category}
                                    </h4>
                                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                                      {emojis
                                        .slice(0, 40)
                                        .map((emoji, index) => (
                                          <button
                                            key={index}
                                            onClick={() => {
                                              insertEmoji(emoji);
                                              setShowEmojiPicker(false);
                                            }}
                                            className="p-1.5 sm:p-2 hover:bg-gray-700/50 rounded-md transition-all duration-200 text-base sm:text-lg hover:scale-110"
                                            title={`Insert ${emoji}`}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                    </div>
                                    {emojis.length > 40 && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        +{emojis.length - 40} more emojis in
                                        this category
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>

                            {/* Close button */}
                            <div className="p-2 sm:p-3 border-t border-gray-700/50 bg-gray-800/60">
                              <button
                                onClick={() => setShowEmojiPicker(false)}
                                className="w-full px-3 py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                              >
                                Close Emoji Picker
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date/Time Group - Hidden on small screens */}
                    <div className="hidden md:flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={insertCurrentDate}
                        className="px-3 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200 flex items-center min-w-max"
                        title="Insert Current Date"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Date
                      </button>
                      <button
                        onClick={insertCurrentTime}
                        className="px-3 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200 flex items-center min-w-max"
                        title="Insert Current Time"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Time
                      </button>
                    </div>
                  </div>
                </div>
                {/* Note Type Selector for AI */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                  <select
                    value={selectedNoteType}
                    onChange={(e) => setSelectedNoteType(e.target.value)}
                    className="text-xs bg-gray-800/60 border border-gray-600/50 text-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto"
                  >
                    <option value="general">General</option>
                    <option value="meeting">Meeting</option>
                    <option value="project">Project</option>
                    <option value="research">Research</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="idea">Idea</option>
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="creative">Creative</option>
                  </select>

                  {/* AI Generate Content Button */}
                  <Button
                    onClick={handleGenerateContentFromTitle}
                    size="sm"
                    disabled={generatingNote || !title.trim()}
                    className="bg-gradient-to-r items-center flex from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5 w-full sm:w-auto justify-center"
                  >
                    {generatingNote ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-1" />
                        AI Content
                      </>
                    )}
                  </Button>
                </div>

                {/* Quick Shortcuts Info */}
                <div className="pt-3 border-t border-gray-700/30">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between text-xs text-gray-400 gap-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span className="font-medium text-gray-300">
                        Shortcuts:
                      </span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono text-xs">
                        Ctrl+B
                      </span>
                      <span className="text-gray-500">=</span>
                      <span className="hidden sm:inline">Bold</span>
                      <span className="sm:hidden">B</span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono text-xs">
                        Ctrl+I
                      </span>
                      <span className="text-gray-500">=</span>
                      <span className="hidden sm:inline">Italic</span>
                      <span className="sm:hidden">I</span>
                      <span className="hidden md:inline px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono text-xs">
                        Ctrl+U
                      </span>
                      <span className="hidden md:inline text-gray-500">=</span>
                      <span className="hidden md:inline">Underline</span>
                      <span className="hidden lg:inline px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono text-xs">
                        ---
                      </span>
                      <span className="hidden lg:inline text-gray-500">=</span>
                      <span className="hidden lg:inline">Horizontal Line</span>
                      <span className="hidden lg:inline px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono text-xs">
                        Tab
                      </span>
                      <span className="hidden lg:inline text-gray-500">=</span>
                      <span className="hidden lg:inline">Indent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px]">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-400 mb-2 gap-2">
                    <span>Content</span>
                    <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                      <span>Lines: {content.split("\n").length}</span>
                      <span>
                        Words:{" "}
                        {content.trim()
                          ? content.trim().split(/\s+/).length
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => {
                    const value = e.target.value;
                    setContent(value);

                    // Auto-format horizontal rules
                    if (
                      value.endsWith("---\n") ||
                      (value.endsWith("---") &&
                        e.nativeEvent.inputType === "insertText")
                    ) {
                      const newValue = value.replace(/---$/, "---\n");
                      setContent(newValue);
                      setTimeout(() => {
                        e.target.focus();
                        e.target.setSelectionRange(
                          newValue.length,
                          newValue.length
                        );
                      }, 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Enhanced enter key behavior for lists
                    if (e.key === "Enter") {
                      const textarea = e.target;
                      const start = textarea.selectionStart;
                      const beforeCursor = content.substring(0, start);
                      const currentLine = beforeCursor.split("\n").pop();

                      // Auto-continue lists
                      if (currentLine.match(/^\s*[-*+]\s/)) {
                        e.preventDefault();
                        const indent = currentLine.match(/^\s*/)[0];
                        const newListItem = `\n${indent}- `;
                        insertText(newListItem, "");
                      } else if (currentLine.match(/^\s*\d+\.\s/)) {
                        e.preventDefault();
                        const indent = currentLine.match(/^\s*/)[0];
                        const currentNumber = parseInt(
                          currentLine.match(/(\d+)/)[1]
                        );
                        const newListItem = `\n${indent}${currentNumber + 1}. `;
                        insertText(newListItem, "");
                      }
                    }

                    // Tab key for indentation
                    if (e.key === "Tab") {
                      e.preventDefault();
                      insertText("  ", "");
                    }
                  }}
                  placeholder="Start writing your note... 

✨ Use the toolbar buttons above for easy formatting
📝 Or try keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline)
📋 Type --- and press Enter for a horizontal line
📝 Press Enter in a list to continue the list automatically"
                  className="w-full h-80 sm:h-96 bg-transparent border-none outline-none placeholder-gray-400 resize-none leading-relaxed text-sm sm:text-base"
                  style={{
                    fontFamily: customStyle.fontFamily,
                    fontSize: customStyle.fontSize,
                    color: customStyle.textColor,
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Customization Sidebar */}
          <div className="w-full xl:w-96 order-2 xl:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl h-full flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-gray-700/50">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
                  Customization
                </h3>
              </div>

              <div
                className="flex-1 overflow-y-auto space-y-4 sm:space-y-6"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#374151 #1f2937",
                }}
              >
                <div className="px-4 sm:px-6">
                  {/* Background Color Picker */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 sm:mb-4 mt-2">
                      Background Color
                    </label>

                    <div className="mb-3 sm:mb-4">
                      <input
                        type="color"
                        value={customStyle.backgroundColor}
                        onChange={(e) =>
                          setCustomStyle((prev) => ({
                            ...prev,
                            backgroundColor: e.target.value,
                          }))
                        }
                        className="w-full h-10 sm:h-12 rounded-xl border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Current: {customStyle.backgroundColor}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                      {backgroundOptions.map((bg) => (
                        <button
                          key={bg.color}
                          onClick={() =>
                            setCustomStyle((prev) => ({
                              ...prev,
                              backgroundColor: bg.color,
                            }))
                          }
                          className={`group relative w-full h-10 sm:h-12 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            customStyle.backgroundColor === bg.color
                              ? "border-white shadow-lg"
                              : "border-gray-600 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: bg.color }}
                          title={bg.name}
                        >
                          {customStyle.backgroundColor === bg.color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      Font Family
                    </label>
                    <select
                      value={customStyle.fontFamily}
                      onChange={(e) =>
                        setCustomStyle((prev) => ({
                          ...prev,
                          fontFamily: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                    >
                      {fontFamilyOptions.map((font) => (
                        <option
                          key={font.value}
                          value={font.value}
                          className="bg-gray-800"
                        >
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                      Font Size
                    </label>
                    <select
                      value={customStyle.fontSize}
                      onChange={(e) =>
                        setCustomStyle((prev) => ({
                          ...prev,
                          fontSize: e.target.value,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
                    >
                      {fontSizeOptions.map((size) => (
                        <option
                          key={size.value}
                          value={size.value}
                          className="bg-gray-800"
                        >
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text Color */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 sm:mb-4">
                      Text Color
                    </label>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() =>
                          setCustomStyle((prev) => ({
                            ...prev,
                            textColor: "#ffffff",
                          }))
                        }
                        className={`flex-1 h-8 sm:h-10 rounded-lg border-2 bg-white transition-all duration-300 ${
                          customStyle.textColor === "#ffffff"
                            ? "border-blue-400"
                            : "border-gray-600 hover:border-gray-400"
                        }`}
                      />
                      <button
                        onClick={() =>
                          setCustomStyle((prev) => ({
                            ...prev,
                            textColor: "#000000",
                          }))
                        }
                        className={`flex-1 h-8 sm:h-10 rounded-lg border-2 bg-black transition-all duration-300 ${
                          customStyle.textColor === "#000000"
                            ? "border-blue-400"
                            : "border-gray-600 hover:border-gray-400"
                        }`}
                      />
                      <input
                        type="color"
                        value={customStyle.textColor}
                        onChange={(e) =>
                          setCustomStyle((prev) => ({
                            ...prev,
                            textColor: e.target.value,
                          }))
                        }
                        className="flex-1 h-8 sm:h-10 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-400" />
                      Live Preview
                    </label>
                    <div className="relative">
                      <div
                        className="p-4 sm:p-6 rounded-xl border-2 border-gray-600/50 min-h-[160px] sm:min-h-[180px] max-h-[350px] sm:max-h-[400px] overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-lg hover:border-blue-500/30 hover:shadow-xl"
                        style={{
                          backgroundColor: customStyle.backgroundColor,
                          backgroundImage:
                            "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)",
                        }}
                      >
                        {/* Title Preview */}
                        {title && (
                          <div className="mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-base sm:text-lg">
                                {emoji}
                              </span>
                              <h4
                                className="font-bold flex-1 break-words overflow-hidden"
                                style={{
                                  fontSize: `calc(${customStyle.fontSize} + 2px)`,
                                  fontFamily: customStyle.fontFamily,
                                  color: customStyle.textColor,
                                  lineHeight: "1.3",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {title}
                              </h4>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full border backdrop-blur-sm"
                                    style={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.1)",
                                      borderColor: "rgba(255, 255, 255, 0.2)",
                                      color: customStyle.textColor,
                                      opacity: 0.8,
                                    }}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {tags.length > 3 && (
                                  <span
                                    className="px-2 py-1 text-xs rounded-full border backdrop-blur-sm"
                                    style={{
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.05)",
                                      borderColor: "rgba(255, 255, 255, 0.1)",
                                      color: customStyle.textColor,
                                      opacity: 0.6,
                                    }}
                                  >
                                    +{tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content Preview */}
                        <div
                          className="leading-relaxed break-words overflow-hidden"
                          style={{
                            fontSize: customStyle.fontSize,
                            fontFamily: customStyle.fontFamily,
                            color: customStyle.textColor,
                            opacity: 0.9,
                            lineHeight: "1.6",
                          }}
                        >
                          {content ? (
                            <div
                              className="prose-preview overflow-hidden"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 6,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                hyphens: "auto",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdown(
                                  content.length > 250
                                    ? content.substring(0, 250) + "..."
                                    : content
                                ),
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-16 sm:h-24 text-center">
                              <span
                                className="text-xs sm:text-sm italic"
                                style={{
                                  color: customStyle.textColor,
                                  opacity: 0.5,
                                }}
                              >
                                Your note content will appear here...
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Fade out effect for overflow */}
                        {content && content.length > 250 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 pointer-events-none"
                            style={{
                              background: `linear-gradient(transparent, ${customStyle.backgroundColor})`,
                            }}
                          />
                        )}
                      </div>

                      {/* Preview Actions */}
                      <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <span className="flex items-center">
                            <Type className="h-3 w-3 mr-1" />
                            {content.length} chars
                          </span>
                          <span className="flex items-center">
                            <Hash className="h-3 w-3 mr-1" />
                            {tags.length} tags
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: customStyle.backgroundColor,
                            }}
                          />
                          <span>Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          onTextExtracted={handlePhotoUpload}
          onClose={() => setShowPhotoUpload(false)}
          isProcessing={processingPhoto}
        />
      )}

      {/* Processing Popup */}
      {showProcessingPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full max-h-96 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                Processing Photo
              </h3>
              <button
                onClick={() => setShowProcessingPopup(false)}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={processingPhoto}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Step */}
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <p className="text-blue-200 text-sm font-medium mb-2">
                {processingStep || 'Initializing...'}
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-blue-900/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-blue-300">Progress</span>
                <span className="text-xs text-blue-300 font-medium">{processingProgress}%</span>
              </div>
            </div>

            {/* Messages Log */}
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {processingMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    message.type === 'success'
                      ? 'bg-green-500/20 border border-green-400/30 text-green-200'
                      : message.type === 'error'
                      ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                      : message.type === 'warning'
                      ? 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-200'
                      : 'bg-gray-500/20 border border-gray-400/30 text-gray-200'
                  }`}
                >
                  <span className="text-xs text-gray-400 mt-0.5 min-w-16">
                    {message.timestamp}
                  </span>
                  <span className="flex-1">{message.message}</span>
                </motion.div>
              ))}
            </div>

            {/* Progress Indicator */}
            {processingPhoto && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  Processing in progress...
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
        isSaving={saving}
      />
    </ProfessionalBackground>
  );
};

export default NoteEdit;
