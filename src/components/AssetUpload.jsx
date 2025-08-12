import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Paperclip, Image, Video, Music, FileText } from 'lucide-react';
import assetService from '../services/assetService';
import toast from 'react-hot-toast';

const AssetUpload = ({ noteId, isTemporary = false, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = async (files) => {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const uploadItems = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...uploadItems]);

    // Upload files one by one
    for (const uploadItem of uploadItems) {
      try {
        // Update progress to show start
        setUploadingFiles(prev => prev.map(item => 
          item.id === uploadItem.id ? { ...item, progress: 10 } : item
        ));

        const asset = await assetService.uploadAsset({
          file: uploadItem.file,
          noteId,
          isTemporary
        });

        // Update progress to show completion
        setUploadingFiles(prev => prev.map(item => 
          item.id === uploadItem.id ? { ...item, progress: 100, status: 'completed' } : item
        ));

        // Remove from uploading after a brief delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(item => item.id !== uploadItem.id));
        }, 1000);
        
        if (onUploadSuccess) {
          onUploadSuccess(asset);
        }

        toast.success(`${uploadItem.file.name} uploaded successfully!`);
      } catch (error) {
        console.error('Upload failed:', error);
        
        // Update status to error
        setUploadingFiles(prev => prev.map(item => 
          item.id === uploadItem.id ? { ...item, status: 'error', progress: 0 } : item
        ));
        
        // Remove error items after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(item => item.id !== uploadItem.id));
        }, 3000);

        toast.error(`Failed to upload ${uploadItem.file.name}: ${error.message}`);
      }
    }
  };

  const getFileIcon = (file) => {
    const type = assetService.getFileType(file.type);
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio': return <Music className="w-5 h-5 text-green-400" />;
      case 'pdf': 
      case 'document': return <FileText className="w-5 h-5 text-red-400" />;
      default: return <Paperclip className="w-5 h-5 text-gray-400" />;
    }
  };

  const removeUploadingFile = (id) => {
    setUploadingFiles(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/20'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-300 mb-2">
          Drag & drop files here, or{' '}
          <span className="text-blue-400 hover:text-blue-300 underline">
            click anywhere to browse
          </span>
        </p>
        <p className="text-gray-500 text-sm">
          Support for images, videos, audio, PDFs, and documents (max 50MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.7z"
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Uploading...</h4>
          {uploadingFiles.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(item.file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.file.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {assetService.formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeUploadingFile(item.id)}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      item.status === 'error' 
                        ? 'bg-red-500' 
                        : item.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                {item.status === 'error' && (
                  <p className="text-red-400 text-xs mt-1">Upload failed</p>
                )}
                {item.status === 'completed' && (
                  <p className="text-green-400 text-xs mt-1">Upload completed</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetUpload;
