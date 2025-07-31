import { motion } from 'framer-motion';
import { Rocket, Users, Brain, Zap, Shield, Globe, Smartphone, Database, MessageCircle, Calendar, DollarSign, Crown, Star, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const FeatureCard = ({ icon: Icon, title, description, timeline, priority = 'medium', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
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
      <div className="text-right">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          priority === 'high' ? 'bg-red-600/20 text-red-300 border border-red-500/30' :
          priority === 'medium' ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30' :
          'bg-green-600/20 text-green-300 border border-green-500/30'
        }`}>
          {priority.toUpperCase()}
        </span>
        <p className="text-xs text-gray-400 mt-1">{timeline}</p>
      </div>
    </div>
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-200 leading-relaxed">{description}</p>
  </motion.div>
);

const PricingTier = ({ title, price, features, highlight = false, comingSoon = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={`relative rounded-2xl p-8 border ${
      highlight 
        ? 'border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-blue-900/20' 
        : 'border-white/10 bg-white/5'
    } backdrop-blur-sm hover:border-white/20 transition-all duration-300`}
  >
    {highlight && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full">
          Most Popular
        </span>
      </div>
    )}
    {comingSoon && (
      <div className="absolute -top-4 right-4">
        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-xs font-semibold rounded-full border border-yellow-500/30">
          Coming Soon
        </span>
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== 'Free' && <span className="text-gray-400">/month</span>}
      </div>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-gray-200">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
        highlight
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={comingSoon}
    >
      {comingSoon ? 'Coming Soon' : highlight ? 'Start Free Trial' : 'Get Started'}
    </button>
  </motion.div>
);

const TimelineItem = ({ quarter, year, features, status = 'planned' }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    className="relative pl-8 pb-8 border-l border-gray-600 last:border-l-0"
  >
    <div className={`absolute -left-2 w-4 h-4 rounded-full border-2 ${
      status === 'completed' ? 'bg-green-400 border-green-400' :
      status === 'in-progress' ? 'bg-yellow-400 border-yellow-400' :
      'bg-gray-600 border-gray-600'
    }`}></div>
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{quarter} {year}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'completed' ? 'bg-green-600/20 text-green-300' :
          status === 'in-progress' ? 'bg-yellow-600/20 text-yellow-300' :
          'bg-gray-600/20 text-gray-300'
        }`}>
          {status === 'completed' ? 'COMPLETED' : status === 'in-progress' ? 'IN PROGRESS' : 'PLANNED'}
        </span>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-gray-200 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const FutureUpdates = () => {
  const upcomingFeatures = [
    {
      icon: Users,
      title: "Real-Time Collaborative Editing",
      description: "Multiple users can edit the same note simultaneously with live cursors, comments, and conflict resolution. Perfect for team brainstorming and document collaboration.",
      timeline: "Q2 2025",
      priority: "high"
    },
    {
      icon: Brain,
      title: "Advanced AI Model Selection",
      description: "Choose from multiple AI models including GPT-4, Claude, and specialized models for different content types. Custom model fine-tuning for your specific needs.",
      timeline: "Q2 2025",
      priority: "high"
    },
    {
      icon: Globe,
      title: "Team Workspaces",
      description: "Shared workspaces with role-based permissions, team libraries, and centralized administration. Enterprise-grade collaboration tools.",
      timeline: "Q3 2025",
      priority: "medium"
    },
    {
      icon: MessageCircle,
      title: "In-Note Comments & Discussions",
      description: "Add comments to specific sections, reply to feedback, and resolve discussions. Keep all note-related conversations in context.",
      timeline: "Q2 2025",
      priority: "medium"
    },
    {
      icon: Database,
      title: "Advanced Search & Filters",
      description: "Semantic search, saved search queries, advanced filters by date, tags, collaborators, and content type. AI-powered content discovery.",
      timeline: "Q3 2025",
      priority: "medium"
    },
    {
      icon: Smartphone,
      title: "Native Mobile Apps",
      description: "Dedicated iOS and Android apps with offline editing, push notifications, and mobile-optimized AI features. Full feature parity with web.",
      timeline: "Q4 2025",
      priority: "high"
    },
    {
      icon: Calendar,
      title: "Version History & Backup",
      description: "Automatic version snapshots, restore previous versions, and export complete backups. Never lose important changes or content.",
      timeline: "Q3 2025",
      priority: "medium"
    },
    {
      icon: Zap,
      title: "API & Integrations",
      description: "RESTful API for custom integrations, Zapier support, and connections to popular tools like Notion, Slack, and Google Workspace.",
      timeline: "Q4 2025",
      priority: "low"
    },
    {
      icon: Shield,
      title: "Enhanced Security Features",
      description: "Two-factor authentication, SSO integration, audit logs, and advanced encryption options. Enterprise compliance certifications.",
      timeline: "Q3 2025",
      priority: "medium"
    }
  ];

  const pricingPlans = [
    {
      title: "Personal",
      price: "Free",
      features: [
        "Up to 100 notes",
        "Basic AI features",
        "3 share links per note",
        "Standard export",
        "Email support"
      ]
    },
    {
      title: "Pro",
      price: "Coming Soon",
      highlight: true,
      comingSoon: true,
      features: [
        "Unlimited notes",
        "Advanced AI models",
        "Unlimited share links",
        "Priority AI processing",
        "Advanced analytics",
        "Markdown export",
        "Priority support"
      ]
    },
    {
      title: "Team",
      price: "Coming Soon",
      comingSoon: true,
      features: [
        "Everything in Pro",
        "Team workspaces",
        "Collaborative editing",
        "Role management",
        "Admin controls",
        "Team analytics",
        "SSO integration"
      ]
    },
    {
      title: "Enterprise",
      price: "Coming Soon",
      comingSoon: true,
      features: [
        "Everything in Team",
        "Custom AI models",
        "Advanced security",
        "Compliance features",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ]
    }
  ];

  const roadmapItems = [
    {
      quarter: "Q1",
      year: "2025",
      status: "completed",
      features: [
        "Google Gemini 2.5 Pro integration",
        "Multiple share links system",
        "Enhanced sharing analytics",
        "Markdown export functionality",
        "Professional UI improvements"
      ]
    },
    {
      quarter: "Q2",
      year: "2025",
      status: "in-progress",
      features: [
        "Real-time collaborative editing",
        "Advanced AI model selection",
        "In-note comments system",
        "Enhanced mobile experience",
        "Performance optimizations"
      ]
    },
    {
      quarter: "Q3",
      year: "2025",
      status: "planned",
      features: [
        "Team workspaces launch",
        "Advanced search & filters",
        "Version history system",
        "Enhanced security features",
        "Integration marketplace"
      ]
    },
    {
      quarter: "Q4",
      year: "2025",
      status: "planned",
      features: [
        "Native mobile apps",
        "RESTful API release",
        "Enterprise features",
        "Custom AI model training",
        "Advanced analytics dashboard"
      ]
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
              <Rocket className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Innovation Roadmap</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Future <span className="gradient-text">Updates</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover what's coming next to Scribly. From collaborative editing to AI model 
              selection, we're building the future of intelligent note-taking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Upcoming Features
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Revolutionary features that will transform your note-taking experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Introduction */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Future Pricing
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Currently everything is free during beta. Pricing will be announced later.
            </p>
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg max-w-2xl mx-auto">
              <p className="text-green-200">
                <strong>Beta Advantage:</strong> All features are completely free during beta. 
                Pricing will be declared after beta launch with special discounts for early adopters.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <PricingTier key={plan.title} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Development Roadmap
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Our quarterly development timeline and what you can expect.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {roadmapItems.map((item, index) => (
              <TimelineItem key={`${item.quarter}-${item.year}`} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-12 text-center border"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
              borderColor: 'rgba(34, 197, 94, 0.3)'
            }}
          >
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Early Access
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join our beta program and be the first to experience these amazing features. 
              Plus, get special pricing when we launch our premium plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
                }}
              >
                Join Beta Program
              </motion.a>
              <motion.a
                href="/beta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white border"
                style={{
                  borderColor: '#22c55e',
                  color: '#22c55e'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#22c55e';
                }}
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default FutureUpdates;
