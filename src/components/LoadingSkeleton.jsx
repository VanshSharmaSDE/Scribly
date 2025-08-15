import { motion } from 'framer-motion';

const LoadingSkeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-gray-600/50 rounded',
    card: 'h-48 bg-gray-600/50 rounded-lg',
    text: 'h-3 bg-gray-600/50 rounded',
    title: 'h-6 bg-gray-600/50 rounded',
    avatar: 'h-12 w-12 bg-gray-600/50 rounded-full',
    button: 'h-10 bg-gray-600/50 rounded-lg'
  };

  // Task item skeleton - matches the real task UI structure
  if (variant === 'taskItem') {
    return (
      <motion.div
        className="p-4 rounded-xl border border-gray-600/30 bg-gray-800/30"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 bg-gray-600/50 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-600/50 rounded w-3/4" />
          </div>
          <div className="w-16 h-6 bg-gray-600/50 rounded-full" />
        </div>
      </motion.div>
    );
  }

  // Plan header skeleton - matches the plan header structure
  if (variant === 'planHeader') {
    return (
      <motion.div
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-600/50 rounded mr-3" />
            <div className="w-48 h-6 bg-gray-600/50 rounded" />
          </div>
          <div className="w-24 h-8 bg-gray-600/50 rounded-lg" />
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-600/50 rounded mr-2" />
          <div className="w-40 h-4 bg-gray-600/50 rounded" />
        </div>
      </motion.div>
    );
  }

  // Tasks section skeleton - matches the tasks container
  if (variant === 'tasksSection') {
    return (
      <motion.div
        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="flex items-center mb-6">
          <div className="w-5 h-5 bg-gray-600/50 rounded mr-2" />
          <div className="w-32 h-6 bg-gray-600/50 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-600/30 bg-gray-800/30">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-600/50 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-600/50 rounded w-3/4" />
                </div>
                <div className="w-16 h-6 bg-gray-600/50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="w-32 h-4 bg-gray-600/50 rounded" />
            <div className="w-20 h-4 bg-gray-600/50 rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`skeleton ${variants[variant]} ${className}`}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
    />
  );
};

export default LoadingSkeleton;

