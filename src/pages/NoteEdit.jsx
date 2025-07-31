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
} from "lucide-react";
import Button from "../components/Button";
import ProfessionalBackground from "../components/ProfessionalBackground";
import Breadcrumb from "../components/Breadcrumb";
import TagManager from "../components/TagManager";
import { useAuth } from "../contexts/AuthContext";
import notesService from "../services/notesService";
import aiService from "../services/aiService";
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

  const [showStylePanel, setShowStylePanel] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingNote, setGeneratingNote] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState("general");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearchTerm, setEmojiSearchTerm] = useState("");

  // Debug tags changes
  useEffect(() => {
    console.log("NoteEdit: Tags state changed:", tags);
  }, [tags]);

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
    if (title.trim() || content.trim()) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [title, content]);

  // Auto-save functionality
  useEffect(() => {
    const isAutoSaveEnabled =
      localStorage.getItem("scribly_auto_save") === "true";

    if (
      isAutoSaveEnabled &&
      user &&
      (title.trim() || content.trim()) &&
      title.trim()
    ) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save
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
          if (id) {
            // Update existing note
            savedNote = await notesService.updateNote(id, noteData);
          } else {
            // Create new note and update URL
            savedNote = await notesService.createNote(noteData);
            // Update the URL to reflect the new note ID
            window.history.replaceState(
              null,
              "",
              `/notes/edit/${savedNote.$id}`
            );
          }

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
          console.error("Auto-save failed:", error);
          // Don't show error toast for auto-save failures to avoid spam
        }
      }, 2000);

      setAutoSaveTimeout(timeout);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [title, content, emoji, tags, customStyle, user, id]);

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
      const shouldLeave = window.confirm(
        "You have unsaved changes. Do you want to leave without saving?"
      );
      if (!shouldLeave) return;
    }

    if (!id) {
      navigate("/dashboard");
    } else {
      navigate(`/notes/view/${id}`);
    }
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
    // Check if we have AI-generated note data from navigation state
    if (location.state?.aiGeneratedNote) {
      const aiNote = location.state.aiGeneratedNote;
      setTitle(aiNote.title);
      setContent(aiNote.content);
      setEmoji(aiNote.emoji);
      setTags(aiNote.tags || []);
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
      setLoading(false);
    }
  }, [id, location.state]);

  const loadNote = async () => {
    try {
      const note = await notesService.getNote(id);
      setTitle(note.title);
      setContent(note.content);
      setEmoji(note.emoji);
      setTags(note.tags || []);
      setCustomStyle(
        note.customStyle || {
          backgroundColor: "#1e3a8a",
          textColor: "#ffffff",
          fontSize: "16px",
          fontFamily: "Inter, sans-serif",
        }
      );
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading note:", error);
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
      !id ? "Creating note..." : "Saving changes..."
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
      if (id) {
        // Update existing note
        savedNote = await notesService.updateNote(id, noteData);
      } else {
        // Create new note
        savedNote = await notesService.createNote(noteData);
      }

      setHasUnsavedChanges(false); // Clear unsaved changes flag

      // Show success toast
      toast.dismiss(loadingToast);
      toast.success(
        !id ? "Note created successfully!" : "Note saved successfully!",
        {
          duration: 3000,
        }
      );

      // Navigate to view mode after a short delay
      setTimeout(() => {
        navigate(`/notes/view/${savedNote.$id}`);
      }, 1000);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTags = async () => {
    console.log("AI Tags: Starting tag generation...");
    console.log("AI Tags: Title:", title);
    console.log("AI Tags: Content length:", content.length);

    if (!title.trim() && !content.trim()) {
      toast.error("Please add a title or content first");
      return;
    }

    const userApiKey = localStorage.getItem("scribly_gemini_api_key");
    console.log("AI Tags: API key exists:", !!userApiKey);

    if (!userApiKey) {
      toast.error("Please set your Google Gemini API key in settings");
      return;
    }

    setGeneratingTags(true);

    // Show loading toast
    const loadingToast = toast.loading("Generating AI tags...");

    try {
      console.log("AI Tags: Initializing AI service...");

      // Initialize AI service
      aiService.initialize(userApiKey);

      console.log("AI Tags: Calling generateTagsForNote...");

      // Generate tags based on title and content
      const generatedTags = await aiService.generateTagsForNote(title, content);

      console.log("AI Tags: Generated tags:", generatedTags);

      if (generatedTags && generatedTags.length > 0) {
        // Merge with existing tags, avoiding duplicates
        const newTags = [...new Set([...tags, ...generatedTags])];
        console.log("AI Tags: Current tags:", tags);
        console.log("AI Tags: New tags to set:", newTags);
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
      console.error("AI Tags: Error generating tags:", error);
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
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleManualAIGeneration = async (prompt) => {
    const userApiKey = localStorage.getItem("scribly_gemini_api_key");
    if (!userApiKey) {
      toast.error(
        "Please set your Google Gemini API key in Dashboard settings"
      );
      return;
    }

    setGeneratingNote(true);
    try {
      // Initialize AI service
      aiService.initialize(userApiKey);

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
      console.error("Error generating note:", error);
      toast.error("Failed to generate note. Please check your API key.");
    } finally {
      setGeneratingNote(false);
    }
  };

  const handleGenerateContentFromTitle = async () => {
    if (!title.trim()) {
      toast.error("Please add a title first");
      return;
    }

    const userApiKey = localStorage.getItem("scribly_gemini_api_key");
    if (!userApiKey) {
      toast.error(
        "Please set your Google Gemini API key in Dashboard settings"
      );
      return;
    }

    setGeneratingNote(true);
    try {
      // Initialize AI service
      aiService.initialize(userApiKey);

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
      console.error("Error generating content:", error);
      toast.error(`Error generating content: ${error.message}`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb noteTitle={!id ? null : title} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackNavigation}
                className={`px-4 py-2 text-gray-400 hover:text-white rounded-lg border transition-all duration-200 ${
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

              <h1 className="text-2xl font-bold text-white">
                {!id ? "Create Note" : "Edit Note"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {id && (
                <button
                  onClick={() => {
                    // Save as draft first if there's content, then preview
                    if (title.trim() || content.trim()) {
                      // Create a temporary note for preview
                      const tempNote = {
                        id: id,
                        title: title || "Untitled Note",
                        content,
                        emoji,
                        tags,
                        customStyle,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        starred: false,
                        isTemp: true,
                      };
                      // Store in sessionStorage for preview
                      sessionStorage.setItem(
                        "tempNote",
                        JSON.stringify(tempNote)
                      );
                      navigate(`/notes/${id}?preview=true`);
                    } else {
                      navigate(`/notes/${id}`);
                    }
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 rounded-lg border border-blue-500/50 hover:border-blue-400"
                >
                  Preview
                </button>
              )}

              <Button
                onClick={handleSave}
                loading={saving}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {saving ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Main Editor */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden"
            >
              {/* Title and Emoji */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center space-x-4 mb-4">
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="text-3xl bg-transparent border-none outline-none cursor-pointer"
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
                    className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400"
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
              <div className="p-6 border-b border-gray-700/50 space-y-4">
                {/* Main Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {/* Text Formatting Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertText("**", "**")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertText("*", "*")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertText("<u>", "</u>")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertText("~~", "~~")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Strikethrough"
                      >
                        <Strikethrough className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Headings Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                      <button
                        onClick={() => insertAtNewLine("# ")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                        title="Heading 1"
                      >
                        <Heading1 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("## ")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                        title="Heading 2"
                      >
                        <Heading2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => insertAtNewLine("### ")}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                        title="Heading 3"
                      >
                        <Heading3 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Lists & Structure Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
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

                    {/* Content Elements Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
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

                  <span className="text-sm text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-600/30 font-mono">
                    {content.length} chars
                  </span>
                </div>

                {/* Secondary Toolbar - Templates, Emojis & Quick Inserts */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3 flex-wrap">
                    {/* Templates Dropdown */}
                    <div className="relative group">
                      <button className="px-4 py-2.5 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max">
                        <FileText className="h-4 w-4 mr-2" />
                        Templates
                      </button>
                      <div className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
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
                      <button className="px-4 py-2.5 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Callouts
                      </button>
                      <div className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
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
                        className="px-4 py-2.5 text-sm bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white rounded-lg border border-gray-600/50 transition-all duration-200 flex items-center min-w-max"
                      >
                        <Smile className="h-4 w-4 mr-2" />
                        Emojis
                      </button>

                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-xl shadow-2xl w-96 max-h-96 overflow-hidden z-30">
                          {/* Emoji Search */}
                          <div className="p-4 border-b border-gray-700/50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search emojis..."
                                value={emojiSearchTerm}
                                onChange={(e) =>
                                  setEmojiSearchTerm(e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Quick Emojis */}
                          <div className="p-4 border-b border-gray-700/50">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                              Quick Access
                            </h4>
                            <div className="grid grid-cols-10 gap-1">
                              {quickEmojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    insertEmoji(emoji);
                                    setShowEmojiPicker(false);
                                  }}
                                  className="p-2 hover:bg-gray-700/50 rounded-md transition-all duration-200 text-lg hover:scale-110"
                                  title={`Insert ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Emoji Categories */}
                          <div className="max-h-64 overflow-y-auto p-4 space-y-4">
                            {Object.entries(getFilteredEmojis()).map(
                              ([category, emojis]) => (
                                <div key={category}>
                                  <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                                    {category}
                                  </h4>
                                  <div className="grid grid-cols-10 gap-1">
                                    {emojis.slice(0, 50).map((emoji, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          insertEmoji(emoji);
                                          setShowEmojiPicker(false);
                                        }}
                                        className="p-2 hover:bg-gray-700/50 rounded-md transition-all duration-200 text-lg hover:scale-110"
                                        title={`Insert ${emoji}`}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                  {emojis.length > 50 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      +{emojis.length - 50} more emojis in this
                                      category
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>

                          {/* Close button */}
                          <div className="p-3 border-t border-gray-700/50 bg-gray-800/60">
                            <button
                              onClick={() => setShowEmojiPicker(false)}
                              className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              Close Emoji Picker
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date/Time Group */}
                    <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
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
                <div className="flex items-center justify-end space-x-2 w-full">
                  <select
                    value={selectedNoteType}
                    onChange={(e) => setSelectedNoteType(e.target.value)}
                    className="text-xs bg-gray-800/60 border border-gray-600/50 text-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                    className="bg-gradient-to-r items-center flex from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5"
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
                  <div className="flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-medium text-gray-300">
                        Shortcuts:
                      </span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono">
                        Ctrl+B
                      </span>
                      <span className="text-gray-500">=</span>
                      <span>Bold</span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono">
                        Ctrl+I
                      </span>
                      <span className="text-gray-500">=</span>
                      <span>Italic</span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono">
                        Ctrl+U
                      </span>
                      <span className="text-gray-500">=</span>
                      <span>Underline</span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono">
                        ---
                      </span>
                      <span className="text-gray-500">=</span>
                      <span>Horizontal Line</span>
                      <span className="px-2 py-1 bg-gray-800/60 rounded border border-gray-600/30 font-mono">
                        Tab
                      </span>
                      <span className="text-gray-500">=</span>
                      <span>Indent</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap"></div>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="p-6 min-h-[500px]">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>Content</span>
                    <div className="flex items-center space-x-4">
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
                  className="w-full h-96 bg-transparent border-none outline-none placeholder-gray-400 resize-none leading-relaxed"
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
          <div className="w-96">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-blue-400" />
                Customization
              </h3>

              {/* Background Color Picker */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">
                  Background Color
                </label>

                <div className="mb-4">
                  <input
                    type="color"
                    value={customStyle.backgroundColor}
                    onChange={(e) =>
                      setCustomStyle((prev) => ({
                        ...prev,
                        backgroundColor: e.target.value,
                      }))
                    }
                    className="w-full h-12 rounded-xl border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Current: {customStyle.backgroundColor}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.color}
                      onClick={() =>
                        setCustomStyle((prev) => ({
                          ...prev,
                          backgroundColor: bg.color,
                        }))
                      }
                      className={`group relative w-full h-12 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        customStyle.backgroundColor === bg.color
                          ? "border-white shadow-lg"
                          : "border-gray-600 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: bg.color }}
                      title={bg.name}
                    >
                      {customStyle.backgroundColor === bg.color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="mb-6">
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
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
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
              <div className="mb-6">
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
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
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
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">
                  Text Color
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setCustomStyle((prev) => ({
                        ...prev,
                        textColor: "#ffffff",
                      }))
                    }
                    className={`flex-1 h-10 rounded-lg border-2 bg-white transition-all duration-300 ${
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
                    className={`flex-1 h-10 rounded-lg border-2 bg-black transition-all duration-300 ${
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
                    className="flex-1 h-10 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">
                  Live Preview
                </label>
                <div
                  className="p-6 rounded-xl border-2 border-gray-600 min-h-[140px] transition-all duration-300 prose prose-invert max-w-none"
                  style={{ backgroundColor: customStyle.backgroundColor }}
                >
                  {title && (
                    <h4
                      className="font-bold mb-3"
                      style={{
                        fontSize: `calc(${customStyle.fontSize} + 2px)`,
                        fontFamily: customStyle.fontFamily,
                        color: customStyle.textColor,
                      }}
                    >
                      {title}
                    </h4>
                  )}
                  <div
                    className="leading-relaxed"
                    style={{
                      fontSize: customStyle.fontSize,
                      fontFamily: customStyle.fontFamily,
                      color: customStyle.textColor,
                      opacity: 0.9,
                    }}
                  >
                    {content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(
                            content.length > 200
                              ? content.substring(0, 200) + "..."
                              : content
                          ),
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">
                        Your note content will appear here with the selected
                        styling...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default NoteEdit;
