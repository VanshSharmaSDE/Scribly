import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Heart,
  Search,
  Filter,
  Clock,
  User,
  Mail,
  FileText,
  Target,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  Send,
  X,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Breadcrumb from '../components/Breadcrumb';
import featureRequestService from '../services/featureRequestService';
import { useAuth } from '../contexts/AuthContext';

const FeatureInfo = ({ icon: Icon, title, content, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="flex items-start space-x-4"
  >
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: "rgba(79, 112, 226, 0.2)" }}
    >
      <Icon className="h-6 w-6" style={{ color: "#4F70E2" }} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-200">{content}</p>
    </div>
  </motion.div>
);

const RequestFeature = () => {
  const { user } = useAuth();
  const [featureRequests, setFeatureRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feature: '',
    requirement: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  useEffect(() => {
    loadFeatureRequests();
  }, [user]); // Reload when user authentication state changes

  const loadFeatureRequests = async () => {
    try {
      setLoading(true);
      const requests = await featureRequestService.getAllFeatureRequests();
      
      // Add userHasLiked status for each request if user is logged in
      const requestsWithLikeStatus = requests.map(request => ({
        ...request,
        userHasLiked: user && user.email ? featureRequestService.checkUserHasLiked(request, user.email) : false
      }));
      
      setFeatureRequests(requestsWithLikeStatus);
    } catch (error) {
      console.error('Error loading feature requests:', error);
      toast.error('Failed to load feature requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.feature || !formData.requirement) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    
    try {
      const loadingToast = toast.loading('Submitting your feature request...');
      
      await featureRequestService.createFeatureRequest(formData);
      
      toast.dismiss(loadingToast);
      setSubmitStatus("success");
      setFormData({
        name: '',
        email: '',
        feature: '',
        requirement: '',
        description: '',
        priority: 'medium',
        category: 'general'
      });
      toast.success('Feature request submitted successfully!');
      loadFeatureRequests(); // Reload to show new request
    } catch (error) {
      console.error('Error submitting feature request:', error);
      setSubmitStatus("error");
      if (error.message.includes('already have an active')) {
        toast.error('You already have an active feature request. Please wait for it to be processed.');
      } else {
        toast.error('Failed to submit feature request. Please try again.');
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  const handleToggleLike = async (requestId) => {
    if (!user || !user.email) {
      toast.error('Please login to like feature requests');
      return;
    }

    try {
      const updatedRequest = await featureRequestService.toggleLike(requestId, user.email);
      
      // Update the local state
      setFeatureRequests(prev => 
        prev.map(request => 
          request.$id === requestId 
            ? { 
                ...request, 
                likes: updatedRequest.likes, 
                likedBy: updatedRequest.likedBy,
                userHasLiked: updatedRequest.hasLiked 
              }
            : request
        ).sort((a, b) => b.likes - a.likes) // Re-sort by likes
      );

      toast.success(updatedRequest.hasLiked ? 'Feature request liked!' : 'Like removed');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const filteredRequests = featureRequests.filter(request => {
    const matchesSearch = request.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-200 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-200 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-200 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const featureInfo = [
    {
      icon: Lightbulb,
      title: "Feature Requests",
      content: "Submit ideas at help@scribly.tech",
    },
    {
      icon: Target,
      title: "Track GitHub Commits",
      content: "Monitor feature development progress in real-time",
    },
    {
      icon: Heart,
      title: "Community Driven",
      content: "Vote on features that matter to you most",
    },
    {
      icon: Plus,
      title: "Fork & Contribute",
      content: "Add your own features by forking and submitting pull requests",
    },
    {
      icon: CheckCircle,
      title: "Improve Existing",
      content: "Enhance current features through collaborative development",
    },
  ];

  return (
    <ProfessionalBackground>
      {/* Hero Section */}
      <section className="pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Community Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 border"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 112, 226, 0.1) 100%)',
                borderColor: 'rgba(147, 51, 234, 0.3)',
                color: '#9333ea'
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Community Driven • Open Source</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Request a <span className="gradient-text">Feature</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Help us build the features you want. Submit requests, vote on others, and track progress 
              in our open-source community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className='mb-20'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Side - Info */}
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-8">
                  Shape the Future of Scribly
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Your feature requests drive our development. Submit ideas, vote on community 
                  suggestions, and help us prioritize what matters most to users like you.
                </p>
              </motion.div>

              <div className="space-y-8">
                {featureInfo.map((info, index) => (
                  <FeatureInfo
                    key={info.title}
                    {...info}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Feature Request Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-black/40 border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-8">
                Submit Your Request
              </h2>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-green-400">
                      ✅ Feature request submitted successfully! We'll review it and add it to our roadmap.
                    </p>
                  </motion.div>
                )}
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-red-400">
                      ❌ Failed to submit request. Please try again or contact support.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <Input
                  label="Feature Title"
                  name="feature"
                  value={formData.feature}
                  onChange={handleChange}
                  placeholder="Brief title for the feature"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Requirement & Use Case
                  </label>
                  <motion.textarea
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-300 resize-none"
                    placeholder="What do you need and why? Describe the use case..."
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Description
                  </label>
                  <motion.textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-300 resize-none"
                    placeholder="Additional details, examples, or specific requirements..."
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/70 transition-all duration-300"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:bg-gray-700/70 transition-all duration-300"
                    >
                      <option value="general">General</option>
                      <option value="ui-ux">UI/UX Enhancement</option>
                      <option value="performance">Performance</option>
                      <option value="integration">Integration</option>
                      <option value="security">Security</option>
                      <option value="accessibility">Accessibility</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  loading={submitting}
                  className="w-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-500/50 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-lg py-4"
                >
                  {submitting ? 'Submitting Request...' : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Feature Request
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Requests Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Community <span className="gradient-text">Requests</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore features requested by our community. Vote for the ones you want most!
            </p>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search feature requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </motion.div>

          {/* Feature Requests List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading feature requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No feature requests found</h3>
                <p className="text-gray-400">Be the first to request a feature!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredRequests.map((request, index) => (
                  <motion.div
                    key={request.$id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-hover border rounded-2xl p-6"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(79, 112, 226, 0.3)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {request.feature}
                        </h3>
                        <p className="text-gray-300 mb-3">
                          {request.requirement}
                        </p>
                        {request.description && (
                          <p className="text-gray-400 text-sm mb-3">
                            {request.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {/* Debug: Show user status */}
                        {process.env.NODE_ENV === 'development' && (
                          <span className="text-xs text-gray-500 mr-2">
                            User: {user ? 'Logged in' : 'Not logged in'}
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleToggleLike(request.$id)}
                          disabled={!user}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                            request.userHasLiked
                              ? 'bg-green-500/20 border-green-500/30 text-green-200'
                              : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50'
                          } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                          title={!user ? 'Please login to like features' : request.userHasLiked ? 'Remove your like' : 'Like this feature'}
                        >
                          <ThumbsUp className={`w-4 h-4 ${request.userHasLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{request.likes}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status.replace('-', ' ')}</span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                        <span className="capitalize">{request.priority} Priority</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{request.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </ProfessionalBackground>
  );
};

export default RequestFeature;
