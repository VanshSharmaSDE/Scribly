// Markdown parsing utilities
export const parseMarkdown = (text) => {
  if (!text) return '';
  
  // Simple markdown parsing for common elements
  let html = text
    // Headers (now with proper hierarchy and consistent styling)
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mb-3 mt-6">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-8">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>')
    
    // Code blocks (using standard dark theme colors)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto border border-gray-700"><code class="text-green-400 text-sm">$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400 text-sm border border-gray-700">$1</code>')
    
    // Lists (with better spacing and styling)
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc list-inside text-gray-300 mb-1">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal list-inside text-gray-300 mb-1">$1</li>')
    
    // Checkboxes (using standard colors)
    .replace(/^\- \[x\] (.*$)/gim, '<div class="flex items-center mb-2"><input type="checkbox" checked disabled class="mr-2 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"> <span class="line-through text-gray-500">$1</span></div>')
    .replace(/^\- \[ \] (.*$)/gim, '<div class="flex items-center mb-2"><input type="checkbox" disabled class="mr-2 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"> <span class="text-gray-300">$1</span></div>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="border-gray-600 my-4">')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-800/50 text-gray-300 italic">$1</blockquote>')
    
    // Line breaks
    .replace(/\n/g, '<br>');
    
  return html;
};

// Extract plain text from markdown
export const extractPlainText = (markdown) => {
  if (!markdown) return '';
  
  return markdown
    .replace(/[#*`\-\[\]]/g, '')
    .replace(/\n/g, ' ')
    .trim();
};

// Word count
export const getWordCount = (text) => {
  if (!text) return 0;
  return extractPlainText(text).split(/\s+/).filter(word => word.length > 0).length;
};

// Reading time estimation (average 200 words per minute)
export const getReadingTime = (text) => {
  const wordCount = getWordCount(text);
  const minutes = Math.ceil(wordCount / 200);
  return minutes;
};
