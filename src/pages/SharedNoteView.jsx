import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Download,
  Calendar,
  Tag,
  Share,
  User,
  ArrowLeft,
  Copy
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

  if (error) {
    return (
      <ProfessionalBackground>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">🔗</div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-3">Unable to Load Shared Note</h2>
            <p className="text-gray-400 mb-8">{error}</p>
            <div className="space-x-4">
              <Button 
                onClick={handleBackToScribly} 
                className="bg-blue-500 hover:bg-blue-600 text-white border-0"
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 min-h-screen">
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-50">📝</div>
            <h2 className="text-2xl font-semibold text-gray-200 mb-3">Shared note not found</h2>
            <p className="text-gray-400 mb-8">This shared note may have been removed or the link has expired.</p>
            <Button 
              onClick={handleBackToScribly} 
              className="bg-blue-500 hover:bg-blue-600 text-white border-0"
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
            className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-6 py-4 rounded-lg backdrop-blur-sm shadow-lg mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Share className="h-5 w-5" />
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
                  className="border-blue-400/50 flex item-center text-blue-300 hover:bg-blue-400/10"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToScribly}
                  size="sm"
                  className="border-blue-400/50 flex item-center text-blue-300 hover:bg-blue-400/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
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
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{note.emoji || '📝'}</div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">{note.title}</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="border-gray-600 flex item-center text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8">
              {creator && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Created by {creator.name}</span>
                  {creator.email && (
                    <span className="ml-1 text-gray-500">({creator.email})</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last updated {formatDate(note.$updatedAt)}</span>
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
          className="mt-12 text-center py-8 border-t border-gray-700/50"
        >
          <p className="text-gray-400 mb-4">
            Want to create your own notes like this?
          </p>
          <Button
            onClick={handleBackToScribly}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-3"
          >
            Try Scribly for Free
          </Button>
        </motion.div>
      </div>
    </ProfessionalBackground>
  );
};

export default SharedNoteView;

