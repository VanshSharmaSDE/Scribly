import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  isLoading = false 
}) => {
  const typeStyles = {
    danger: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      borderColor: 'border-red-500/20'
    },
    warning: {
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
      borderColor: 'border-yellow-500/20'
    },
    info: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      borderColor: 'border-blue-500/20'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`bg-gray-900/95 backdrop-blur-xl border ${currentStyle.borderColor} rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 ${currentStyle.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <AlertTriangle className={`h-6 w-6 ${currentStyle.iconColor}`} />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border-gray-600"
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                
                <Button
                  onClick={onConfirm}
                  loading={isLoading}
                  disabled={isLoading}
                  className={`flex-1 ${currentStyle.confirmBg} text-white border-0`}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
