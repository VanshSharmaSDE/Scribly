import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { 
  Download,
  Calendar,
  Tag,
  Share,
  User,
  ArrowLeft,
  Copy,
  ChevronDown,
  FileText,
  Image
} from 'lucide-react';
import notesService from '../services/notesService';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import { parseMarkdown } from '../utils/markdown';

const SharedNoteView = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the shared note
        const sharedNote = await notesService.getSharedNote(shareToken);
        setNote(sharedNote);
        
        // Fetch creator info
        const creatorInfo = await notesService.getCreatorInfo(sharedNote.userId);
        setCreator(creatorInfo);
        
      } catch (error) {

        setError(error.message || 'Failed to load shared note');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedNote();
    }
  }, [shareToken]);

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
      
      // Add creator info if available
      if (creator) {
        const creatorDiv = document.createElement('div');
        creatorDiv.style.fontSize = '14px';
        creatorDiv.style.color = '#9CA3AF';
        creatorDiv.style.marginBottom = '20px';
        creatorDiv.textContent = `By ${creator.name}`;
        tempContainer.appendChild(titleDiv);
        tempContainer.appendChild(creatorDiv);
      } else {
        tempContainer.appendChild(titleDiv);
      }
      
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard', {
      duration: 2000,
    });
  };

  const handleBackToScribly = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-12 sm:pt-16 min-h-screen">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-700 rounded mb-4 w-1/4"></div>
            <div className="h-8 sm:h-12 bg-gray-700 rounded mb-6 w-3/4"></div>
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

  if (error) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-12 sm:pt-16 min-h-screen">
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 opacity-50">🔗</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-3 px-4">Unable to Load Shared Note</h2>
            <p className="text-gray-400 mb-6 sm:mb-8 px-4 text-sm sm:text-base break-words">{error}</p>
            <div className="space-x-4">
              <Button 
                onClick={handleBackToScribly} 
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
              >
                Go to Scribly
              </Button>
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
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-3 px-4">Shared note not found</h2>
            <p className="text-gray-400 mb-6 sm:mb-8 px-4 text-sm sm:text-base">This shared note may have been removed or the link has expired.</p>
            <Button 
              onClick={handleBackToScribly} 
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              Go to Scribly
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
    <ProfessionalBackground>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          {/* Shared Note Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 sm:px-6 py-4 rounded-lg backdrop-blur-sm shadow-lg mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Share className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Shared Note</div>
                  <div className="text-sm text-blue-200/80">
                    This note has been shared publicly by {creator?.name || 'a Scribly user'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  size="sm"
                  className="border-blue-400/50 flex items-center text-blue-300 hover:bg-blue-400/10 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">Copy Link</span>
                  <span className="xs:hidden">Copy</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToScribly}
                  size="sm"
                  className="border-blue-400/50 flex items-center text-blue-300 hover:bg-blue-400/10 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Scribly
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-3xl sm:text-4xl flex-shrink-0">{note.emoji || '📝'}</div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white break-words leading-tight">{note.title}</h1>
                </div>
              </div>
              
              <div className="flex items-center justify-end sm:justify-start space-x-2 flex-shrink-0">
                {/* Download Dropdown */}
                <div className="relative" ref={downloadMenuRef}>
                  <Button
                    variant="outline"
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 flex items-center space-x-1 text-sm px-3 py-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showDownloadMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleDownload}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-3" />
                          Download as MD
                        </button>
                        <button
                          onClick={handleDownloadPNG}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Image className="h-4 w-4 mr-3" />
                          Download as PNG
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-3 sm:gap-6 text-sm text-gray-400 mb-8">
              {creator && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="break-words">
                    Created by {creator.name}
                    {creator.email && (
                      <span className="ml-1 text-gray-500 hidden sm:inline">({creator.email})</span>
                    )}
                  </span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="break-words">Last updated {formatDate(note.$updatedAt)}</span>
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-start w-full sm:w-auto">
                  <Tag className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 break-all"
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
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 lg:p-8"
        >
          <div 
            ref={contentRef}
            className="prose prose-invert max-w-none prose-sm sm:prose-base"
            style={{ 
              backgroundColor: customStyle.backgroundColor,
              color: customStyle.textColor,
              fontFamily: customStyle.fontFamily,
              fontSize: window.innerWidth < 640 ? '14px' : customStyle.fontSize,
              padding: window.innerWidth < 640 ? '1rem' : '2rem',
              borderRadius: '0.75rem',
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 sm:mt-12 text-center py-6 sm:py-8 border-t border-gray-700/50"
        >
          <p className="text-gray-400 mb-4 text-sm sm:text-base px-4">
            Want to create your own notes like this?
          </p>
          <Button
            onClick={handleBackToScribly}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
          >
            Try Scribly for Free
          </Button>
        </motion.div>
      </div>
    </ProfessionalBackground>
  );
};

export default SharedNoteView;

