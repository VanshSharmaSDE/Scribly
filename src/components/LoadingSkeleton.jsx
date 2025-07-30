import { motion } from 'framer-motion';

const LoadingSkeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-scribly-gray-light rounded',
    card: 'h-48 bg-scribly-gray-light rounded-lg',
    text: 'h-3 bg-scribly-gray-light rounded',
    title: 'h-6 bg-scribly-gray-light rounded',
    avatar: 'h-12 w-12 bg-scribly-gray-light rounded-full',
    button: 'h-10 bg-scribly-gray-light rounded-lg'
  };

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
