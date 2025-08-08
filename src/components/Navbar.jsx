import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, PenTool, User, LogOut, Home, Layout, Sparkles } from 'lucide-react';
import Button from './Button';

const Navbar = ({ isAuthenticated = false, user = null, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic navigation based on authentication
  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: Layout },
        { name: 'About', path: '/about' },
        { name: 'Request Feature', path: '/request-feature' },
        { name: 'Report Bug', path: '/report-bug' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Request Feature', path: '/request-feature' },
        { name: 'Report Bug', path: '/report-bug' },
      ];

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
      navigate('/');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        borderBottomColor: 'rgba(79, 112, 226, 0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <PenTool className="h-8 w-8" style={{ color: '#4F70E2' }} />
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">Scribly</span>
              <span 
                className="px-2 py-1 rounded-full text-xs font-semibold flex items-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(79, 112, 226, 0.2) 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  color: '#9333ea'
                }}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                v0.6.3
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 font-medium ${
                  location.pathname === link.path ? 'text-white' : ''
                }`}
                style={{
                  color: location.pathname === link.path ? '#4F70E2' : undefined
                }}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-700/50"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 ${
                    location.pathname === link.path ? 'text-blue-400' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700/50">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

