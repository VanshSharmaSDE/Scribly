import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  leftIcon,
  rightIcon,
  onRightIconClick,
  ...props 
}, ref) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300 z-10">
            {React.createElement(leftIcon, { className: "h-5 w-5" })}
          </div>
        )}
        <motion.input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-4 bg-gray-900/60 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl
            text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70
            transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/60
            ${leftIcon ? 'pl-12' : 'pl-4'}
            ${rightIcon ? 'pr-12' : 'pr-4'}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
          `}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300 z-10 p-1 rounded-lg hover:bg-gray-700/50"
          >
            {React.createElement(rightIcon, { className: "h-5 w-5" })}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm flex items-center space-x-1"
        >
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

