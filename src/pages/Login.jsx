import React from 'react'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the intended destination from state
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Signing you in...');
      
      await login(formData);
      
      toast.dismiss(loadingToast);
      toast.success('Welcome back! Login successful', {
        duration: 3000,
      });
      
      // Navigate to intended destination or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials';
      
      // Handle specific Appwrite errors
      if (error.code === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 429) {
        errorMessage = 'Too many login attempts. Please try again later';
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
              Welcome Back
            </h1>
            <p className="text-gray-200 text-lg">
              Sign in to continue to <span className="font-semibold" style={{ color: '#4F70E2' }}>Scribly</span>
            </p>
          </motion.div>

          {/* Login Form */}
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

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              leftIcon={Mail}
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
            />

            <Input
              leftIcon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
            />

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                size="lg"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-400">
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Forgot your password?
              </Link>
            </p>
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default Login;
