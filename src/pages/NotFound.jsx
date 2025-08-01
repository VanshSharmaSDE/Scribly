import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, FileText } from 'lucide-react';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';

const NotFound = () => {
  return (
    <ProfessionalBackground>
      <div className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-lg mx-auto">
          {/* Simple 404 Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-8xl font-bold mb-4" style={{ color: '#4F70E2' }}>404</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/">
              <Button 
                variant="primary"
                className="px-6 py-3 flex item-center text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #4F70E2 0%, #3B59D9 50%, #2A46C7 100%)',
                  boxShadow: '0 8px 32px rgba(79, 112, 226, 0.3)'
                }}
              >
                <Home className="h-5 w-5 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default NotFound;

