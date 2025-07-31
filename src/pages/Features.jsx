import { motion } from 'framer-motion';
import { Brain, Share2, Download, PenTool, Zap, Shield, Users, Search, Tag, Sparkles, Eye, Copy, Calendar, Lock, Smartphone, Globe } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const FeatureCard = ({ icon: Icon, title, description, status = 'available', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
    }}
  >
    <div className="flex items-start justify-between mb-6">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
        }}
      >
        <Icon className="w-6 h-6" style={{ color: '#4F70E2' }} />
      </div>
      {status === 'beta' && (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30">
          BETA
        </span>
      )}
      {status === 'new' && (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600/20 text-green-300 border border-green-500/30">
          NEW
        </span>
      )}
    </div>
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-200 leading-relaxed">{description}</p>
  </motion.div>
);

const Features = () => {
  const coreFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Writing",
      description: "Generate comprehensive notes with Google Gemini 2.5 Pro. Transform simple ideas into polished content with intelligent suggestions and multiple content types.",
      status: "new"
    },
    {
      icon: Share2,
      title: "Advanced Sharing",
      description: "Create multiple shareable links per note with custom names, expiration dates, and detailed analytics. Track views and manage access with enterprise-level controls.",
      status: "new"
    },
    {
      icon: Download,
      title: "Professional Export",
      description: "Export notes in beautiful Markdown format with preserved formatting. Perfect for documentation, publishing, and professional presentations.",
      status: "available"
    },
    {
      icon: PenTool,
      title: "Rich Text Editor",
      description: "Intuitive WYSIWYG editor with markdown support, real-time formatting, and seamless writing experience across all devices.",
      status: "available"
    },
    {
      icon: Tag,
      title: "Smart Tagging",
      description: "AI-powered tag generation and intelligent organization. Find your notes instantly with smart categorization and advanced search capabilities.",
      status: "available"
    },
    {
      icon: Eye,
      title: "Multiple View Modes",
      description: "Switch between grid and list views. Customize your workspace layout for optimal productivity and visual organization.",
      status: "available"
    }
  ];

  const advancedFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description: "Instant sync across devices with optimized loading and real-time updates. Never lose your work with automatic cloud backup.",
      status: "available"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption, secure authentication, and privacy-first design. Your thoughts remain completely private and protected.",
      status: "available"
    },
    {
      icon: Search,
      title: "Powerful Search",
      description: "Full-text search across all notes with intelligent filtering. Find any content instantly with advanced search algorithms.",
      status: "available"
    },
    {
      icon: Sparkles,
      title: "Custom Styling",
      description: "Personalize your notes with custom colors, fonts, and themes. Create a workspace that reflects your unique style and preferences.",
      status: "available"
    },
    {
      icon: Copy,
      title: "Quick Actions",
      description: "Streamlined workflow with keyboard shortcuts, quick copy, and efficient note management. Boost productivity with intuitive controls.",
      status: "available"
    },
    {
      icon: Calendar,
      title: "Smart Organization",
      description: "Automatic timestamps, starred favorites, and intelligent sorting. Keep your notes organized without manual effort.",
      status: "available"
    }
  ];

  const mobileFeatures = [
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Perfect experience on any device with adaptive design. Write, edit, and share notes seamlessly from mobile to desktop.",
      status: "available"
    },
    {
      icon: Globe,
      title: "Universal Access",
      description: "Access your notes anywhere with cloud synchronization. Work offline and sync automatically when connected.",
      status: "available"
    },
    {
      icon: Users,
      title: "Creator Attribution",
      description: "Professional shared note pages with real creator information. Build trust and credibility with transparent attribution.",
      status: "available"
    },
    {
      icon: Lock,
      title: "Privacy Controls",
      description: "Granular privacy settings with link expiration and revocation. Maintain complete control over your shared content.",
      status: "available"
    }
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
            {/* Beta Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
                color: '#9333ea'
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Cutting-Edge Features</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Powerful <span className="gradient-text">Features</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover all the innovative features that make Scribly the most advanced 
              note-taking platform for modern creators and professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Core Features
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Essential tools that power your daily note-taking experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Advanced Capabilities
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Professional-grade features for power users and teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile & Access Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Universal Access
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Work seamlessly across all platforms and devices.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mobileFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-12 text-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(79,112,226,0.1) 0%, rgba(0,0,0,0.3) 100%)',
              borderColor: 'rgba(79,112,226,0.3)'
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Experience All Features
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join our beta program and get access to all these powerful features. 
              Shape the future of intelligent note-taking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white"
                style={{
                  background: 'linear-gradient(135deg, #4F70E2 0%, #3B59D9 50%, #2A46C7 100%)',
                  boxShadow: '0 8px 32px rgba(79, 112, 226, 0.3)'
                }}
              >
                Start Using Features
              </motion.a>
              <motion.a
                href="/beta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white border"
                style={{
                  borderColor: '#4F70E2',
                  color: '#4F70E2'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#4F70E2';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#4F70E2';
                }}
              >
                Learn About Beta
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Features;
