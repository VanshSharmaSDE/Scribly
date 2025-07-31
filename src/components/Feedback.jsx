import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Lightbulb, Bug, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';

const Feedback = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'blue' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'yellow' },
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
    { id: 'compliment', label: 'Compliment', icon: Heart, color: 'pink' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSubmitting(true);

    try {
      // Here you would typically send to your backend or email service
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create feedback data
      const feedbackData = {
        type: feedbackType,
        message: message.trim(),
        email: email.trim(),
        userId: user?.$id || null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Show success message
      toast.success('Thank you for your feedback! We\'ll get back to you soon.', {
        duration: 4000,
        icon: '🙏'
      });

      // Reset form
      setFeedbackType('general');
      setMessage('');
      setEmail(user?.email || '');
      
      // Close modal
      onClose();

    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Share Your Feedback
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                What type of feedback would you like to share?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = feedbackType === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`p-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 text-sm ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="feedback-email" className="text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="feedback-message" className="text-sm font-medium text-gray-300">
                Your Feedback
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  feedbackType === 'bug' 
                    ? 'Please describe the bug you encountered, including steps to reproduce it...'
                    : feedbackType === 'feature'
                    ? 'Tell us about the feature you\'d like to see...'
                    : feedbackType === 'compliment'
                    ? 'We\'d love to hear what you enjoy about Scribly...'
                    : 'Share your thoughts, suggestions, or experiences...'
                }
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Feedback</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              Your feedback helps us improve Scribly. We read every message and appreciate your input! 💙
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Feedback;
