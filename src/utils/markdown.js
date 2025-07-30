// Markdown parsing utilities
export const parseMarkdown = (text) => {
  if (!text) return '';
  
  // Simple markdown parsing for common elements
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-scribly-black p-4 rounded-lg my-4 overflow-x-auto"><code class="text-green-400">$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-scribly-black px-2 py-1 rounded text-green-400">$1</code>')
    
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc list-inside text-gray-300">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal list-inside text-gray-300">$1</li>')
    
    // Checkboxes
    .replace(/^\- \[x\] (.*$)/gim, '<div class="flex items-center mb-2"><input type="checkbox" checked disabled class="mr-2 text-scribly-red bg-scribly-gray border-scribly-gray-light rounded"> <span class="line-through text-gray-500">$1</span></div>')
    .replace(/^\- \[ \] (.*$)/gim, '<div class="flex items-center mb-2"><input type="checkbox" disabled class="mr-2 text-scribly-red bg-scribly-gray border-scribly-gray-light rounded"> <span class="text-gray-300">$1</span></div>')
    
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
