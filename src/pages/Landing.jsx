import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Zap, Shield, Users, ArrowRight, BookOpen, Star, ChevronRight, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../contexts/AuthContext';

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

const StatCard = ({ number, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="text-center"
  >
    <div className="text-4xl font-bold text-white mb-2">{number}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </motion.div>
);

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreateWithAI = () => {
    // Only authenticated users can access this now
    navigate('/dashboard');
  };

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your Ideas,
              <span className="block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent pb-3">
                Beautifully Organized
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-100 mb-12 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Experience the future of note-taking with Scribly. Clean, intuitive, and powerful.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {isAuthenticated ? (
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
                  Create with AI
                </Button>
              ) : (
                <>
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
                      Start Writing
                    </Button>
                  </Link>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10K+" label="Active Users" delay={0.1} />
            <StatCard number="50K+" label="Notes Created" delay={0.2} />
            <StatCard number="99.9%" label="Uptime" delay={0.3} />
            <StatCard number="4.9★" label="User Rating" delay={0.4} />
          </div>
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
              Everything you need to
              <span className="block" style={{ color: '#4F70E2' }}>stay organized</span>
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Powerful features designed to enhance your productivity and creativity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={PenTool}
              title="Rich Text Editor"
              description="Write with style using our intuitive rich text editor. Support for markdown, formatting, and real-time collaboration."
              delay={0.1}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="Experience instant sync and blazing fast performance. Your notes are always up-to-date across all devices."
              delay={0.2}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="End-to-end encryption ensures your thoughts remain private. Your data is protected with enterprise-grade security."
              delay={0.3}
            />
            <FeatureCard
              icon={BookOpen}
              title="Smart Organization"
              description="Intelligent categorization and powerful search help you find any note instantly. Never lose a thought again."
              delay={0.4}
            />
            <FeatureCard
              icon={Users}
              title="Team Collaboration"
              description="Share notebooks and collaborate in real-time. Perfect for teams, students, and creative professionals."
              delay={0.5}
            />
            <FeatureCard
              icon={Star}
              title="Premium Experience"
              description="Beautiful, distraction-free interface designed for focus. Dark mode, custom themes, and more."
              delay={0.6}
            />
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
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already transformed their note-taking experience.
            </p>
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
                Start Free Trial 
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default Landing;
