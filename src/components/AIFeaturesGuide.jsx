import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Settings,
  Tag,
  ArrowRight,
  CheckCircle,
  Cloud,
  HardDrive,
  Key,
  X,
} from "lucide-react";
import Button from "./Button";

const AIFeaturesGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to AI-Powered Notes! 🎉",
      description: "Transform your note-taking with intelligent AI assistance",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <Wand2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Generate Notes</h4>
              <p className="text-sm text-gray-300">
                Create complete notes from simple prompts
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <Tag className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Smart Tags</h4>
              <p className="text-sm text-gray-300">
                Auto-generate relevant tags for organization
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
              <Settings className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Two AI Options</h4>
              <p className="text-sm text-gray-300">
                Cloud AI or Local AI - you choose!
              </p>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-600/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">
              Choose Your AI Experience:
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="h-5 w-5 text-blue-400" />
                  <h5 className="font-medium text-blue-300">
                    Cloud AI (Google Gemini)
                  </h5>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Fast, reliable responses</li>
                  <li>• Requires API key</li>
                  <li>• Internet connection needed</li>
                  <li>• Advanced capabilities</li>
                </ul>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="h-5 w-5 text-green-400" />
                  <h5 className="font-medium text-green-300">
                    Local AI (Browser-based)
                  </h5>
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                    BETA
                  </span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Complete privacy</li>
                  <li>• No API key required</li>
                  <li>• Works offline</li>
                  <li>• Downloads models to browser</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Setting Up Cloud AI (Google Gemini) 🌐",
      description: "Set up Google Gemini API for fast, reliable AI",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Key className="h-5 w-5 text-blue-400 mr-2" />
              Get Your Google Gemini API Key
            </h4>
            <div className="space-y-3">
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  1. Visit{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <p>2. Sign in with your Google account</p>
                <p>3. Click "Create API Key"</p>
                <p>4. Copy your API key and paste it in Settings</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-white mb-2">
                  Pro Tips:
                </h5>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Free tier includes generous usage limits</li>
                  <li>• Keep your API key secure and private</li>
                  <li>• You can always regenerate if needed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-200 mb-2">
              💡 Why Gemini?
            </h4>
            <p className="text-sm text-gray-300">
              Google Gemini provides fast, reliable AI with excellent note
              generation capabilities and smart tagging features.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Setting Up Local AI (Browser-based) 🔒",
      description:
        "Run AI models directly in your browser for complete privacy",
      content: (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <HardDrive className="h-5 w-5 text-green-400" />
              <h4 className="font-semibold text-white">
                Complete Privacy & Control
              </h4>
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                BETA
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-300 space-y-2">
                <p>
                  <strong>How it works:</strong>
                </p>
                <p>• Downloads AI models directly to your browser</p>
                <p>• All processing happens locally on your device</p>
                <p>• No data ever leaves your computer</p>
                <p>• Works completely offline after initial setup</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-white mb-2">
                  Setup Steps:
                </h5>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>1. Go to Settings → AI Provider</li>
                  <li>2. Select "Local AI (Browser-based)"</li>
                  <li>3. Choose a model and click "Initialize"</li>
                  <li>4. Wait for download (one-time setup)</li>
                  <li>5. Start generating notes privately!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">
              🚀 Perfect For:
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Sensitive or confidential notes</li>
              <li>• Offline work environments</li>
              <li>• Users who prefer complete privacy</li>
              <li>• Experimenting without API costs</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Where to Find AI Features 🎯",
      description: "Here's where to find all the AI-powered tools",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Wand2 className="h-5 w-5 text-purple-400" />
                <h4 className="font-semibold text-white">
                  Dashboard AI Section
                </h4>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Purple "Create with AI" button</li>
                <li>• Quick AI note generation</li>
                <li>• Smart prompts and suggestions</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-white">Settings Panel</h4>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Choose AI provider</li>
                <li>• Configure API keys</li>
                <li>• Initialize Local AI models</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-600/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">
              ✨ AI Capabilities:
            </h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Generate complete notes from simple prompts</li>
              <li>• Auto-create relevant tags for organization</li>
              <li>• Smart content suggestions and improvements</li>
              <li>• Switch between Cloud and Local AI anytime in Settings</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Cloud className="h-4 w-4 text-blue-400" />
                <h5 className="font-medium text-blue-300">
                  Cloud AI Best For:
                </h5>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Fast response times</li>
                <li>• Complex note generation</li>
                <li>• Advanced language understanding</li>
                <li>• When internet is available</li>
              </ul>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <HardDrive className="h-4 w-4 text-green-400" />
                <h5 className="font-medium text-green-300">
                  Local AI Best For:
                </h5>
                <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">
                  BETA
                </span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Complete privacy</li>
                <li>• Offline functionality</li>
                <li>• No usage limits</li>
                <li>• Sensitive content</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set! 🎉",
      description: "You're all set to use AI-powered note creation",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-white mb-3">
              Ready to Create Amazing Notes!
            </h4>
            <p className="text-gray-300 mb-4">
              You now have access to powerful AI tools that will transform your
              note-taking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-200 mb-2">
                🚀 Quick Start:
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>1. Click "Create with AI" on dashboard</li>
                <li>2. Enter a simple prompt or idea</li>
                <li>3. Let AI generate your note</li>
                <li>4. Edit and save as needed</li>
              </ul>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-200 mb-2">💡 Pro Tips:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Be specific in your prompts</li>
                <li>• Try different AI providers</li>
                <li>• Use tags for organization</li>
                <li>• Experiment with different topics</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-yellow-200 font-medium">
              🎯 Ready to revolutionize your note-taking? Let's get started!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
                {currentStepData.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {currentStepData.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg ml-2 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[calc(90vh-180px)] sm:max-h-[calc(90vh-200px)] overflow-y-auto">
          {currentStepData.content}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-700/50 p-4 sm:p-6 bg-gray-900/95">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            {/* Progress Indicators */}
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? "bg-purple-500"
                      : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-row space-x-3 w-full sm:w-auto">
              {/* Skip button - always visible */}
              <Button
                onClick={onClose}
                variant="outline"
                className="px-3 sm:px-4 py-2 text-sm flex-1 sm:flex-none"
              >
                Skip
              </Button>

              {/* Back button */}
              {currentStep > 0 && (
                <Button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  variant="outline"
                  className="px-3 sm:px-4 py-2 text-sm flex-1 sm:flex-none"
                >
                  Back
                </Button>
              )}

              {/* Next/Finish button */}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 px-3 sm:px-4 py-2 text-sm flex-1 sm:flex-none"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 sm:px-4 py-2 text-sm flex-1 sm:flex-none"
                >
                  Start
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIFeaturesGuide;
