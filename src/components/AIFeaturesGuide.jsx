import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Settings, Tag, ArrowRight, CheckCircle } from 'lucide-react';
import Button from './Button';

const AIFeaturesGuide = ({ onClose, onSetupAPI }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKeySetup, setApiKeySetup] = useState(false);

  const steps = [
    {
      title: "Welcome to AI-Powered Notes! 🎉",
      description: "Transform your note-taking with intelligent AI assistance",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <Wand2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Generate Notes</h4>
              <p className="text-sm text-gray-300">Create complete notes from simple prompts</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <Tag className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Smart Tags</h4>
              <p className="text-sm text-gray-300">Auto-generate relevant tags for organization</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
              <Settings className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Your API Key</h4>
              <p className="text-sm text-gray-300">Secure, local storage of your credentials</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Set Up Your API Key 🔑",
      description: "You'll need a Google Gemini API key to use AI features",
      content: (
        <div className="space-y-6">
          {apiKeySetup && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h4 className="font-semibold text-green-300">API Key Setup in Progress!</h4>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                The API key modal should have opened. Once you've saved your key, click "Next" to continue.
              </p>
            </div>
          )}
          
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-300 mb-2">Why do I need an API key?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Your API key stays completely private (stored locally)</li>
              <li>• Direct connection to Google's AI (no middleman)</li>
              <li>• You control your usage and costs</li>
              <li>• Better performance and reliability</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-white">How to get your API key:</h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Visit <a href="https://ai.google.dev/api/rest" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy the key (starts with "AIza...")</li>
              <li>Paste it in Scribly's API settings</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Find the AI Features 🎯",
      description: "Here's where to find all the AI-powered tools",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h4 className="font-semibold text-white">Generate Complete Notes</h4>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Look for the purple "Create with AI" button on your Dashboard
              </p>
              <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-400">
                💡 Try: "Create a meeting agenda for product planning"
              </div>
            </div>
            
            <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Tag className="h-5 w-5 text-pink-400" />
                <h4 className="font-semibold text-white">Generate Smart Tags</h4>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                In any note editor, click the "AI Tags" button next to your tags
              </p>
              <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-400">
                💡 Add title/content first, then generate relevant tags
              </div>
            </div>
            
            <div className="bg-gray-700/20 border border-gray-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Settings className="h-5 w-5 text-gray-400" />
                <h4 className="font-semibold text-white">API Settings</h4>
              </div>
              <p className="text-sm text-gray-300">
                Click the gear icon ⚙️ on Dashboard to manage your API key
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Create! 🚀",
      description: "You're all set to use AI-powered note creation",
      content: (
        <div className="space-y-6">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">You're All Set!</h4>
            <p className="text-gray-300">
              Start creating amazing notes with AI assistance
            </p>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Quick Tips:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Be specific in your prompts for better results</li>
              <li>• Try different note types (meeting, project, research)</li>
              <li>• Edit AI-generated content to make it perfect</li>
              <li>• Use AI tags to keep your notes organized</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{currentStepData.title}</h2>
              <p className="text-sm text-gray-400">{currentStepData.description}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentStepData.content}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-purple-500' : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            {/* Always show Skip button */}
            <Button
              onClick={onClose}
              variant="outline"
              className="px-4 py-2"
            >
              Skip Guide
            </Button>
            
            {/* Back button */}
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="px-4 py-2"
              >
                Back
              </Button>
            )}
            
            {/* Setup API Key button */}
            {currentStep === 1 && !apiKeySetup && (
              <Button
                onClick={() => {
                  onSetupAPI();
                  setApiKeySetup(true); // Mark as setup completed
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700"
              >
                Set Up API Key
              </Button>
            )}
            
            {/* Show Next button after API key setup OR for other steps */}
            {(currentStep === 1 && apiKeySetup) || (currentStep < steps.length - 1 && currentStep !== 1) ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                variant="primary"
                className="px-4 py-2"
              >
                Next
              </Button>
            ) : null}
            
            {/* Alternative: Skip API setup */}
            {currentStep === 1 && !apiKeySetup && (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                variant="outline"
                className="px-4 py-2"
              >
                Skip for Now
              </Button>
            )}
            
            {/* Final button */}
            {currentStep === steps.length - 1 && (
              <Button
                onClick={onClose}
                variant="primary"
                className="px-4 py-2 bg-green-600 hover:bg-green-700"
              >
                Start Creating!
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIFeaturesGuide;
