import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
  Eye
} from 'lucide-react';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import TagManager from '../components/TagManager';
import { useAuth } from '../contexts/AuthContext';
import notesService from '../services/notesService';

const NoteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emoji, setEmoji] = useState('📝');
  const [tags, setTags] = useState([]);
  const [customStyle, setCustomStyle] = useState({
    backgroundColor: '#1e3a8a',
    textColor: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif'
  });
  
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Track changes to detect unsaved content
  useEffect(() => {
    if (title.trim() || content.trim()) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [title, content]);

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm('You have unsaved changes. Do you want to leave without saving?');
      if (!shouldLeave) return;
    }
    
    if (!id) {
      navigate('/dashboard');
    } else {
      navigate(`/notes/view/${id}`);
    }
  };

  const emojiOptions = ['📝', '💡', '📚', '💼', '🎯', '⭐', '🔥', '💭', '📋', '🚀', '💻', '🎨', '📊', '🎵', '📷', '🌟'];
  
  const backgroundOptions = [
    { name: 'Deep Blue', color: '#1e3a8a' },
    { name: 'Forest Green', color: '#166534' },
    { name: 'Crimson Red', color: '#dc2626' },
    { name: 'Royal Purple', color: '#7c3aed' },
    { name: 'Slate Gray', color: '#374151' },
    { name: 'Amber Orange', color: '#d97706' },
    { name: 'Teal', color: '#0f766e' },
    { name: 'Rose', color: '#e11d48' },
    { name: 'Indigo', color: '#4f46e5' },
    { name: 'Emerald', color: '#059669' },
    { name: 'Violet', color: '#8b5cf6' },
    { name: 'Sky Blue', color: '#0284c7' }
  ];

  const fontSizeOptions = [
    { label: 'Extra Small (12px)', value: '12px' },
    { label: 'Small (14px)', value: '14px' },
    { label: 'Medium (16px)', value: '16px' },
    { label: 'Large (18px)', value: '18px' },
    { label: 'Extra Large (20px)', value: '20px' },
    { label: 'Huge (24px)', value: '24px' }
  ];

  const fontFamilyOptions = [
    { label: 'Inter (Modern)', value: 'Inter, sans-serif' },
    { label: 'Georgia (Serif)', value: 'Georgia, serif' },
    { label: 'Times New Roman (Classic)', value: '"Times New Roman", serif' },
    { label: 'Arial (Clean)', value: 'Arial, sans-serif' },
    { label: 'Helvetica (Swiss)', value: 'Helvetica, sans-serif' },
    { label: 'Courier New (Mono)', value: '"Courier New", monospace' },
    { label: 'Roboto (Google)', value: 'Roboto, sans-serif' },
    { label: 'Open Sans (Friendly)', value: '"Open Sans", sans-serif' },
    { label: 'Merriweather (Reading)', value: 'Merriweather, serif' },
    { label: 'Source Code Pro (Code)', value: '"Source Code Pro", monospace' }
  ];

  useEffect(() => {
    // Load existing note if editing
    if (id) {
      loadNote();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadNote = async () => {
    try {
      const note = await notesService.getNote(id);
      setTitle(note.title);
      setContent(note.content);
      setEmoji(note.emoji);
      setTags(note.tags || []);
      setCustomStyle(note.customStyle || {
        backgroundColor: '#1e3a8a',
        textColor: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading note:', error);
      toast.error('Failed to load note');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save notes');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    setSaving(true);
    
    // Show loading toast
    const loadingToast = toast.loading(!id ? 'Creating note...' : 'Saving changes...');
    
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        emoji,
        tags,
        customStyle,
        userId: user.$id
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
      toast.success(!id ? 'Note created successfully!' : 'Note saved successfully!', {
        duration: 3000,
      });
      
      // Navigate to view mode after a short delay
      setTimeout(() => {
        navigate(`/notes/view/${savedNote.$id}`);
      }, 1000);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('note-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
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
                    ? 'border-orange-500/50 hover:border-orange-400' 
                    : 'border-blue-500/50 hover:border-blue-400'
                }`}
              >
                {!id ? 'Back to Dashboard' : 'Back to Note'}
              </button>
              
              {hasUnsavedChanges && (
                <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">
                  Unsaved changes
                </span>
              )}
              
              <h1 className="text-2xl font-bold text-white">
                {!id ? 'Create Note' : 'Edit Note'}
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
                        title: title || 'Untitled Note',
                        content,
                        emoji,
                        tags,
                        customStyle,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        starred: false,
                        isTemp: true
                      };
                      // Store in sessionStorage for preview
                      sessionStorage.setItem('tempNote', JSON.stringify(tempNote));
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
                {saving ? 'Saving...' : 'Save Note'}
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
                    {emojiOptions.map(e => (
                      <option key={e} value={e}>{e}</option>
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

                <TagManager tags={tags} onTagsChange={setTags} />
              </div>

              {/* Toolbar */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                    <button
                      onClick={() => insertText('**', '**')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-l-lg border-r border-gray-600/30 transition-all duration-200"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertText('*', '*')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertText('## ', '')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                      title="Heading"
                    >
                      <Type className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertText('- ', '')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 border-r border-gray-600/30 transition-all duration-200"
                      title="List"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => insertText('[Link Text](url)', '')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-r-lg transition-all duration-200"
                      title="Link"
                    >
                      <Link2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <span className="text-sm text-gray-400 bg-gray-800/40 px-3 py-1 rounded-lg border border-gray-600/30">
                    {content.length} characters
                  </span>
                </div>
              </div>

              {/* Content Editor */}
              <div className="p-6 min-h-[500px]">
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className="w-full h-96 bg-transparent border-none outline-none placeholder-gray-400 resize-none leading-relaxed"
                  style={{
                    fontFamily: customStyle.fontFamily,
                    fontSize: customStyle.fontSize,
                    color: customStyle.textColor
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
                <label className="block text-sm font-semibold text-gray-200 mb-4">Background Color</label>
                
                <div className="mb-4">
                  <input
                    type="color"
                    value={customStyle.backgroundColor}
                    onChange={(e) => setCustomStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-12 rounded-xl border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-400 mt-2">Current: {customStyle.backgroundColor}</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.color}
                      onClick={() => setCustomStyle(prev => ({ ...prev, backgroundColor: bg.color }))}
                      className={`group relative w-full h-12 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        customStyle.backgroundColor === bg.color 
                          ? 'border-white shadow-lg' 
                          : 'border-gray-600 hover:border-gray-400'
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
                <label className="block text-sm font-semibold text-gray-200 mb-3">Font Family</label>
                <select
                  value={customStyle.fontFamily}
                  onChange={(e) => setCustomStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                >
                  {fontFamilyOptions.map((font) => (
                    <option key={font.value} value={font.value} className="bg-gray-800">
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-3">Font Size</label>
                <select
                  value={customStyle.fontSize}
                  onChange={(e) => setCustomStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                >
                  {fontSizeOptions.map((size) => (
                    <option key={size.value} value={size.value} className="bg-gray-800">
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Color */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">Text Color</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCustomStyle(prev => ({ ...prev, textColor: '#ffffff' }))}
                    className={`flex-1 h-10 rounded-lg border-2 bg-white transition-all duration-300 ${
                      customStyle.textColor === '#ffffff' ? 'border-blue-400' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  />
                  <button
                    onClick={() => setCustomStyle(prev => ({ ...prev, textColor: '#000000' }))}
                    className={`flex-1 h-10 rounded-lg border-2 bg-black transition-all duration-300 ${
                      customStyle.textColor === '#000000' ? 'border-blue-400' : 'border-gray-600 hover:border-gray-400'
                    }`}
                  />
                  <input
                    type="color"
                    value={customStyle.textColor}
                    onChange={(e) => setCustomStyle(prev => ({ ...prev, textColor: e.target.value }))}
                    className="flex-1 h-10 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">Live Preview</label>
                <div 
                  className="p-6 rounded-xl border-2 border-gray-600 min-h-[140px] transition-all duration-300"
                  style={{ backgroundColor: customStyle.backgroundColor }}
                >
                  <h4 
                    className="font-bold mb-3"
                    style={{
                      fontSize: `calc(${customStyle.fontSize} + 2px)`,
                      fontFamily: customStyle.fontFamily,
                      color: customStyle.textColor
                    }}
                  >
                    {title || 'Your Note Title'}
                  </h4>
                  <p 
                    className="leading-relaxed"
                    style={{
                      fontSize: customStyle.fontSize,
                      fontFamily: customStyle.fontFamily,
                      color: customStyle.textColor,
                      opacity: 0.9
                    }}
                  >
                    {content.substring(0, 120) || 'Your note content will appear here with the selected styling...'}
                  </p>
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
