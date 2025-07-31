import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Edit3, 
  Trash2, 
  Star,
  Tag,
  Calendar,
  Eye,
  Sparkles,
  Wand2,
  Share
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import notesService from '../services/notesService';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProfessionalBackground from '../components/ProfessionalBackground';
import ProfileDropdown from '../components/ProfileDropdown';
import Breadcrumb from '../components/Breadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';
import AIGeneratorModal from '../components/AIGeneratorModal';
import AIFeaturesGuide from '../components/AIFeaturesGuide';
import SharedLinksManager from '../components/SharedLinksManager';
import aiService from '../services/aiService';
import { parseMarkdown } from '../utils/markdown';

const NoteCard = ({ note, onDelete, onToggleStar, viewMode = 'grid' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const truncateContent = (content, maxLength = 150) => {
    // Parse markdown and then extract plain text for truncation
    const parsedHtml = parseMarkdown(content);
    // Remove HTML tags to get plain text
    const plainText = parsedHtml.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText;
  };

  const customStyle = note.customStyle ? 
    (typeof note.customStyle === 'string' ? JSON.parse(note.customStyle) : note.customStyle)
    : {
        backgroundColor: note.color || '#1e3a8a',
        textColor: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group cursor-pointer"
      >
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:bg-gray-800/70 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-2xl">{note.emoji || '📝'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-100 truncate group-hover:text-white transition-colors">{note.title}</h3>
                  {note.starred && <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />}
                </div>
                <div 
                  className="text-sm mb-3 p-3 rounded-lg border transition-all duration-300"
                  style={{ 
                    backgroundColor: customStyle.backgroundColor,
                    color: customStyle.textColor,
                    fontFamily: customStyle.fontFamily,
                    fontSize: customStyle.fontSize,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdown(note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content)
                    }} 
                  />
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(note.$updatedAt)}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{note.tags.slice(0, 2).join(', ')}</span>
                      {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
                <Link to={`/notes/view/${note.$id}`} className="block">
                  <div className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200 rounded-l-lg border-r border-gray-600/30" title="View Note">
                    <Eye className="h-4 w-4" />
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(note.$id);
                  }}
                  className={`p-2 transition-all duration-200 border-r border-gray-600/30 ${
                    note.starred 
                      ? 'text-yellow-400 bg-yellow-400/10' 
                      : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                  }`}
                  title={note.starred ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`h-4 w-4 ${note.starred ? 'fill-current' : ''}`} />
                </button>
                <Link to={`/notes/edit/${note.$id}`} className="block">
                  <div className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200 border-r border-gray-600/30" title="Edit Note">
                    <Edit3 className="h-4 w-4" />
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note);
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 rounded-r-lg"
                  title="Delete Note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:bg-gray-800/70 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl">{note.emoji || '📝'}</div>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-lg">
              <Link to={`/notes/view/${note.$id}`} className="block">
                <div className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-200 rounded-l-lg border-r border-gray-600/30" title="View Note">
                  <Eye className="h-4 w-4" />
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(note.$id);
                }}
                className={`p-2 transition-all duration-200 border-r border-gray-600/30 ${
                  note.starred 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                }`}
                title={note.starred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`h-4 w-4 ${note.starred ? 'fill-current' : ''}`} />
              </button>
              <Link to={`/notes/edit/${note.$id}`} className="block">
                <div className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-200 border-r border-gray-600/30" title="Edit Note">
                  <Edit3 className="h-4 w-4" />
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note);
                }}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 rounded-r-lg"
                title="Delete Note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-100 mb-3 line-clamp-2 group-hover:text-white transition-colors">{note.title}</h3>
        <div 
          className="text-sm mb-4 p-4 rounded-lg border flex-1 transition-all duration-300"
          style={{ 
            backgroundColor: customStyle.backgroundColor,
            color: customStyle.textColor,
            fontFamily: customStyle.fontFamily,
            fontSize: customStyle.fontSize,
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: parseMarkdown(note.content.length > 150 ? note.content.substring(0, 150) + '...' : note.content)
            }} 
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags && note.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {note.tags && note.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-700/60 text-gray-400 text-xs rounded-full border border-gray-600/50">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(note.$updatedAt)}
          </span>
          <span className="text-gray-600">
            Updated
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // AI-related states
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [showSharedLinksManager, setShowSharedLinksManager] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('scribly_gemini_api_key') || '';
  });

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Refetch notes when the page becomes visible (e.g., returning from note view)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchNotes();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchNotes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Refetch notes when returning to dashboard (e.g., after deleting a note in NoteView)
  useEffect(() => {
    // Check if we're coming back to dashboard with a state indicating a refresh is needed
    if (location.state?.refresh && user) {
      fetchNotes();
      // Clear the state to prevent unnecessary refetches
      navigate('/dashboard', { replace: true, state: undefined });
    }
  }, [location.state, user, navigate]);

  const fetchNotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await notesService.getUserNotes(user.$id);
      setNotes(response.documents || []);
    } catch (error) {
      toast.error('Failed to load notes');
      setNotes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const allTags = [...new Set(notes.flatMap(note => note.tags || []))];

  const handleDeleteNote = async (noteId) => {
    setDeleteLoading(true);
    try {
      await notesService.deleteNote(noteId);
      
      // Remove from local state
      setNotes(notes.filter(note => note.$id !== noteId));
      
      toast.success('Note deleted successfully', {
        duration: 3000,
      });
      
      setShowDeleteModal(false);
      setNoteToDelete(null);
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const handleToggleStar = async (noteId) => {
    try {
      const note = notes.find(n => n.$id === noteId);
      const newStarredState = !note.starred;
      
      await notesService.toggleStar(noteId, newStarredState);
      
      // Update local state
      setNotes(notes.map(note => 
        note.$id === noteId ? { ...note, starred: newStarredState } : note
      ));
      
      // Show appropriate toast message
      if (newStarredState) {
        toast.success('Note added to favorites', {
          duration: 2000,
        });
      } else {
        toast.success('Note removed from favorites', {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  // AI-related functions
  const handleAIGenerate = () => {
    if (!userApiKey) {
      setShowAIGuide(true);
      return;
    }
    setShowAIModal(true);
  };

  const handleSaveAINote = async (noteData) => {
    try {
      const noteToSave = {
        ...noteData,
        userId: user.$id,
        customStyle: JSON.stringify({
          backgroundColor: '#1e3a8a',
          textColor: '#ffffff',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif'
        })
      };

      const savedNote = await notesService.createNote(noteToSave);
      setNotes(prevNotes => [savedNote, ...prevNotes]);
      toast.success('AI-generated note saved successfully!');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleEditAINote = (noteData) => {
    // Navigate to edit page with pre-filled data
    navigate('/notes/new', { 
      state: { 
        aiGeneratedNote: noteData 
      } 
    });
  };

  if (!user) {
    return (
      <ProfessionalBackground>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-3">Authentication Required</h2>
            <p className="text-gray-400 mb-8">Please log in to access your notes.</p>
            <Button onClick={() => navigate('/login')} className="bg-blue-500 hover:bg-blue-600 text-white border-0">
              Go to Login
            </Button>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <div className="mb-8">
            <LoadingSkeleton variant="title" className="w-64 mb-4" />
            <LoadingSkeleton variant="text" className="w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  // Show empty state immediately if no notes and not loading
  if (!loading && notes.length === 0) {
    return (
      <>
        <ProfessionalBackground>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
            {/* Header with Profile */}
            <div className="flex items-start justify-between mb-12">
              <div className="flex-1">
                <Breadcrumb />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  {/* Beta Tag */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full mb-4 border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                      borderColor: 'rgba(147, 51, 234, 0.3)',
                      color: '#9333ea'
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    <span className="text-xs font-semibold">BETA</span>
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Your <span className="gradient-text">Workspace</span>
                  </h1>
                  <p className="text-xl text-gray-300">
                    0 notes in your collection
                  </p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-shrink-0 ml-8"
              >
                <ProfileDropdown />
              </motion.div>
            </div>

            {/* Empty State */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6 opacity-50">📝</div>
                <h3 className="text-2xl font-semibold text-gray-200 mb-3">
                  No notes yet
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Create your first note to start building your knowledge base
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <Button 
                    onClick={handleAIGenerate}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create with AI
                  </Button>
                  
                  <Button 
                    onClick={handleCreateNote}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 items-center flex"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Manually
                  </Button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => setShowAIGuide(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-2 transition-colors hover:underline"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>How to Use AI</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </ProfessionalBackground>

        {/* Modals - Include in empty state too! */}
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteNote(noteToDelete?.$id)}
          title="Delete Note"
          message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={deleteLoading}
        />

        {/* AI Generator Modal */}
        <AIGeneratorModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onSaveNote={handleSaveAINote}
          onEditNote={handleEditAINote}
          userApiKey={userApiKey}
        />

        {/* AI Features Guide */}
        {showAIGuide && (
          <AIFeaturesGuide
            onClose={() => setShowAIGuide(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ProfessionalBackground>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          {/* Header with Profile */}
          <div className="flex items-start justify-between mb-12">
            <div className="flex-1">
              <Breadcrumb />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                {/* Beta Tag */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full mb-4 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                    borderColor: 'rgba(147, 51, 234, 0.3)',
                    color: '#9333ea'
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  <span className="text-xs font-semibold">BETA</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Your <span className="gradient-text">Workspace</span>
                </h1>
                <p className="text-xl text-gray-300">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your collection
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 ml-8"
            >
              <ProfileDropdown />
            </motion.div>
          </div>

          {/* AI Features Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl">
                    <Sparkles className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Note Creation</h3>
                    <p className="text-sm text-gray-300">Generate intelligent notes with just a prompt</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={handleAIGenerate}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create with AI
                  </Button>
                  
                  <button
                    onClick={() => setShowAIGuide(true)}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all duration-200 text-sm"
                  >
                    How to Use AI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-6"
          >
            {/* Search and Filter Row */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300 z-10" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all duration-300 hover:border-gray-600"
                  />
                </div>
                
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-4 py-4 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-gray-100 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70 transition-all duration-300 hover:border-gray-600 cursor-pointer"
                >
                  <option value="" className="bg-gray-800">All tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag} className="bg-gray-800">#{tag}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl p-1 shadow-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">                  
                  <Button 
                    onClick={() => setShowSharedLinksManager(true)}
                    className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Manage Links
                  </Button>
                  <Button 
                    onClick={handleCreateNote} 
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notes Grid/List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredNotes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6 opacity-50">📝</div>
                  <h3 className="text-2xl font-semibold text-gray-200 mb-3">
                    {searchTerm || selectedTag ? 'No notes found' : 'No notes yet'}
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    {searchTerm || selectedTag 
                      ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                      : 'Create your first note to start building your knowledge base'
                    }
                  </p>
                  {!searchTerm && !selectedTag && (
                    <Button 
                      onClick={handleCreateNote}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Note
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence>
                  {filteredNotes.map(note => (
                    <NoteCard
                      key={note.$id}
                      note={note}
                      onDelete={handleDeleteClick}
                      onToggleStar={handleToggleStar}
                      viewMode={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </ProfessionalBackground>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDeleteNote(noteToDelete?.$id)}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteLoading}
      />

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSaveNote={handleSaveAINote}
        onEditNote={handleEditAINote}
        userApiKey={userApiKey}
      />

      {/* AI Features Guide */}
      {showAIGuide && (
        <AIFeaturesGuide
          onClose={() => setShowAIGuide(false)}
        />
      )}

      {/* Shared Links Manager */}
      <SharedLinksManager
        isOpen={showSharedLinksManager}
        onClose={() => setShowSharedLinksManager(false)}
        notes={notes}
      />
    </>
  );
};

export default Dashboard;

