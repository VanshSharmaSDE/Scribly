import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Save, X } from 'lucide-react';
import Button from './Button';

const UnsavedChangesModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDiscard, 
  isSaving = false 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Unsaved Changes
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed">
              You have unsaved changes to your note. Would you like to save your changes before leaving?
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Primary action button */}
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px] text-sm"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="truncate">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Save & Leave</span>
                </>
              )}
            </Button>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onDiscard}
                disabled={isSaving}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2.5 rounded-lg font-medium transition-all duration-200 min-h-[44px] text-sm"
              >
                <span className="truncate">Discard</span>
              </Button>

              <Button
                onClick={onClose}
                disabled={isSaving}
                className="bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium transition-all duration-200 min-h-[44px] text-sm"
              >
                <span className="truncate">Cancel</span>
              </Button>
            </div>
          </div>

          {/* Warning note */}
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Your changes will be lost if you leave without saving.</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnsavedChangesModal;
