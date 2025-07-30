import { motion } from 'framer-motion';

const ProfessionalBackground = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Ultra Dark Professional Background */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            radial-gradient(circle at 10% 90%, rgba(79, 112, 226, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 10%, rgba(79, 112, 226, 0.06) 0%, transparent 40%),
            linear-gradient(135deg, 
              rgba(5, 5, 8, 1) 0%, 
              rgba(8, 10, 15, 1) 25%, 
              rgba(12, 15, 22, 1) 50%, 
              rgba(15, 20, 30, 1) 75%, 
              rgba(20, 25, 40, 1) 100%
            )
          `
        }} 
      />
      
      {/* Dark overlay for professional depth */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/30 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent" />
      </div>
      
      {/* Minimal animated glow effects for subtle depth */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(79, 112, 226, 0.04)' }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(79, 112, 226, 0.03)' }}
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.25, 0.15, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ProfessionalBackground;
