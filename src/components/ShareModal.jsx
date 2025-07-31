import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Share, Copy, X, ExternalLink } from 'lucide-react';
import Button from './Button';
import notesService from '../services/notesService';

const ShareModal = ({ isOpen, onClose, note, onShareUpdate }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await notesService.generateShareToken(note.$id);
      
      onShareUpdate({
        isShared: true,
        sharedAt: new Date().toISOString(),
        shareLinks: result.shareLinks
      });
      
      await navigator.clipboard.writeText(result.shareUrl);
      
      toast.success('New share link created and copied to clipboard!', {
        duration: 3000,
      });
      
    } catch (error) {

      toast.error('Failed to create share link');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      await notesService.revokeSharing(note.$id);
      onShareUpdate({
        shareToken: null,
        isShared: false,
        sharedAt: null
      });
      
      toast.success('Sharing has been revoked', {
        duration: 3000,
      });
      
    } catch (error) {

      toast.error('Failed to revoke sharing');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      let shareUrl = '';
      
      // Check for new shareLinks format first
      if (note.shareLinks && Array.isArray(note.shareLinks) && note.shareLinks.length > 0) {
        // Parse the latest share link from the array
        const latestLinkStr = note.shareLinks[note.shareLinks.length - 1];
        try {
          const latestLink = typeof latestLinkStr === 'string' ? JSON.parse(latestLinkStr) : latestLinkStr;
          if (latestLink && latestLink.token && latestLink.isActive) {
            shareUrl = `${window.location.origin}/shared/${latestLink.token}`;
          }
        } catch (e) {

        }
      }
      
      // Fallback to legacy shareToken format
      if (!shareUrl && note.shareToken) {
        shareUrl = `${window.location.origin}/shared/${note.shareToken}`;
      }
      
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied!', {
          duration: 2000,
        });
      } else {
        toast.error('No active share link found');
      }
    } catch (error) {

      toast.error('Failed to copy link');
    }
  };

  const handleOpenSharedLink = () => {
    try {
      let shareUrl = '';
      
      // Check for new shareLinks format first
      if (note.shareLinks && Array.isArray(note.shareLinks) && note.shareLinks.length > 0) {
        // Parse the latest share link from the array
        const latestLinkStr = note.shareLinks[note.shareLinks.length - 1];
        try {
          const latestLink = typeof latestLinkStr === 'string' ? JSON.parse(latestLinkStr) : latestLinkStr;
          if (latestLink && latestLink.token && latestLink.isActive) {
            shareUrl = `${window.location.origin}/shared/${latestLink.token}`;
          }
        } catch (e) {

        }
      }
      
      // Fallback to legacy shareToken format
      if (!shareUrl && note.shareToken) {
        shareUrl = `${window.location.origin}/shared/${note.shareToken}`;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      } else {
        toast.error('No active share link found');
      }
    } catch (error) {

      toast.error('Failed to open link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Share className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Share Note</h3>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-300">
            <strong>{note.title}</strong>
          </div>

          {note.isShared ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-300 mb-2">
                  <Share className="h-4 w-4" />
                  <span className="font-medium">Note is publicly shared</span>
                </div>
                <p className="text-sm text-green-200/80">
                  Anyone with the link can view and download this note, even without logging in.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleCopyLink}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white border-0"
                >
                  Copy Link
                </Button>
                <Button
                  onClick={handleOpenSharedLink}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleRevoke}
                disabled={isRevoking}
                variant="outline"
                className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
              >
                {isRevoking ? (
                  <>
                    Revoking...
                  </>
                ) : (
                  'Revoke Sharing'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-3">
                  Create a public link that anyone can use to view and download this note.
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• No login required for viewers</li>
                  <li>• Link expires in 30 days</li>
                  <li>• Can be revoked anytime</li>
                  <li>• Viewers can download the note</li>
                </ul>
              </div>

              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0"
              >
                {isSharing ? (
                  <>
                    Creating Share Link...
                  </>
                ) : (
                  <>
                    Create Share Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;

