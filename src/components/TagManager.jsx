import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, Hash, Sparkles } from 'lucide-react';
import Button from './Button';

const TagManager = ({ tags = [], onTagsChange, noteTitle = '', noteContent = '', onGenerateAITags, isGeneratingTags = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [currentTags, setCurrentTags] = useState(tags);

  // Sync internal state with props when tags change from parent
  useEffect(() => {

    setCurrentTags(tags);
  }, [tags]);

  // Debug current tags
  useEffect(() => {

  }, [currentTags]);

  const predefinedTags = [
    'work', 'personal', 'ideas', 'projects', 'meetings', 'notes',
    'learning', 'development', 'design', 'research', 'important',
    'todo', 'archive', 'draft', 'review'
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim().toLowerCase())) {
      const updatedTags = [...currentTags, newTag.trim().toLowerCase()];
      setCurrentTags(updatedTags);
      onTagsChange?.(updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setCurrentTags(updatedTags);
    onTagsChange?.(updatedTags);
  };

  const handleAddPredefinedTag = (tag) => {
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      setCurrentTags(updatedTags);
      onTagsChange?.(updatedTags);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Tags</label>
          {onGenerateAITags && (
            <Button
              onClick={onGenerateAITags}
              size="sm"
              disabled={isGeneratingTags || (!noteTitle.trim() && !noteContent.trim())}
              className="bg-gradient-to-r items-center flex from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTags ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Tags
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Current Tags Display */}
        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/5 border border-white/20 rounded-lg">
          {currentTags && currentTags.length > 0 ? (
            currentTags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: 'rgba(79, 112, 226, 0.2)',
                  color: '#4F70E2'
                }}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-red-400 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))
          ) : (
            <span className="text-gray-500 text-xs italic"></span>
          )}
          
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center px-2 py-1 text-xs rounded-full border border-dashed border-white/30 text-gray-400 hover:text-white hover:border-white/50 transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </button>
        </div>
      </div>

      {/* Tag Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Manage Tags</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Add New Tag */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Create New Tag</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Enter tag name..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Predefined Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Quick Add</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {predefinedTags.filter(tag => !currentTags.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddPredefinedTag(tag)}
                      className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Tags */}
              {currentTags.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Current Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'rgba(79, 112, 226, 0.2)',
                          color: '#4F70E2'
                        }}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TagManager;

