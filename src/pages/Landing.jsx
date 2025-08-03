import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Zap, Shield, Users, ArrowRight, BookOpen, Star, ChevronRight, Sparkles, Share2, Brain, Download } from 'lucide-react';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import DynamicStatCard from '../components/DynamicStatCard';
import { useAuth } from '../contexts/AuthContext';
import useStatistics from '../hooks/useStatistics';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
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
      <Icon className="w-6 h-6" style={{ color: '#4F70E2' }} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    <p className="text-gray-200 leading-relaxed">{description}</p>
  </motion.div>
);

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { statistics, loading: statsLoading } = useStatistics();

  const handleCreateWithAI = () => {
    // Only authenticated users can access this now
    navigate('/dashboard');
  };

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="pt-32 pb-20 min-h-screen flex items-center relative overflow-hidden">
        {/* Light Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left Light Effect */}
          <motion.div
            className="absolute left-0 top-0 w-1/2 h-full"
            style={{
              background: 'linear-gradient(to right, rgba(79,112,226,0.15) 0%, rgba(79,112,226,0.08) 30%, rgba(79,112,226,0.03) 50%, transparent 100%)'
            }}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Right Light Effect */}
          <motion.div
            className="absolute right-0 top-0 w-1/2 h-full"
            style={{
              background: 'linear-gradient(to left, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0.08) 30%, rgba(147,51,234,0.03) 50%, transparent 100%)'
            }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* Center Convergence Glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(79,112,226,0.1) 0%, rgba(147,51,234,0.05) 30%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              filter: 'blur(1px)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeOut" }}
          />
          
          {/* Horizontal Light Beam */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-1/2 h-0.5"
            style={{
              background: 'linear-gradient(to right, rgba(79,112,226,0.4) 0%, rgba(147,51,234,0.6) 50%, rgba(147,51,234,0.4) 100%)',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 20px rgba(79,112,226,0.3)'
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
            {/* Version Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#22c55e'
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Stable v0.6.0 • Open Source</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Open Source
              <span className="block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent pb-3">
                Note-Taking Revolution
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join the community-driven future of digital note-taking. Built by developers, for everyone. 
              Now stable and ready for production use.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleCreateWithAI}
                    variant="primary" 
                    size="lg"
                    className="group items-center flex text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)',
                      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Open Dashboard
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/signup">
                      <Button 
                        variant="primary" 
                        size="lg"
                        className="group text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                        style={{ 
                          background: 'linear-gradient(135deg, #4F70E2 0%, #3B59D9 50%, #2A46C7 100%)',
                          boxShadow: '0 8px 32px rgba(79, 112, 226, 0.3)'
                        }}
                      >
                        Get Started Free
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/login">
                      <Button 
                        variant="secondary" 
                        size="lg"
                        className="border text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                        style={{ 
                          borderColor: '#4F70E2',
                          color: '#4F70E2'
                        }}
                      >
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
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
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Transparent, secure, and constantly evolving with contributions from developers worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Writing"
              description="Get intelligent suggestions powered by Google Gemini. Open-source AI integration that respects your privacy and data ownership."
              delay={0.1}
            />
            <FeatureCard
              icon={Share2}
              title="Advanced Sharing"
              description="Create multiple shareable links with custom expiration dates. All sharing features are transparent and community-audited."
              delay={0.2}
            />
            <FeatureCard
              icon={Download}
              title="Professional Export"
              description="Export in Markdown format with no vendor lock-in. Your data remains yours with standard, open formats."
              delay={0.3}
            />
            <FeatureCard
              icon={PenTool}
              title="Rich Text Editor"
              description="Built with modern web standards and open-source libraries. Contribute to make it better for everyone."
              delay={0.4}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Optimized performance through community contributions. No tracking, no ads, just pure speed and efficiency."
              delay={0.5}
            />
            <FeatureCard
              icon={Shield}
              title="Transparent Security"
              description="Open-source security means you can verify every line of code. Community-audited and privacy-first by design."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Contribution Guide Section */}
      <section className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Contribute?
              <span className="block" style={{ color: '#4F70E2' }}>Here's How to Get Started</span>
            </h2>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Join our community of developers and help make Scribly even better. 
              Contributing to open source has never been easier.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center group"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#4F70E2' }}>1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fork Repository</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Click the "Fork" button on our GitHub repository to create your own copy
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#4F70E2' }}>2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Clone & Setup</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Clone your fork locally and run <code className="bg-gray-800 px-2 py-1 rounded text-xs">npm install</code> to get started
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center group"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#4F70E2' }}>3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Make Changes</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Create a new branch, implement your feature or fix, and test thoroughly
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center group"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(79,112,226,0.2) 0%, rgba(79,112,226,0.1) 100%)'
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#4F70E2' }}>4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Submit PR</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Push your changes and create a Pull Request with a clear description
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(79,112,226,0.05) 100%)'
            }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Quick Start Commands</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Setup Development</h4>
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-gray-400 mb-1"># Clone your fork</div>
                  <div className="text-green-400 break-all">git clone https://github.com/YOUR_USERNAME/scribly.git</div>
                  <div className="text-gray-400 mb-1 mt-3"># Install dependencies</div>
                  <div className="text-green-400">npm install</div>
                  <div className="text-gray-400 mb-1 mt-3"># Start development server</div>
                  <div className="text-green-400">npm run dev</div>
                </div>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3">Contribution Workflow</h4>
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                  <div className="text-gray-400 mb-1"># Create feature branch</div>
                  <div className="text-blue-400 break-all">git checkout -b feature/amazing-feature</div>
                  <div className="text-gray-400 mb-1 mt-3"># Commit your changes</div>
                  <div className="text-blue-400 break-all">git commit -m "Add amazing feature"</div>
                  <div className="text-gray-400 mb-1 mt-3"># Push to your fork</div>
                  <div className="text-blue-400 break-all">git push origin feature/amazing-feature</div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button
                href="https://github.com/your-username/scribly"
                onClick={() => {
                  window.open('https://github.com/VanshSharmaSDE/Scribly', '_blank');
                }}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #4F70E2 0%, #3B59D9 50%, #2A46C7 100%)',
                  boxShadow: '0 8px 32px rgba(79, 112, 226, 0.3)'
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
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
              Join the Open Source Community
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Scribly v0.6.0 is stable and ready for production. Join our thriving 
              community of contributors and help shape the future of note-taking.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/signup">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="group text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #4F70E2 0%, #3B59D9 50%, #2A46C7 100%)',
                    boxShadow: '0 8px 32px rgba(79, 112, 226, 0.3)'
                  }}
                >
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Landing;

