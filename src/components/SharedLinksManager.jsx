import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Share,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Clock,
  TrendingUp,
  Plus,
  ExternalLink,
  Calendar
} from 'lucide-react';
import Button from './Button';
import notesService from '../services/notesService';

const SharedLinksManager = ({ isOpen, onClose, notes }) => {
  const [allShareLinks, setAllShareLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [newLinkName, setNewLinkName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAllShareLinks();
    }
  }, [isOpen, notes]);

  const loadAllShareLinks = async () => {
    setLoading(true);
    try {
      const linksData = [];
      
      for (const note of notes) {
        if (note.isShared) {
          const links = await notesService.getShareLinks(note.$id);
          const activeLinks = links.filter(link => link.isActive && !link.isExpired);
          
          if (activeLinks.length > 0) {
            linksData.push({
              note,
              links: activeLinks
            });
          }
        }
      }
      
      setAllShareLinks(linksData);
    } catch (error) {
      console.error('Error loading share links:', error);
      toast.error('Failed to load share links');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRevokeLink = async (noteId, shareToken) => {
    try {
      await notesService.revokeShareLink(noteId, shareToken);
      toast.success('Share link revoked');
      loadAllShareLinks(); // Refresh the list
    } catch (error) {
      console.error('Error revoking link:', error);
      toast.error('Failed to revoke share link');
    }
  };

  const handleCreateNewLink = async (noteId, noteTitle) => {
    try {
      const linkName = `${noteTitle} - ${new Date().toLocaleDateString()}`;
      await notesService.generateShareToken(noteId, linkName);
      toast.success('New share link created!');
      loadAllShareLinks(); // Refresh the list
    } catch (error) {
      console.error('Error creating new link:', error);
      toast.error('Failed to create new share link');
    }
  };

  const handleUpdateLinkName = async (noteId, shareToken, newName) => {
    try {
      await notesService.updateShareLinkName(noteId, shareToken, newName);
      toast.success('Link name updated');
      setEditingLink(null);
      setNewLinkName('');
      loadAllShareLinks(); // Refresh the list
    } catch (error) {
      console.error('Error updating link name:', error);
      toast.error('Failed to update link name');
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getTotalClicks = () => {
    return allShareLinks.reduce((total, noteData) => 
      total + noteData.links.reduce((linkTotal, link) => linkTotal + (link.clicks || 0), 0), 0
    );
  };

  const getTotalLinks = () => {
    return allShareLinks.reduce((total, noteData) => total + noteData.links.length, 0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Share className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Shared Links Manager</h2>
                  <p className="text-gray-400">Manage all your shared note links</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Close
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <ExternalLink className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{getTotalLinks()}</p>
                    <p className="text-sm text-gray-400">Active Links</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{getTotalClicks()}</p>
                    <p className="text-sm text-gray-400">Total Views</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{allShareLinks.length}</p>
                    <p className="text-sm text-gray-400">Shared Notes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : allShareLinks.length === 0 ? (
              <div className="text-center py-12">
                <Share className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No shared links yet</h3>
                <p className="text-gray-500">Start sharing your notes to see them here!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {allShareLinks.map((noteData) => (
                  <div key={noteData.note.$id} className="border border-gray-700 rounded-lg p-6 bg-gray-800/30">
                    {/* Note Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{noteData.note.emoji || '📝'}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{noteData.note.title}</h3>
                          <p className="text-sm text-gray-400">
                            {noteData.links.length} active link{noteData.links.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleCreateNewLink(noteData.note.$id, noteData.note.title)}
                        className="border-green-600 flex item-center text-green-400 hover:bg-green-600/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Link
                      </Button>
                    </div>

                    {/* Share Links */}
                    <div className="space-y-3">
                      {noteData.links.map((link) => (
                        <div key={link.token} className="border border-gray-600 rounded-lg p-4 bg-gray-900/50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {editingLink === link.token ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={newLinkName}
                                    onChange={(e) => setNewLinkName(e.target.value)}
                                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white flex-1"
                                    placeholder="Enter link name"
                                    autoFocus
                                  />
                                  <Button
                                    onClick={() => handleUpdateLinkName(noteData.note.$id, link.token, newLinkName)}
                                    className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingLink(null);
                                      setNewLinkName('');
                                    }}
                                    className="border-gray-600 text-gray-300 px-3 py-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-white">{link.name}</p>
                                    <Button
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingLink(link.token);
                                        setNewLinkName(link.name);
                                      }}
                                      className="text-gray-400 hover:text-white p-1"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Created {formatDate(link.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Expires {formatDate(link.expiresAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Eye className="h-3 w-3" />
                                      <span>{link.clicks || 0} views</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {editingLink !== link.token && (
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  onClick={() => handleCopyLink(link.shareUrl)}
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(link.shareUrl, '_blank')}
                                  className="border-green-600 text-green-400 hover:bg-green-600/10"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleRevokeLink(noteData.note.$id, link.token)}
                                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SharedLinksManager;
