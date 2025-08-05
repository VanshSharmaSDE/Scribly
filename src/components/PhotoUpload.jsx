import React, { useState, useRef } from "react";
import {
  Upload,
  Image,
  FileText,
  Wand2,
  Loader2,
  X,
  Camera,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

const PhotoUpload = ({ onTextExtracted, onClose, isProcessing = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, BMP, WebP)");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size too large. Please upload an image smaller than 10MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleProcessImage = () => {
    if (selectedFile && onTextExtracted) {
      onTextExtracted(selectedFile);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg mb-3">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Extract Text from Image 
                <span className="px-2 py-1 ml-2 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-medium">
                BETA
              </span>
              </h2>
              <p className="text-gray-400 text-sm">
                Upload an image to extract text and create a note
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="p-2"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              dragActive
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-800 rounded-full">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop an image here or click to browse
                </h3>
                <p className="text-gray-400 text-sm">
                  Supports JPEG, PNG, GIF, BMP, WebP up to 10MB
                </p>
              </div>

              <Button variant="outline" size="sm" className="flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg bg-gray-800"
              />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all duration-200"
                disabled={isProcessing}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* File Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleProcessImage}
                disabled={isProcessing}
                className="flex items-center justify-center flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Extract Text & Create Note
                  </>
                )}
              </Button>

              <Button
                onClick={clearSelection}
                variant="outline"
                disabled={isProcessing}
              >
                Change Image
              </Button>
            </div>

            {/* Processing Status */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <div>
                      <p className="text-blue-300 font-medium">
                        Processing your image...
                      </p>
                      <p className="text-blue-400 text-sm">
                        Extracting text and adding to your note
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Tips for better results
          </h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Use images with clear, readable text</li>
            <li>• Ensure good lighting and contrast</li>
            <li>• Avoid blurry or rotated images</li>
            <li>• Text should be horizontal for best results</li>
            <li>• Supports handwritten and printed text</li>
            <li>• Works with documents, screenshots, photos, and more</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default PhotoUpload;
