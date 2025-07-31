import { motion } from 'framer-motion';
import { Sparkles, Brain, Share2, Download, Users, ChevronRight, Calendar, Zap, Shield, Star, AlertTriangle, CheckCircle, Clock, Rocket } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const VersionCard = ({ version, date, features, status = 'released' }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="border rounded-xl p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${status === 'current' ? 'bg-green-400' : status === 'upcoming' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
        <h3 className="text-xl font-semibold text-white">Version {version}</h3>
      </div>
      <span className="text-sm text-gray-400">{date}</span>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-2 text-gray-200">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const FeatureHighlight = ({ icon: Icon, title, description, status }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-600/20 rounded-lg">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === 'stable' ? 'bg-green-600/20 text-green-300' :
            status === 'beta' ? 'bg-yellow-600/20 text-yellow-300' :
            'bg-purple-600/20 text-purple-300'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Beta = () => {
  const currentVersion = "0.8.5";
  const releaseDate = "January 31, 2025";

  const betaFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Content Generation",
      description: "Generate intelligent notes with Google Gemini 2.5 Pro. Multiple note types, smart templates, and contextual suggestions.",
      status: "beta"
    },
    {
      icon: Share2,
      title: "Multiple Share Links",
      description: "Create unlimited shareable links per note with custom names, analytics tracking, and granular access controls.",
      status: "beta"
    },
    {
      icon: Download,
      title: "Markdown Export",
      description: "Professional export functionality with preserved formatting, perfect for documentation and publishing workflows.",
      status: "stable"
    },
    {
      icon: Users,
      title: "Enhanced Collaboration",
      description: "Real creator attribution, comprehensive link management, and enterprise-level sharing capabilities.",
      status: "beta"
    }
  ];

  const versionHistory = [
    {
      version: "0.8.5",
      date: "Jan 31, 2025",
      status: "current",
      features: [
        "Google Gemini 2.5 Pro integration",
        "Multiple share links with analytics",
        "Markdown export functionality",
        "Enhanced SharedLinksManager dashboard",
        "Improved AI content generation",
        "Professional creator attribution"
      ]
    },
    {
      version: "0.8.0",
      date: "Jan 25, 2025",
      status: "released",
      features: [
        "Advanced sharing system overhaul",
        "Click tracking and analytics",
        "Custom link naming",
        "Individual link revocation",
        "Database schema improvements"
      ]
    },
    {
      version: "0.7.5",
      date: "Jan 20, 2025",
      status: "released",
      features: [
        "AI service simplification",
        "Code cleanup and optimization",
        "Enhanced download features",
        "Improved error handling",
        "Performance optimizations"
      ]
    },
    {
      version: "0.9.0",
      date: "Q3 2025",
      status: "upcoming",
      features: [
        "Real-time collaborative editing",
        "Advanced AI model selection",
        "Team workspace features",
        "Enhanced mobile experience",
        "API integration improvements"
      ]
    },
    {
      version: "1.0.0",
      date: "Q4 2025",
      status: "upcoming",
      features: [
        "Official public release",
        "Full feature stability",
        "Enterprise security features",
        "Advanced team collaboration",
        "Premium pricing tiers launch"
      ]
    }
  ];

  const knownIssues = [
    "Occasional AI generation delays during peak usage",
    "Mobile responsive improvements in progress",
    "Link sharing analytics may have slight delays",
    "Search functionality being enhanced"
  ];

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Beta Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
                color: '#9333ea'
              }}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              <span className="text-lg font-semibold">Beta v{currentVersion}</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Join the <span className="gradient-text">Beta</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the cutting-edge features of Scribly before they're officially released. 
              Help us shape the future of intelligent note-taking.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Latest Release</h3>
                <p className="text-gray-300">{releaseDate}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Rocket className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Stability</h3>
                <p className="text-gray-300">Production Ready</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">User Rating</h3>
                <p className="text-gray-300">4.9/5 Stars</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Beta Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Beta Features
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Experience the latest innovations and help us perfect them.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {betaFeatures.map((feature, index) => (
              <FeatureHighlight key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Version History */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Version History
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Track our progress and see what's coming next.
            </p>
          </motion.div>

          <div className="space-y-6">
            {versionHistory.map((version) => (
              <VersionCard key={version.version} {...version} />
            ))}
          </div>
        </div>
      </section>

      {/* Known Issues */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Known Issues & Limitations</h3>
              </div>
              <p className="text-gray-300 mb-6">
                As a beta product, there are some known issues we're actively working to resolve:
              </p>
              <ul className="space-y-3">
                {knownIssues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200 text-sm">{issue}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>Report Issues:</strong> Found a bug or have feedback? Contact us at{' '}
                  <a href="mailto:beta@scribly.com" className="text-blue-400 hover:underline">
                    beta@scribly.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Beta CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-12 text-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
              borderColor: 'rgba(147, 51, 234, 0.3)'
            }}
          >
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Shape the Future?
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join thousands of beta testers who are helping us build the most advanced 
              note-taking platform. Your feedback drives our innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)',
                  boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
                }}
              >
                Join Beta Program
              </motion.a>
              <motion.a
                href="mailto:beta@scribly.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white border"
                style={{
                  borderColor: '#9333ea',
                  color: '#9333ea'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#9333ea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9333ea';
                }}
              >
                Send Feedback
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Beta;
