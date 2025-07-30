import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Star, 
  Share, 
  Download,
  Calendar,
  Tag,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import notesService from '../services/notesService';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';

const NoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Check if this is a preview from editing
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === 'true';

  useEffect(() => {
    const fetchNote = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check for temporary note in sessionStorage first (for preview mode)
      if (isPreview) {
        const tempNote = sessionStorage.getItem('tempNote');
        if (tempNote) {
          const parsedNote = JSON.parse(tempNote);
          if (parsedNote.$id === id) {
            setNote(parsedNote);
            setLoading(false);
            return;
          }
        }
      }
      
      try {
        setLoading(true);
        const fetchedNote = await notesService.getNote(id);
        
        // Verify that the note belongs to the current user
        if (fetchedNote.userId !== user.$id) {
          toast.error('Note not found');
          navigate('/dashboard');
          return;
        }
        
        setNote(fetchedNote);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isPreview, user, navigate]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await notesService.deleteNote(note.$id);
      
      toast.success('Note deleted successfully', {
        duration: 3000,
      });
      
      setShowDeleteModal(false);
      navigate('/dashboard', { state: { refresh: true } });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleToggleStar = async () => {
    try {
      const newStarredState = !note.starred;
      await notesService.toggleStar(note.$id, newStarredState);
      
      setNote(prev => ({ ...prev, starred: newStarredState }));
      
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
      console.error('Error toggling star:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard', {
      duration: 2000,
    });
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([note.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Note downloaded', {
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-gray-700 rounded mb-6 w-3/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  if (!note) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">📝</div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-3">Note not found</h2>
            <p className="text-gray-400 mb-8">The note you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-blue-500 hover:bg-blue-600 text-white border-0">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  const customStyle = note.customStyle ? 
    (typeof note.customStyle === 'string' ? JSON.parse(note.customStyle) : note.customStyle)
    : {
        backgroundColor: note.color || '#1e3a8a',
        textColor: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      };

  return (
    <>
    <ProfessionalBackground>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb noteTitle={note?.title} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                >
                  Back
                </Button>
                <div className="text-4xl">{note.emoji || '📝'}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleToggleStar}
                  className={`border-gray-600 transition-all duration-300 ${
                    note.starred 
                      ? 'text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10' 
                      : 'text-gray-300 hover:text-yellow-400 hover:border-yellow-400/50 hover:bg-yellow-400/10'
                  }`}
                >
                  <Star className={`h-4 w-4 ${note.starred ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Link to={`/notes/edit/${note.$id}`}>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{note.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Updated {formatDate(note.$updatedAt)}</span>
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
        >
          <div 
            className="prose prose-invert max-w-none"
            style={{ 
              backgroundColor: customStyle.backgroundColor,
              color: customStyle.textColor,
              fontFamily: customStyle.fontFamily,
              fontSize: customStyle.fontSize,
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ 
                __html: note.content.replace(/\n/g, '<br/>') 
              }} 
            />
          </div>
        </motion.div>

        {/* Preview Banner */}
        {isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-6 py-3 rounded-lg backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Preview Mode</span>
              <span className="text-yellow-200/80">•</span>
              <span className="text-sm">Changes are not saved yet</span>
            </div>
          </motion.div>
        )}
      </div>
    </ProfessionalBackground>

    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleDelete}
      title="Delete Note"
      message={`Are you sure you want to delete "${note?.title}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
      isLoading={deleteLoading}
    />
    </>
  );
};

export default NoteView;