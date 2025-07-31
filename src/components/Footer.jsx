import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-black/60 border-t border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">Scribly</h3>
            <p className="text-gray-300 max-w-sm">
              Your personal digital notebook with powerful features for organizing thoughts, ideas, and creativity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 transition-colors duration-300"
                    style={{ 
                      '&:hover': { color: '#4F70E2' }
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#4F70E2'}
                    onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/beta"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Beta
                </Link>
              </li>
              <li>
                <Link
                  to="/future-updates"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Future Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Scribly. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4" style={{ color: '#4F70E2' }} />
              <span>by developers, for creators</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
