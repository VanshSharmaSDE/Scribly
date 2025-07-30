import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    primary: 'text-white border-transparent shadow-lg',
    secondary: 'bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white border-white/20 hover:border-white/40',
    outline: 'bg-transparent hover:bg-white/10 border-2 hover:text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-white border-transparent'
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-sm font-medium',
    md: 'px-6 py-3.5 text-base font-medium',
    lg: 'px-8 py-4 text-lg font-semibold'
  };

  return (
    <motion.button
      ref={ref}
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        btn-glow focus:outline-none focus:ring-2 focus:ring-premium-blue-light focus:ring-offset-2 focus:ring-offset-scribly-black
        disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
