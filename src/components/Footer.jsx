import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Heart, Mail, Star, GitFork } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './Button';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubscribing(true);
    
    // Simulate API call for email subscription
    try {
      // In a real implementation, you'd call your backend API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Successfully subscribed for updates!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-black/60 border-t border-white/20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Brand, Description & GitHub */}
          <div className="space-y-6">
            {/* Brand & Description */}
            <div className="space-y-4">
              <h3 className="text-3xl font-bold gradient-text">Scribly</h3>
              <p className="text-gray-300 text-lg max-w-lg">
                Open-source digital notebook for organizing thoughts, ideas, and creativity. 
                Built by developers, for everyone.
              </p>
            </div>

            {/* GitHub Section */}
            <div className="space-y-4">
              <Button
                href="https://github.com/VanshSharmaSDE/Scribly"
                onClick={() => {
                  window.open('https://github.com/VanshSharmaSDE/Scribly', '_blank');
                }}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
                  boxShadow: '0 8px 32px rgba(55, 65, 81, 0.3)',
                  border: '1px solid rgba(107, 114, 128, 0.3)'
                }}
              >
                <Github className="h-5 w-5" />
                <span>Star on GitHub</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Give us a star!</span>
                </div>
              </Button>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <GitFork className="h-4 w-4" />
                  <span>Open Source</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span>Community Driven</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Email Subscription */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-2xl font-semibold text-white">Stay Updated</h4>
              <p className="text-gray-400">
                Get notified about new features, updates, and releases
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 z-10 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/70 transition-all duration-300 text-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubscribing}
                loading={isSubscribing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500/50 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-lg"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Scribly. Open source under MIT License.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-blue-400" />
              <span>for the community</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

