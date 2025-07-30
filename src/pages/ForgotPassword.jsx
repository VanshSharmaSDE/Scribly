import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const ForgotPassword = () => {
  const { sendPasswordRecovery } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRecovery = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email || !validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const loadingToast = toast.loading('Sending recovery email...');
      
      await sendPasswordRecovery(email);
      
      toast.dismiss(loadingToast);
      toast.success('Password recovery email sent! Check your inbox.', {
        duration: 5000,
      });
      
      setEmailSent(true);
      
    } catch (error) {
      console.error('Send recovery error:', error);
      toast.error('Failed to send recovery email. Please try again.');
      setErrors({ general: 'Failed to send recovery email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <ProfessionalBackground>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-blue-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Check Your Email
              </h1>
              
              <p className="text-gray-300 mb-2">
                We've sent a password reset link to:
              </p>
              
              <p className="text-blue-400 font-medium mb-6">
                {email}
              </p>
              
              <p className="text-gray-400 text-sm mb-8">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setEmailSent(false)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white border-0"
                >
                  Send Another Email
                </Button>
                
                <Link to="/login">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  return (
    <ProfessionalBackground>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Forgot Password?
            </h1>
            <p className="text-gray-200 text-lg">
              Enter your email and we'll send you a reset link
            </p>
          </motion.div>

          {/* Forgot Password Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          >
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6"
              >
                <p className="text-red-400 text-sm">{errors.general}</p>
              </motion.div>
            )}

            <form onSubmit={handleSendRecovery} className="space-y-6">
              <Input
                leftIcon={Mail}
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="Enter your email address"
                error={errors.email}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                  size="lg"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-gray-400 hover:text-blue-400 transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default ForgotPassword;
