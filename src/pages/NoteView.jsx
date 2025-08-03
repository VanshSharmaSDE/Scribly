import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Star, 
  Share, 
  Download,
  Calendar,
  Tag,
  Eye,
  ChevronDown,
  FileText,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import notesService from '../services/notesService';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';
import ShareModal from '../components/ShareModal';
import { parseMarkdown } from '../utils/markdown';

const NoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef(null);
  const contentRef = useRef(null);
  
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

        toast.error('Failed to load note');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isPreview, user, navigate]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      toast.error('Failed to update favorite status');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareUpdate = (shareData) => {
    setNote(prev => ({
      ...prev,
      ...shareData
    }));
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([note.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Note downloaded as Markdown', {
      duration: 2000,
    });
    setShowDownloadMenu(false);
  };

  const handleDownloadPNG = async () => {
    try {
      if (!contentRef.current) {
        toast.error('Content not ready for download');
        return;
      }

      // Show loading toast
      const toastId = toast.loading('Generating PNG...');

      // Create a temporary container for the content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '40px';
      tempContainer.style.backgroundColor = '#111827';
      tempContainer.style.color = '#ffffff';
      tempContainer.style.fontFamily = 'Inter, sans-serif';
      tempContainer.style.lineHeight = '1.6';
      
      // Clone the content
      const contentClone = contentRef.current.cloneNode(true);
      
      // Add title to the content
      const titleDiv = document.createElement('div');
      titleDiv.style.fontSize = '32px';
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.marginBottom = '24px';
      titleDiv.style.color = '#ffffff';
      titleDiv.textContent = note.title;
      
      tempContainer.appendChild(titleDiv);
      tempContainer.appendChild(contentClone);
      document.body.appendChild(tempContainer);

      // Generate canvas
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#111827',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: tempContainer.scrollHeight + 80
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create download link
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${note.title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.dismiss(toastId);
        toast.success('Note downloaded as PNG', {
          duration: 2000,
        });
      }, 'image/png');

    } catch (error) {
      console.error('Error generating PNG:', error);
      toast.error('Failed to generate PNG');
    }
    setShowDownloadMenu(false);
  };

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-12 sm:pt-16 min-h-screen">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-700 rounded mb-3 sm:mb-4 w-1/4"></div>
            <div className="h-8 sm:h-12 bg-gray-700 rounded mb-4 sm:mb-6 w-3/4"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  if (!note) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-12 sm:pt-16 min-h-screen">
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 opacity-50">📝</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-2 sm:mb-3 px-4">Note not found</h2>
            <p className="text-gray-400 mb-6 sm:mb-8 px-4 text-sm sm:text-base">The note you're looking for doesn't exist or has been deleted.</p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-12 sm:pt-16 min-h-screen">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumb noteTitle={note?.title} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 px-3 sm:px-4 py-2 text-sm sm:text-base"
                >
                  Back
                </Button>
                <div className="text-3xl sm:text-4xl">{note.emoji || '📝'}</div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleToggleStar}
                  className={`border-gray-600 transition-all duration-300 px-2 sm:px-3 py-2 text-sm sm:text-base ${
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
                  className={`border-gray-600 transition-all duration-300 px-2 sm:px-3 py-2 text-sm sm:text-base ${
                    note.isShared
                      ? 'text-green-400 border-green-400/50 hover:bg-green-400/10'
                      : 'text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
                  title={note.isShared ? 'Note is shared - click to manage' : 'Share this note publicly'}
                >
                  <Share className="h-4 w-4" />
                </Button>
                
                {/* Download Dropdown */}
                <div className="relative" ref={downloadMenuRef}>
                  <Button
                    variant="outline"
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 flex items-center space-x-1 px-2 sm:px-3 py-2 text-sm sm:text-base"
                  >
                    <Download className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showDownloadMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleDownload}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-2 sm:mr-3" />
                          Download as MD
                        </button>
                        <button
                          onClick={handleDownloadPNG}
                          className="flex items-center w-full px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Image className="h-4 w-4 mr-2 sm:mr-3" />
                          Download as PNG
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
                <Link to={`/notes/edit/${note.$id}`} className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white border-0 px-3 sm:px-4 py-2 text-sm sm:text-base">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="border-red-600 text-red-400 hover:bg-red-600/10 hover:border-red-500 px-2 sm:px-3 py-2 text-sm sm:text-base"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">{note.title}</h1>
            
            {/* Shared Status Indicator */}
            {note.isShared && (
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs sm:text-sm">
                  <Share className="h-3 w-3 mr-1 sm:mr-2" />
                  <span>Publicly Shared</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>Updated {formatDate(note.$updatedAt)}</span>
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-start">
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 mt-0.5" />
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
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
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8"
        >
          <div 
            ref={contentRef}
            className="prose prose-invert max-w-none prose-sm sm:prose-base"
            style={{ 
              backgroundColor: customStyle.backgroundColor,
              color: customStyle.textColor,
              fontFamily: customStyle.fontFamily,
              fontSize: customStyle.fontSize,
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ 
                __html: parseMarkdown(note.content)
              }} 
            />
          </div>
        </motion.div>

        {/* Preview Banner */}
        {isPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg backdrop-blur-sm shadow-lg mx-4 max-w-sm sm:max-w-none"
          >
            <div className="flex items-center space-x-2 justify-center">
              <Eye className="h-4 w-4" />
              <span className="font-medium text-sm sm:text-base">Preview Mode</span>
              <span className="text-yellow-200/80 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm hidden sm:inline">Changes are not saved yet</span>
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

    {/* Share Modal */}
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      note={note}
      onShareUpdate={handleShareUpdate}
    />
    </>
  );
};

export default NoteView;
