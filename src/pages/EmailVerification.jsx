import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, user } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'resend'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debug the full URL first

    // Get the secret from URL - Appwrite typically uses 'secret' parameter
    const secret = searchParams.get('secret');
    const userId = searchParams.get('userId');

    // If we have a secret from URL, use it for verification
    if (secret) {

      handleVerification(userId, secret);
    } else {

      for (const [key, value] of searchParams.entries()) {

      }
      setStatus('error');
    }
  }, [searchParams]);

  const handleVerification = async (userId, secret) => {
    try {
      setIsLoading(true);

      // Pass both parameters to verifyEmail
      const result = await verifyEmail(userId, secret);

      setStatus('success');
      
      // Show success message
      toast.success(result.message || 'Email verified successfully!', {
        duration: 3000,
      });
      
      // Redirect based on result
      if (result.needsLogin) {
        // User needs to login after verification
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (result.user) {
        // User is already logged in, go to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Default: go to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (error) {

      setStatus('error');
      toast.error(error.message || 'Email verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      // This would call authService.sendEmailVerification()
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Verification email sent! Check your inbox.', {
        duration: 5000,
      });
      
    } catch (error) {

      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <RefreshCw className="h-16 w-16 text-blue-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h2>
            <p className="text-gray-300">Please wait while we verify your email address...</p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-300 mb-6">
              Your email has been verified. You now have full access to Scribly.
            </p>
            <p className="text-sm text-gray-400">Redirecting to dashboard in 3 seconds...</p>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-gray-300 mb-6">
              The verification link is invalid or has expired. Please request a new verification email.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                loading={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
              >
                Send New Verification Email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white py-3 rounded-xl border border-gray-600 hover:border-gray-500">
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        );

      case 'resend':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-6">
              <Mail className="h-16 w-16 text-blue-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-gray-300 mb-6">
              We've sent you a verification email. Click the link in the email to verify your account.
            </p>
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Didn't receive the email?</strong> Check your spam folder or request a new verification email.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                loading={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
              >
                Resend Verification Email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white py-3 rounded-xl border border-gray-600 hover:border-gray-500">
                  Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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
              Email Verification
            </h1>
            <p className="text-gray-200 text-lg">
              Verify your email to access <span className="font-semibold" style={{ color: '#4F70E2' }}>Scribly</span>
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default EmailVerification;

