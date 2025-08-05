import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const EmojiPicker = ({ selectedEmoji, onEmojiSelect, size = 'lg' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const emojiOptions = [
    '📝', '📄', '📋', '📌', '📚', '📖', '📑', '📊', '📈', '📉',
    '💡', '🔥', '⭐', '🎯', '🎨', '🎭', '🎪', '🎵', '🎶', '🎸',
    '💼', '💻', '💾', '🖥️', '📱', '⌚', '📷', '📹', '🎬', '📺',
    '🌟', '🌙', '☀️', '⛅', '🌈', '🔮', '💎', '🏆', '🎁', '🎂',
    '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💕',
    '🚀', '✈️', '🚗', '🏠', '🏢', '🏫', '🏥', '🏦', '🗽', '🎪',
    '🔥', '💧', '🌱', '🌳', '🌺', '🌻', '🌼', '🌷', '🌹', '🌴',
    '🍎', '🍕', '🍔', '🍟', '🍗', '🍰', '🎂', '🍫', '☕', '🥤',
    '⚡', '💫', '✨', '🌟', '💥', '🔔', '🎉', '🎊', '🎈', '🎀'
  ];

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <span>{selectedEmoji}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Emoji Grid */}
          <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg p-4 z-50 shadow-xl min-w-[280px] max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {emojiOptions.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className={`text-xl p-2 rounded hover:bg-gray-700 transition-colors ${
                    selectedEmoji === emoji ? 'bg-blue-600 hover:bg-blue-600' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;
