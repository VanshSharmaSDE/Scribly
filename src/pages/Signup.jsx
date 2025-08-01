import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false); // New state for email sent
  const [userEmail, setUserEmail] = useState(''); // Store user email for display
  
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      toast.error('Please fix the errors below');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');
      
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        // Set email sent state and store user email
        setUserEmail(formData.email);
        setEmailSent(true);
        
        // Clear form data for security
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
      
    } catch (error) {

      let errorMessage = 'Signup failed. Please try again.';
      
      // Handle specific Appwrite errors
      if (error.code === 409) {
        errorMessage = 'An account with this email already exists';
        setErrors({ email: errorMessage });
      } else if (error.code === 400) {
        errorMessage = 'Invalid email or password format';
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

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
              Join <span className="gradient-text">Scribly</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Create your account and start organizing your ideas
            </p>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl"
          >
            {emailSent ? (
              // Email Sent Success State
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <Check className="w-10 h-10 text-green-400" />
                </motion.div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-300 mb-4">
                    We've sent a verification link to
                  </p>
                  <p className="text-blue-400 font-medium text-lg mb-6">
                    {userEmail}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click the verification link in your email to activate your account and access the dashboard.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setUserEmail('');
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Back to Signup
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-gray-400">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Signup Form
              <>
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
              leftIcon={User}
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              error={errors.name}
            />

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
              placeholder="Create a password"
              error={errors.password}
            />

            {/* Password Requirements */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-700/30"
              >
                <p className="text-sm text-gray-300 font-medium">Password requirements:</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check
                      className={`h-4 w-4 ${
                        req.met ? 'text-green-400' : 'text-gray-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        req.met ? 'text-green-300' : 'text-gray-400'
                      }`}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            <Input
              leftIcon={Lock}
              rightIcon={showConfirmPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  Create Account
                </>
              )}
            </Button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default Signup;

