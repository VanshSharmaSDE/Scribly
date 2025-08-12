import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, 
  Move, 
  Square, 
  Circle, 
  Maximize2, 
  RefreshCw, 
  Upload, 
  Check, 
  X,
  CornerDownRight,
  Crop
} from 'lucide-react';
import assetService from '../services/assetService';
import toast from 'react-hot-toast';

const AssetEditor = ({ asset, isOpen, onClose, onAssetUpdate, sessionKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 300,
    height: 200,
    aspectRatio: 'auto'
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [isReplacing, setIsReplacing] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'move', 'resize-corner', 'resize-edge'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const assetRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize dimensions based on asset type and existing settings
  useEffect(() => {
    if (asset && isOpen) {
      // Load existing settings if available
      const existingSettings = assetService.getDisplaySettings(asset);
      
      setDimensions(existingSettings.dimensions);
      setPosition(existingSettings.position);
      setRotation(existingSettings.rotation);
      setBorderRadius(existingSettings.borderRadius);
      setOpacity(existingSettings.opacity);
    }
  }, [asset, isOpen]);

  const handleMouseDown = (e, mode) => {
    e.preventDefault();
    setDragMode(mode);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (mode === 'move' ? position.x : 0),
      y: e.clientY - (mode === 'move' ? position.y : 0)
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragMode) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (dragMode === 'move') {
      setPosition({ x: deltaX, y: deltaY });
    } else if (dragMode === 'resize-corner') {
      const newWidth = Math.max(50, dimensions.width + deltaX - position.x);
      const newHeight = Math.max(50, dimensions.height + deltaY - position.y);
      
      if (dimensions.aspectRatio === '16:9') {
        const aspectHeight = (newWidth * 9) / 16;
        setDimensions(prev => ({ ...prev, width: newWidth, height: aspectHeight }));
      } else if (dimensions.aspectRatio === '1:1') {
        const size = Math.min(newWidth, newHeight);
        setDimensions(prev => ({ ...prev, width: size, height: size }));
      } else {
        setDimensions(prev => ({ ...prev, width: newWidth, height: newHeight }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragMode, dragStart, position, dimensions]);

  const handleReplace = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const file = files[0];
    setIsReplacing(true);

    try {
      // Delete old asset
      await assetService.deleteAsset(asset.$id, asset.fileId);
      
      // Upload new asset
      const newAsset = await assetService.uploadAsset({
        file,
        noteId: asset.noteId
      });

      if (onAssetUpdate) {
        onAssetUpdate(asset.$id, newAsset);
      }

      toast.success(`Asset replaced with ${file.name}`);
      onClose();
    } catch (error) {
      console.error('Error replacing asset:', error);
      toast.error('Failed to replace asset');
    } finally {
      setIsReplacing(false);
      e.target.value = ''; // Reset input
    }
  };

  const applyChanges = async () => {
    try {
      console.log('Asset object:', asset);
      console.log('Asset ID for update:', asset.$id);
      console.log('Asset is temporary:', asset.isTemporary);
      console.log('Asset fileId:', asset.fileId);

      const displaySettings = {
        dimensions,
        position,
        rotation,
        borderRadius,
        opacity,
        transform: { scaleX: 1, scaleY: 1 }
      };

      console.log('Saving display settings:', displaySettings);

      let updatedAsset;

      if (asset.isTemporary) {
        // Handle temporary asset
        if (!sessionKey) {
          toast.error('Session key required for temporary assets');
          return;
        }
        updatedAsset = await assetService.updateTemporaryAssetSettings(
          sessionKey,
          asset.fileId,
          displaySettings
        );
        toast.success('Asset styling saved! Will be applied when note is saved.');
      } else if (asset.$id) {
        // Handle permanent asset
        updatedAsset = await assetService.updateAssetSettings(asset.$id, displaySettings);
        toast.success('Asset styling saved permanently!');
      } else {
        toast.error('Cannot save styling - asset ID not found');
        return;
      }
      
      if (onAssetUpdate) {
        onAssetUpdate(asset.$id || asset.fileId, updatedAsset);
      }
      
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error saving asset settings:', error);
      if (error.message?.includes('Missing required parameter')) {
        toast.error('Cannot save styling - asset not found in database');
      } else if (error.message?.includes('Temporary asset not found')) {
        toast.error('Temporary asset not found - please try again');
      } else {
        toast.error('Failed to save asset styling');
      }
    }
  };

  const resetChanges = async () => {
    try {
      console.log('Resetting asset:', asset);
      console.log('Asset is temporary:', asset.isTemporary);
      console.log('Asset ID:', asset.$id);
      console.log('Asset fileId:', asset.fileId);

      let resetAsset;

      if (asset.isTemporary) {
        // Handle temporary asset
        if (!sessionKey) {
          toast.error('Session key required for temporary assets');
          return;
        }
        resetAsset = assetService.resetTemporaryAssetStyling(sessionKey, asset.fileId);
        toast.success('Temporary asset styling reset!');
      } else if (asset.$id) {
        // Handle permanent asset
        resetAsset = await assetService.resetAssetStyling(asset.$id);
        toast.success('Asset styling reset to default!');
      } else {
        toast.error('Cannot reset styling - asset ID not found');
        return;
      }
      
      // Reset local state to defaults
      const defaultSettings = assetService.getDisplaySettings({ 
        ...asset, 
        displaySettings: null, 
        tempDisplaySettings: null 
      });
      setDimensions(defaultSettings.dimensions);
      setPosition(defaultSettings.position);
      setRotation(defaultSettings.rotation);
      setBorderRadius(defaultSettings.borderRadius);
      setOpacity(defaultSettings.opacity);
      
      if (onAssetUpdate) {
        const updateKey = asset.$id || asset.fileId;
        onAssetUpdate(updateKey, { 
          ...asset, 
          isStyled: false, 
          displaySettings: null,
          tempDisplaySettings: null 
        });
      }
      
    } catch (error) {
      console.error('Error resetting asset styling:', error);
      if (error.message?.includes('Missing required parameter')) {
        toast.error('Cannot reset styling - asset not found in database');
      } else if (error.message?.includes('Temporary asset not found')) {
        toast.error('Temporary asset not found - please try again');
      } else {
        toast.error('Failed to reset asset styling');
      }
    }
  };

  const presetShapes = [
    { name: 'Rectangle', borderRadius: 0, aspectRatio: 'auto' },
    { name: 'Rounded', borderRadius: 12, aspectRatio: 'auto' },
    { name: 'Circle', borderRadius: 50, aspectRatio: '1:1' },
    { name: '16:9', borderRadius: 8, aspectRatio: '16:9' },
    { name: 'Square', borderRadius: 4, aspectRatio: '1:1' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl max-w-6xl w-full h-[90vh] flex overflow-hidden"
        >
          {/* Controls Panel */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Asset Editor</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Asset Info */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Current Asset</h4>
              <p className="text-white text-sm truncate">{asset?.fileName}</p>
              <p className="text-gray-400 text-xs">
                {asset?.fileType} • {assetService.formatFileSize(asset?.fileSize)}
              </p>
            </div>

            {/* Replace Asset */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Replace Asset</h4>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleReplace}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isReplacing}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isReplacing ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Replacing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Replace File</span>
                  </>
                )}
              </button>
            </div>

            {/* Edit Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Crop className="w-4 h-4" />
                <span>{isEditing ? 'Exit Edit Mode' : 'Edit Appearance'}</span>
              </button>
            </div>

            {/* Editing Controls */}
            {isEditing && (
              <>
                {/* Dimensions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Dimensions</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Width</label>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        value={dimensions.width}
                        onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{dimensions.width}px</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Height</label>
                      <input
                        type="range"
                        min="50"
                        max="600"
                        value={dimensions.height}
                        onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="w-full"
                        disabled={dimensions.aspectRatio !== 'auto'}
                      />
                      <span className="text-xs text-gray-400">{dimensions.height}px</span>
                    </div>
                  </div>
                </div>

                {/* Shape Presets */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Shape Presets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {presetShapes.map((shape) => (
                      <button
                        key={shape.name}
                        onClick={() => {
                          setBorderRadius(shape.borderRadius);
                          setDimensions(prev => ({ ...prev, aspectRatio: shape.aspectRatio }));
                          if (shape.aspectRatio === '1:1') {
                            const size = Math.min(prev.width, prev.height);
                            setDimensions(prev => ({ ...prev, width: size, height: size }));
                          } else if (shape.aspectRatio === '16:9') {
                            setDimensions(prev => ({ ...prev, height: (prev.width * 9) / 16 }));
                          }
                        }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
                      >
                        {shape.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Radius */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Border Radius</h4>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{borderRadius}px</span>
                </div>

                {/* Rotation */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Rotation</h4>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{rotation}°</span>
                </div>

                {/* Opacity */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Opacity</h4>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{opacity}%</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={applyChanges}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Changes</span>
                  </button>
                  <button
                    onClick={resetChanges}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-900 p-8 overflow-hidden">
            <div className="h-full flex items-center justify-center">
              <div
                ref={containerRef}
                className="relative bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 min-h-[400px] min-w-[500px]"
              >
                <h4 className="text-gray-400 text-sm mb-4 text-center">Preview Area</h4>
                
                {/* Asset Preview */}
                <div
                  ref={assetRef}
                  className={`relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
                  style={{
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                    opacity: opacity / 100,
                    borderRadius: `${borderRadius}px`,
                    transition: isDragging ? 'none' : 'all 0.2s ease',
                    margin: '50px auto'
                  }}
                  onMouseDown={(e) => isEditing && handleMouseDown(e, 'move')}
                >
                  {/* Asset Content */}
                  {asset?.fileType === 'image' ? (
                    <img
                      src={asset.url}
                      alt={asset.fileName}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: `${borderRadius}px` }}
                      draggable={false}
                    />
                  ) : asset?.fileType === 'video' ? (
                    <video
                      src={asset.url}
                      controls
                      className="w-full h-full object-cover"
                      style={{ borderRadius: `${borderRadius}px` }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full bg-gray-700 border border-gray-600 flex items-center justify-center"
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{assetService.getFileIcon(asset?.fileType)}</div>
                        <p className="text-gray-300 text-sm">{asset?.fileName}</p>
                      </div>
                    </div>
                  )}

                  {/* Resize Handles (only in edit mode) */}
                  {isEditing && (
                    <>
                      {/* Corner resize handle */}
                      <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'resize-corner')}
                      />
                      
                      {/* Move indicator */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        <Move className="w-3 h-3 inline mr-1" />
                        Drag to move
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssetEditor;
