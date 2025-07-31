import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Search, MessageSquare, Brain, Share2, Download, Settings, Shield, Zap } from 'lucide-react';

const FAQModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All Questions', icon: MessageSquare },
    { id: 'general', label: 'General', icon: MessageSquare },
    { id: 'ai', label: 'AI Features', icon: Brain },
    { id: 'sharing', label: 'Sharing & Links', icon: Share2 },
    { id: 'export', label: 'Export & Download', icon: Download },
    { id: 'account', label: 'Account & Settings', icon: Settings },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
    { id: 'technical', label: 'Technical', icon: Zap }
  ];

  const faqs = [
    // General Questions
    { id: 1, category: 'general', question: 'What is Scribly?', answer: 'Scribly is an AI-powered note-taking platform that helps you create, organize, and share your thoughts with intelligent features like AI content generation, advanced sharing, and professional export capabilities.' },
    { id: 2, category: 'general', question: 'Is Scribly free to use?', answer: 'Scribly is currently in beta and free to use. We\'re focused on building the best possible experience before introducing any pricing plans.' },
    { id: 3, category: 'general', question: 'How do I get started with Scribly?', answer: 'Simply sign up for a free account, and you can immediately start creating notes. No setup required - just jump in and start writing!' },
    { id: 4, category: 'general', question: 'What makes Scribly different from other note-taking apps?', answer: 'Scribly combines AI-powered content generation, advanced sharing with analytics, professional export features, and a beautiful interface in one integrated platform.' },
    { id: 5, category: 'general', question: 'Can I use Scribly offline?', answer: 'Currently, Scribly requires an internet connection for full functionality, especially for AI features and syncing. Offline support is planned for future releases.' },
    { id: 6, category: 'general', question: 'Is there a mobile app?', answer: 'Scribly is currently a web application that works great on mobile browsers. Native mobile apps are in development and coming soon.' },
    { id: 7, category: 'general', question: 'How do I contact support?', answer: 'You can reach us through the contact form on our website, email us at scribly.server@gmail.com, or use the feedback feature within the app.' },

    // AI Features
    { id: 8, category: 'ai', question: 'What AI model does Scribly use?', answer: 'Scribly is powered by Google Gemini 2.5 Pro, providing advanced content generation, smart suggestions, and intelligent note enhancement features.' },
    { id: 9, category: 'ai', question: 'Do I need my own API key for AI features?', answer: 'Yes, you\'ll need to provide your own Google Gemini API key in the settings. This ensures you have full control over your AI usage and costs.' },
    { id: 10, category: 'ai', question: 'How do I get a Google Gemini API key?', answer: 'Visit Google AI Studio, create an account, and generate your API key. Then add it to your Scribly settings under AI Configuration.' },
    { id: 11, category: 'ai', question: 'What types of content can AI generate?', answer: 'AI can generate meeting notes, todo lists, project plans, journal entries, research notes, blog posts, and more. You can also generate content from just a title.' },
    { id: 12, category: 'ai', question: 'Can AI generate tags for my notes?', answer: 'Yes! AI can automatically generate relevant tags based on your note content, helping you organize and categorize your notes effectively.' },
    { id: 13, category: 'ai', question: 'Is my data sent to AI services?', answer: 'Only the content you choose to enhance with AI is sent to Google\'s Gemini API. Your API key ensures direct communication with Google\'s secure servers.' },
    { id: 14, category: 'ai', question: 'Can I disable AI features?', answer: 'Yes, AI features are optional. You can use Scribly as a traditional note-taking app without any AI functionality if you prefer.' },

    // Sharing & Links
    { id: 15, category: 'sharing', question: 'How do shared links work?', answer: 'You can create multiple shareable links for each note with custom names, track clicks and analytics, and revoke access anytime.' },
    { id: 16, category: 'sharing', question: 'Can I create multiple links for one note?', answer: 'Yes! You can create unlimited shareable links per note, each with custom names and individual access controls.' },
    { id: 17, category: 'sharing', question: 'Do shared links expire?', answer: 'Shared links don\'t expire automatically, but you have full control to revoke any link at any time from the Shared Links Manager.' },
    { id: 18, category: 'sharing', question: 'Can I see who viewed my shared notes?', answer: 'Yes, our analytics show you click counts, view times, and general engagement metrics for each shared link.' },
    { id: 19, category: 'sharing', question: 'Are shared notes secure?', answer: 'Shared links use unique, randomly generated URLs that are difficult to guess. You can revoke access instantly if needed.' },
    { id: 20, category: 'sharing', question: 'Can I password protect shared links?', answer: 'Password protection for shared links is planned for a future update. Currently, security relies on unique, hard-to-guess URLs.' },
    { id: 21, category: 'sharing', question: 'How do I manage all my shared links?', answer: 'Use the Shared Links Manager in your dashboard to view, edit, analyze, and revoke all your shared links in one place.' },

    // Export & Download
    { id: 22, category: 'export', question: 'What export formats are supported?', answer: 'Currently, you can export notes as Markdown (.md) files with preserved formatting, perfect for documentation and publishing.' },
    { id: 23, category: 'export', question: 'Can I export multiple notes at once?', answer: 'Bulk export functionality is planned for future releases. Currently, you can export notes individually.' },
    { id: 24, category: 'export', question: 'Are formatting and styles preserved in exports?', answer: 'Yes, Markdown exports maintain all your formatting, including headers, lists, links, and other styling elements.' },
    { id: 25, category: 'export', question: 'Can I export to PDF or Word?', answer: 'PDF and Word export options are planned for future updates. Currently, we support Markdown export which works great with most platforms.' },
    { id: 26, category: 'export', question: 'How do I download my exported notes?', answer: 'Click the download button on any note, and it will instantly download as a .md file to your default downloads folder.' },

    // Account & Settings
    { id: 27, category: 'account', question: 'How do I change my password?', answer: 'Go to your account settings and use the "Change Password" option. You\'ll need to verify your current password first.' },
    { id: 28, category: 'account', question: 'Can I change my email address?', answer: 'Yes, you can update your email address in account settings. You\'ll receive a verification email to confirm the change.' },
    { id: 29, category: 'account', question: 'How do I delete my account?', answer: 'Account deletion can be requested through settings or by contacting support. This action permanently removes all your data.' },
    { id: 30, category: 'account', question: 'Can I customize the interface?', answer: 'Yes! You can customize note colors, fonts, sizes, and backgrounds. More customization options are being added regularly.' },
    { id: 31, category: 'account', question: 'How does auto-save work?', answer: 'Auto-save automatically saves your notes every 30 seconds (configurable in settings) while you\'re typing, ensuring you never lose your work.' },
    { id: 32, category: 'account', question: 'Can I disable auto-save?', answer: 'Yes, you can disable auto-save in settings if you prefer manual saving. You can also adjust the auto-save interval.' },

    // Privacy & Security
    { id: 33, category: 'security', question: 'How is my data protected?', answer: 'Your data is encrypted in transit and at rest. We use industry-standard security practices and never share your personal information.' },
    { id: 34, category: 'security', question: 'Where is my data stored?', answer: 'Your data is securely stored on Appwrite\'s cloud infrastructure with enterprise-grade security and regular backups.' },
    { id: 35, category: 'security', question: 'Can Scribly staff see my notes?', answer: 'No, your notes are private by default. Staff cannot access your personal notes unless you explicitly share them or request support.' },
    { id: 36, category: 'security', question: 'How do you handle my API keys?', answer: 'API keys are encrypted and stored securely. They\'re only used for your AI requests and are never shared or logged in plain text.' },
    { id: 37, category: 'security', question: 'Is two-factor authentication available?', answer: 'Two-factor authentication is planned for future releases to provide additional account security.' },
    { id: 38, category: 'security', question: 'What happens if I forget my password?', answer: 'Use the "Forgot Password" link on the login page to receive a secure password reset link via email.' },

    // Technical
    { id: 39, category: 'technical', question: 'What browsers are supported?', answer: 'Scribly works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated.' },
    { id: 40, category: 'technical', question: 'Why is the AI generation slow sometimes?', answer: 'AI processing time depends on Google\'s API response times and your content complexity. Peak usage times may also affect speed.' },
    { id: 41, category: 'technical', question: 'How do I report a bug?', answer: 'Use the feedback feature in the app, contact us through the website, or email scribly.server@gmail.com with detailed bug information.' },
    { id: 42, category: 'technical', question: 'Are there keyboard shortcuts?', answer: 'Yes! Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline, and Ctrl+K for links. More shortcuts are being added.' },
    { id: 43, category: 'technical', question: 'Can I use Markdown syntax directly?', answer: 'Absolutely! Scribly supports full Markdown syntax. You can type Markdown directly or use the formatting toolbar.' },
    { id: 44, category: 'technical', question: 'What should I do if the app won\'t load?', answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. Contact support if issues persist.' },
    { id: 45, category: 'technical', question: 'How large can my notes be?', answer: 'Notes can be quite large, but very long notes may affect performance. We recommend breaking extremely long content into multiple notes.' },

    // Beta & Future
    { id: 46, category: 'general', question: 'What does "beta" mean for Scribly?', answer: 'Beta means we\'re actively developing and improving features based on user feedback. Expect regular updates and new capabilities.' },
    { id: 47, category: 'general', question: 'How can I provide feedback?', answer: 'Use the in-app feedback feature, email us, or contact us through the website. Your feedback directly influences our development roadmap.' },
    { id: 48, category: 'general', question: 'What features are coming next?', answer: 'We\'re working on mobile apps, real-time collaboration, advanced AI models, team workspaces, and more export formats.' },
    { id: 49, category: 'general', question: 'Will my data be safe during beta updates?', answer: 'Yes, your data is always preserved during updates. We take regular backups and test all changes thoroughly before deployment.' },
    { id: 50, category: 'general', question: 'How do I stay updated on new features?', answer: 'Follow our beta announcements, check the changelog in the app, or join our community channels for the latest updates.' }
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: 999999 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Frequently Asked Questions
                </h3>
                <p className="text-sm text-gray-400">
                  Find answers to common questions about Scribly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-700">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-hide">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No FAQs found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const isOpen = openItems[faq.id];
                  return (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-white font-medium pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-700"
                          >
                            <div className="px-4 py-3">
                              <p className="text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">
                Can't find what you're looking for?
              </p>
              <button
                onClick={onClose}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Contact our support team
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FAQModal;
