import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    // Check if required parameters are present
    if (!userId || !secret) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
    }
  }, [userId, secret, navigate]);

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validation
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error('Please fix the errors below');
      return;
    }

    try {
      const loadingToast = toast.loading('Resetting your password...');
      
      await resetPassword(userId, secret, newPassword);
      
      toast.dismiss(loadingToast);
      toast.success('Password reset successfully!');
      
      setIsSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successfully. Please login with your new password.' }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        errorMessage = 'This reset link has expired or is invalid. Please request a new password reset.';
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Password Reset Successfully!
              </h1>
              
              <p className="text-gray-300 mb-8">
                Your password has been updated. You will be redirected to the login page in a moment.
              </p>
              
              <Link to="/login">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0">
                  Go to Login
                </Button>
              </Link>
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
              Reset Password
            </h1>
            <p className="text-gray-200 text-lg">
              Enter your new password below
            </p>
          </motion.div>

          {/* Reset Password Form */}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                }}
                placeholder="Enter your new password"
                error={errors.newPassword}
              />

              <Input
                leftIcon={Lock}
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Confirm your new password"
                error={errors.confirmPassword}
              />

              {/* Password Requirements */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(newPassword) ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    One number
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                  size="lg"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default ResetPassword;
