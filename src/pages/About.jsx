import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, Target, Heart, Award, Brain, Share2, Sparkles } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import DynamicStatCard from '../components/DynamicStatCard';
import useStatistics from '../hooks/useStatistics';

const ValueCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="card-hover border rounded-xl p-8 text-center"
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(79, 112, 226, 0.3)'
    }}
  >
    <div 
      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
      style={{ backgroundColor: 'rgba(79, 112, 226, 0.2)' }}
    >
      <Icon className="h-8 w-8" style={{ color: '#4F70E2' }} />
    </div>
    <h3 className="text-2xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-200 leading-relaxed">{description}</p>
  </motion.div>
);

const About = () => {
  const { statistics, loading: statsLoading } = useStatistics();

  const values = [
    {
      icon: Brain,
      title: 'Open Source AI',
      description: 'Transparent AI integration with Google Gemini. Every algorithm is auditable, ensuring trust and privacy in your creative process.',
    },
    {
      icon: Share2,
      title: 'Community-Driven',
      description: 'Built by the community, for the community. Every feature request and contribution helps shape the future of Scribly.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every feature is designed with our users in mind, prioritizing simplicity, effectiveness, and user data ownership.',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push boundaries through collaborative development, bringing you cutting-edge features without compromise.',
    },
    {
      icon: Heart,
      title: 'Transparency',
      description: 'No hidden features, no data mining, no vendor lock-in. What you see in our code is exactly what you get.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Community code reviews and collaborative development ensure perfection in every detail, from design to performance.',
    },
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
            {/* Stable Release Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#22c55e'
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Beta v0.6.3 • Open Source</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              About <span className="gradient-text">Scribly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Born from the open-source community, built for creators everywhere. Scribly combines 
              powerful AI technology with transparent, community-driven development to create 
              the future of intelligent note-taking.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            <DynamicStatCard 
              endNumber={statistics.activeUsers.value} 
              label={statistics.activeUsers.label} 
              delay={0.1}
              loading={statsLoading}
            />
            <DynamicStatCard 
              endNumber={statistics.totalNotes.value} 
              label={statistics.totalNotes.label} 
              delay={0.2}
              loading={statsLoading}
            />
            <DynamicStatCard 
              endNumber={statistics.totalSharedLinks.value} 
              label={statistics.totalSharedLinks.label} 
              delay={0.3}
              loading={statsLoading}
            />
            <DynamicStatCard 
              endNumber={statistics.userRating.value} 
              label={statistics.userRating.label} 
              delay={0.4} 
              suffix="" 
              showStar={true}
              loading={statsLoading}
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
              Our Story
            </h2>
            
            <div className="prose prose-lg prose-invert mx-auto">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-gray-300 text-lg leading-relaxed mb-6"
              >
                Founded in 2024 as an open-source initiative, Scribly emerged from a simple 
                frustration: existing note-taking apps were either too complex, too simple, 
                or locked users into proprietary ecosystems. We wanted something transparent, 
                community-driven, and beautiful.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-300 text-lg leading-relaxed mb-6"
              >
                Our breakthrough came with integrating Google's Gemini AI in a completely 
                transparent way, transforming Scribly from a simple note-taking app into an 
                intelligent writing companion. Every line of code is open-source, auditable, 
                and privacy-first by design.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-300 text-lg leading-relaxed"
              >
                Today, Scribly v0.6.3 represents our latest stable release milestone, trusted by a 
                growing community of creators, students, and professionals. With community 
                contributions driving innovation, we're building the future of note-taking 
                together, one commit at a time.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Open Source Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These principles guide our community-driven development and help us create 
              software that truly serves everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <ValueCard
                key={value.title}
                {...value}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Open Source Features
              <span className="block" style={{ color: '#4F70E2' }}>Built by the Community</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transparent, secure, and constantly evolving with contributions from developers worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Brain className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Writing</h3>
              <p className="text-gray-200 leading-relaxed">Get intelligent suggestions powered by Google Gemini. Open-source AI integration that respects your privacy and data ownership.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Share2 className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Sharing</h3>
              <p className="text-gray-200 leading-relaxed">Create multiple shareable links with custom expiration dates. All sharing features are transparent and community-audited.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Users className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community-Driven</h3>
              <p className="text-gray-200 leading-relaxed">Built by the community, for the community. Every feature request and contribution helps shape the future of Scribly.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Target className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Innovation</h3>
              <p className="text-gray-200 leading-relaxed">We constantly push boundaries through collaborative development, bringing you cutting-edge features without compromise.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Heart className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Transparency</h3>
              <p className="text-gray-200 leading-relaxed">No hidden features, no data mining, no vendor lock-in. What you see in our code is exactly what you get.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <Award className="w-6 h-6" style={{ color: '#4F70E2' }} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Excellence</h3>
              <p className="text-gray-200 leading-relaxed">Community code reviews and collaborative development ensure perfection in every detail, from design to performance.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Version History Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Version History
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Follow our journey from the first beta to stable release. Each version 
              brought new features and improvements to enhance your note-taking experience.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* v0.6.3 - Daily Task Tracker & Enhanced Dashboard */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                  LATEST BETA
                </span>
              </div>
              <div className="flex items-center mb-4">
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.6.3
                </div>
                <h3 className="text-2xl font-bold text-white">Daily Task Tracker & Enhanced Dashboard</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Daily Task Tracker:</strong> Complete task management system with daily reset and analytics</li>
                <li>• <strong>Task Analytics:</strong> Track completion streaks, productivity insights, and historical data</li>
                <li>• <strong>Priority System:</strong> Set task priorities (Low, Medium, High) with visual indicators</li>
                <li>• <strong>Pinned Actions System:</strong> Customize dashboard with pinned action buttons</li>
                <li>• <strong>Smart Action Menu:</strong> "More" dropdown with New Note, Manage Links, and Task Tracker</li>
                <li>• <strong>Instant UI Updates:</strong> Optimized pinned actions with localStorage caching for instant loading</li>
                <li>• <strong>Enhanced Dashboard:</strong> Redesigned action buttons with pin/unpin functionality</li>
                <li>• <strong>Task Persistence:</strong> Daily tasks reset automatically while preserving analytics data</li>
              </ul>
            </motion.div>

            {/* v0.6.2 - Authentication System Overhaul & Domain Migration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.6.2
                </div>
                <h3 className="text-2xl font-bold text-white">Authentication System Overhaul & Domain Migration</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Request a Feature Page:</strong> New dedicated page for users to submit feature requests and suggestions</li>
                <li>• <strong>Enhanced Authentication System:</strong> Migrated from localStorage to secure session-based authentication</li>
                <li>• <strong>Custom Email Signup Process:</strong> Implemented custom signup flow using our domain email system</li>
                <li>• <strong>Domain Migration:</strong> Official migration to scribly.tech domain with enhanced infrastructure</li>
                <li>• <strong>Active Support Email:</strong> report@scribly.tech is now active for all user queries and support</li>
                <li>• <strong>Improved Security:</strong> Enhanced security protocols with session-based user management</li>
                <li>• <strong>Professional Email System:</strong> Custom branded email communications for all user interactions</li>
              </ul>
            </motion.div>

            {/* v0.6.1 - Bug Fixes & Local AI Optimization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="flex items-center mb-4">
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.6.1
                </div>
                <h3 className="text-2xl font-bold text-white">Stability & AI Optimization Update</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Bug Report Page:</strong> Added dedicated bug reporting system for better user feedback</li>
                <li>• <strong>AI Model Initialization Fix:</strong> Resolved critical issues with Local AI model startup and initialization</li>
                <li>• <strong>AI Tag Generation Fix:</strong> Fixed errors in AI-powered tag generation for better accuracy</li>
                <li>• <strong>Optimized Local AI:</strong> Enhanced local AI models for minimal resource usage and better performance</li>
                <li>• <strong>Resource Efficiency:</strong> Significantly reduced memory footprint for local AI operations</li>
                <li>• <strong>Stability Improvements:</strong> Enhanced overall app stability and error handling</li>
              </ul>
            </motion.div>

            {/* v0.6.0 - Major Mobile & Local AI Update */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.6.0
                </div>
                <h3 className="text-2xl font-bold text-white">Major Mobile & Local AI Revolution</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Local AI Support (BETA):</strong> Unlimited AI usage with browser-based models - complete privacy!</li>
                <li>• <strong>PNG Note Export:</strong> Download your notes as high-quality PNG images</li>
                <li>• <strong>100% Mobile Responsive:</strong> Fully optimized Dashboard, NoteView, and NoteEdit for mobile devices</li>
                <li>• <strong>Performance Optimization:</strong> Significantly improved loading times and app responsiveness</li>
                <li>• <strong>Enhanced UI Design:</strong> Refined design improvements across Home, About, Contact, and Footer pages</li>
                <li>• <strong>Touch-Friendly Interface:</strong> Optimized for seamless mobile and tablet experience</li>
                <li>• <strong>Local AI Models:</strong> Run AI models directly in your browser - no internet required after download</li>
              </ul>
            </motion.div>

            {/* v0.5.0 - Stable Release */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.5.0
                </div>
                <h3 className="text-2xl font-bold text-white">Stable Release - AI Integration</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Google Gemini Integration:</strong> Create notes just by prompt using AI</li>
                <li>• <strong>Smart Tagging:</strong> Automatic tag generation by title using Gemini</li>
                <li>• <strong>AI Content Generation:</strong> Add intelligent content suggestions by Gemini</li>
                <li>• <strong>Custom API Key:</strong> Use your own Google Gemini API key</li>
                <li>• <strong>Enhanced Settings:</strong> Easy API key setup and configuration</li>
                <li>• <strong>AI Usage Guide:</strong> Comprehensive how-to-use AI features documentation</li>
              </ul>
            </motion.div>

            {/* v0.4.2 - Bug Fixes */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.4.2
                </div>
                <h3 className="text-2xl font-bold text-white">Stability & Bug Fixes</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Bug Fixes:</strong> Resolved critical issues and improved stability</li>
                <li>• <strong>Performance Improvements:</strong> Enhanced overall application performance</li>
                <li>• <strong>Beta to Stable Transition:</strong> Prepared codebase for stable release</li>
                <li>• <strong>Code Optimization:</strong> Cleaned up and optimized core functionalities</li>
              </ul>
            </motion.div>

            {/* v0.4.0 - Advanced Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.4.0
                </div>
                <h3 className="text-2xl font-bold text-white">Advanced Features & Export</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Markdown Export:</strong> Download notes in README/Markdown format</li>
                <li>• <strong>Markdown Support:</strong> Full markdown rendering in notes</li>
                <li>• <strong>Auto-save Feature:</strong> Automatic saving for seamless experience</li>
                <li>• <strong>Enhanced Animations:</strong> Added smooth animations in dashboard and notes</li>
                <li>• <strong>Breadcrumb Navigation:</strong> Easy navigation throughout the application</li>
                <li>• <strong>Starred Feature:</strong> Mark important notes for quick access</li>
              </ul>
            </motion.div>

            {/* v0.3.0 - Note Customization */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.3.0
                </div>
                <h3 className="text-2xl font-bold text-white">Rich Note Features</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Advanced Toolbar:</strong> Enhanced note editing with rich features</li>
                <li>• <strong>Share Note Feature:</strong> Share notes with custom links and expiration</li>
                <li>• <strong>Background Colors:</strong> Customize note appearance with color themes</li>
                <li>• <strong>Font Customization:</strong> Choose from multiple font styles</li>
                <li>• <strong>Size Customization:</strong> Adjust text size for better readability</li>
              </ul>
            </motion.div>

            {/* v0.2.1 - UI Polish */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.2.1
                </div>
                <h3 className="text-2xl font-bold text-white">UI Polish & Fixes</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>UI Animations:</strong> Added smooth animations throughout the interface</li>
                <li>• <strong>Authentication Fixes:</strong> Resolved bugs in user authentication flow</li>
                <li>• <strong>Authorization Improvements:</strong> Enhanced security and user permissions</li>
                <li>• <strong>Visual Enhancements:</strong> Improved overall user experience</li>
              </ul>
            </motion.div>

            {/* v0.2.0 - Dashboard & Security */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.2.0
                </div>
                <h3 className="text-2xl font-bold text-white">Personalized Experience</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Personalized Dashboard:</strong> Custom user dashboard with personal notes</li>
                <li>• <strong>Enhanced Security:</strong> Improved data protection and user privacy</li>
                <li>• <strong>Gradient UI:</strong> Beautiful gradient designs throughout the interface</li>
                <li>• <strong>Forgot Password:</strong> Password recovery functionality added</li>
              </ul>
            </motion.div>

            {/* v0.1.0 - Foundation */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-4">
                  v0.1.0
                </div>
                <h3 className="text-2xl font-bold text-white">Foundation Release</h3>
              </div>
              <ul className="text-gray-300 space-y-2 leading-relaxed">
                <li>• <strong>Basic Note-Taking:</strong> Simple and clean note creation and editing</li>
                <li>• <strong>Core UI Development:</strong> Initial user interface design and layout</li>
                <li>• <strong>User Authentication:</strong> Secure user registration and login system</li>
                <li>• <strong>Authorization System:</strong> Role-based access control implementation</li>
                <li>• <strong>Basic Features:</strong> Essential note management functionality</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default About;

