import { motion } from 'framer-motion';
import { Users, Target, Heart, Award } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const StatCard = ({ number, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className="text-center"
  >
    <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#4F70E2' }}>
      {number}
    </div>
    <div className="text-gray-200">{label}</div>
  </motion.div>
);

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
  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '1M+', label: 'Notes Created' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.9★', label: 'User Rating' },
  ];

  const values = [
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              About <span className="gradient-text">Scribly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We believe that every great idea deserves a beautiful home. Scribly was born 
              from the need for a note-taking app that combines powerful functionality with 
              stunning design.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                {...stat}
                delay={index * 0.1}
              />
            ))}
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
                Our team of designers and developers came together with a shared vision: to create 
                the perfect digital notebook that feels as natural as writing on paper, but with 
                all the advantages of modern technology.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-300 text-lg leading-relaxed"
              >
                Today, Scribly is trusted by creators, students, professionals, and dreamers 
                around the world. We're just getting started on our mission to revolutionize 
                how people capture and organize their thoughts.
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              Join Our Journey
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We're always looking for passionate individuals who share our vision. 
              Come help us build the future of note-taking.
            </p>
            <motion.a
              href="mailto:careers@scribly.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-white"
              style={{
                backgroundColor: '#4F70E2',
                '&:hover': {
                  backgroundColor: '#3A5BC7'
                }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#3A5BC7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4F70E2'}
            >
              View Open Positions
            </motion.a>
          </motion.div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default About;
