import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  Eye, 
  Image, 
  Video, 
  Music, 
  FileText, 
  File,
  X,
  ExternalLink,
  Edit3,
  Settings
} from 'lucide-react';
import assetService from '../services/assetService';
import AssetEditor from './AssetEditor';
import ConfirmationModal from './ConfirmationModal';
import toast from 'react-hot-toast';

const AssetDisplay = ({ assets, onAssetDelete, onAssetUpdate, readOnly = false, sessionKey }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;
    
    console.log('Attempting to delete asset:', assetToDelete);
    console.log('Asset properties:', {
      id: assetToDelete.$id,
      fileId: assetToDelete.fileId,
      fileName: assetToDelete.fileName,
      isTemporary: assetToDelete.isTemporary,
      sessionKey: sessionKey
    });
    
    setIsDeleting(true);
    try {
      // Optimistic UI update - remove from local state immediately
      if (onAssetDelete) {
        onAssetDelete(assetToDelete.$id || assetToDelete.fileId);
      }
      
      // Handle temporary vs permanent asset deletion
      if (assetToDelete.isTemporary) {
        // For temporary assets, remove from temporary storage and delete from bucket
        if (sessionKey) {
          await assetService.removeTemporaryAsset(sessionKey, assetToDelete.fileId);
          toast.success('Temporary asset removed');
        } else {
          throw new Error('Session key required for temporary asset deletion');
        }
      } else {
        // For permanent assets, delete from database and storage
        if (!assetToDelete.$id || !assetToDelete.fileId) {
          throw new Error('Asset ID and File ID are required for permanent asset deletion');
        }
        await assetService.deleteAsset(assetToDelete.$id, assetToDelete.fileId);
        toast.success(`${assetToDelete.fileName} deleted successfully`);
      }
      
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error(`Failed to delete asset: ${error.message}`);
      
      // If deletion failed, add the asset back to UI (rollback optimistic update)
      // Note: This would require a way to restore the asset, which depends on your state management
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setAssetToDelete(null);
    }
  };

  const cancelDeleteAsset = () => {
    setShowDeleteConfirm(false);
    setAssetToDelete(null);
  };

  const openPreview = (asset) => {
    setSelectedAsset(asset);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedAsset(null);
  };

  const openEditor = (asset) => {
    setEditingAsset(asset);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingAsset(null);
  };

  const handleAssetUpdate = (assetId, updatedAsset) => {
    if (onAssetUpdate) {
      onAssetUpdate(assetId, updatedAsset);
    }
  };

  const renderStyledAsset = (asset) => {
    // Get display settings from the asset's database record
    const settings = assetService.getDisplaySettings(asset);
    const {
      dimensions = { width: 300, height: 200 },
      position = { x: 0, y: 0 },
      rotation = 0,
      borderRadius = 0,
      opacity = 100
    } = settings;

    const style = {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
      opacity: opacity / 100,
      borderRadius: `${borderRadius}px`,
      transition: 'all 0.3s ease'
    };

    const content = () => {
      switch (asset.fileType) {
        case 'image':
          return (
            <img
              src={asset.url}
              alt={asset.fileName}
              className="w-full h-full object-cover"
              style={{ borderRadius: `${borderRadius}px` }}
            />
          );
        case 'video':
          return (
            <video
              src={asset.url}
              controls
              className="w-full h-full object-cover"
              style={{ borderRadius: `${borderRadius}px` }}
            />
          );
        default:
          return (
            <div 
              className="w-full h-full bg-gray-700 border border-gray-600 flex items-center justify-center"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{assetService.getFileIcon(asset.fileType)}</div>
                <p className="text-gray-300 text-xs">{asset.fileName}</p>
              </div>
            </div>
          );
      }
    };

    return (
      <div style={style} className="relative">
        {content()}
      </div>
    );
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const renderAssetPreview = (asset) => {
    if (!asset) return null;

    switch (asset.fileType) {
      case 'image':
        return (
          <img 
            src={asset.url} 
            alt={asset.fileName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        );
      
      case 'video':
        return (
          <video 
            src={asset.url} 
            controls
            className="max-w-full max-h-[70vh] rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      
      case 'audio':
        return (
          <div className="p-8">
            <div className="text-center mb-4">
              <Music className="w-16 h-16 mx-auto text-blue-400 mb-2" />
              <h3 className="text-white font-medium">{asset.fileName}</h3>
            </div>
            <audio 
              src={asset.url} 
              controls
              className="w-full"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'pdf':
        return (
          <iframe
            src={asset.url}
            className="w-full h-[70vh] rounded-lg"
            title={asset.fileName}
          />
        );
      
      default:
        return (
          <div className="p-8 text-center">
            <File className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-white font-medium mb-2">{asset.fileName}</h3>
            <p className="text-gray-400 mb-4">Preview not available</p>
            <a 
              href={assetService.getDownloadUrl(asset.fileId)}
              download={asset.fileName}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
          </div>
        );
    }
  };

  if (!assets || assets.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Attachments ({assets.length})</h4>
        
        {/* Styled Assets Section */}
        {assets.some(asset => asset.editorSettings) && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h5 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Styled Assets</h5>
            <div className="space-y-4">
              {assets
                .filter(asset => asset.isStyled && asset.displaySettings)
                .map((asset) => (
                  <motion.div
                    key={asset.$id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center p-4 bg-gray-900/50 rounded-lg min-h-[200px] relative overflow-hidden"
                  >
                    {renderStyledAsset(asset)}
                    
                    {/* Asset Actions Overlay */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openPreview(asset)}
                        className="p-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs"
                        title="View"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => openEditor(asset)}
                            className="p-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            className="p-1 bg-red-500/50 hover:bg-red-500/70 text-white rounded text-xs"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      
                      <a
                        href={assetService.getDownloadUrl(asset.fileId)}
                        download={asset.fileName}
                        className="p-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
        
        {/* Regular Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assets
            .filter(asset => !asset.isStyled || !asset.displaySettings)
            .map((asset) => (
            <motion.div
              key={asset.$id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="text-blue-400">
                    {getFileIcon(asset.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {asset.fileName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {assetService.formatFileSize(asset.fileSize)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openPreview(asset)}
                  className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
                
                {!readOnly && (
                  <button
                    onClick={() => openEditor(asset)}
                    className="flex items-center justify-center px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs rounded transition-colors"
                    title="Edit & Replace"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
                
                <a
                  href={assetService.getDownloadUrl(asset.fileId)}
                  download={asset.fileName}
                  className="flex items-center justify-center px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                </a>

                {!readOnly && (
                  <button
                    onClick={() => handleDeleteAsset(asset)}
                    className="flex items-center justify-center px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Thumbnail for images */}
              {asset.fileType === 'image' && (
                <div className="mt-2">
                  <img
                    src={asset.url}
                    alt={asset.fileName}
                    className="w-full h-20 object-cover rounded cursor-pointer"
                    onClick={() => openPreview(asset)}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedAsset && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl max-w-4xl max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="text-blue-400">
                  {getFileIcon(selectedAsset.fileType)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedAsset.fileName}</h3>
                  <p className="text-gray-400 text-sm">
                    {assetService.formatFileSize(selectedAsset.fileSize)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <a
                  href={assetService.getDownloadUrl(selectedAsset.fileId)}
                  download={selectedAsset.fileName}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <Download className="w-5 h-5" />
                </a>
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {renderAssetPreview(selectedAsset)}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Asset Editor Modal */}
      <AssetEditor
        asset={editingAsset}
        isOpen={showEditor}
        onClose={closeEditor}
        onAssetUpdate={handleAssetUpdate}
        sessionKey={sessionKey}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={cancelDeleteAsset}
        onConfirm={confirmDeleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to delete "${assetToDelete?.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
};

export default AssetDisplay;
