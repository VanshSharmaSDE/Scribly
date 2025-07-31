import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, Target, Heart, Award, Brain, Share2, Sparkles } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import DynamicStatCard from '../components/DynamicStatCard';
import useStatistics from '../hooks/useStatistics';
import Feedback from '../components/Feedback';

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
  const [showFeedback, setShowFeedback] = useState(false);
  const { statistics, loading: statsLoading } = useStatistics();

  const values = [
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Leveraging cutting-edge AI technology to enhance your writing and creative process with intelligent insights.',
    },
    {
      icon: Share2,
      title: 'Collaboration',
      description: 'Advanced sharing capabilities that enable seamless collaboration and knowledge sharing across teams.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every feature is designed with our users in mind, focusing on simplicity and effectiveness.',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push boundaries to bring you the latest in note-taking technology.',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Built by creators, for creators. We understand the importance of capturing every idea.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every detail, from design to performance.',
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
              <span className="text-sm font-semibold">Beta • AI-Enhanced</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              About <span className="gradient-text">Scribly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We believe that every great idea deserves a beautiful home. Scribly combines 
              powerful AI technology with intuitive design to revolutionize how you capture, 
              organize, and share your thoughts.
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
                Founded in 2024, Scribly emerged from a simple frustration: existing note-taking 
                apps were either too complex or too simple. We wanted something that could grow 
                with our ideas, support our creativity, and look beautiful while doing it.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-300 text-lg leading-relaxed mb-6"
              >
                Our breakthrough came with integrating Google's Gemini 2.5 Pro AI, transforming 
                Scribly from a simple note-taking app into an intelligent writing companion. 
                Combined with advanced sharing capabilities and professional export features, 
                we've created a platform that truly understands modern content creation needs.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-300 text-lg leading-relaxed"
              >
                Today, Scribly is trusted by creators, students, professionals, and dreamers 
                around the world. From AI-powered content enhancement to enterprise-level 
                sharing with detailed analytics, we're revolutionizing how people capture and 
                organize their thoughts in the digital age.
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
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do and help us create products 
              that truly make a difference.
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

      {/* Team Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-black/40 backdrop-blur-xl border rounded-2xl p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 112, 226, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderColor: 'rgba(79, 112, 226, 0.3)'
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join Our Beta Journey
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We're in active development, constantly improving and adding new features. 
              Join our beta community and help shape the future of intelligent note-taking.
            </p>
            <motion.button
              onClick={() => setShowFeedback(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white cursor-pointer"
              style={{
                backgroundColor: '#4F70E2',
                '&:hover': {
                  backgroundColor: '#3A5BC7'
                }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3A5BC7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4F70E2'}
            >
              Share Beta Feedback
            </motion.button>
          </motion.div>
        </div>
      </section>
      
      {/* Feedback Modal */}
      <Feedback isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </ProfessionalBackground>
  );
};

export default About;

