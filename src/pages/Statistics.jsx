import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Users, FileText, Share2, Star, TrendingUp, Calendar, Database } from 'lucide-react';
import ProfessionalBackground from '../components/ProfessionalBackground';
import Button from '../components/Button';
import statisticsService from '../services/statisticsService';

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </motion.div>
  );
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getAllStatistics();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      // Keep existing stats if error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading && !stats) {
    return (
      <ProfessionalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </ProfessionalBackground>
    );
  }

  return (
    <ProfessionalBackground>
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">App Statistics</h1>
              <p className="text-gray-400">Real-time data from Appwrite</p>
              {lastUpdated && (
                <p className="text-gray-500 text-sm mt-1">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            <Button
              onClick={loadStatistics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Active Users"
                value={statisticsService.formatNumber(stats.activeUsers)}
                subtitle="Users who created notes in last 30 days"
                color="blue"
              />
              <StatCard
                icon={FileText}
                title="Total Notes"
                value={statisticsService.formatNumber(stats.totalNotes)}
                subtitle="All notes created in the platform"
                color="green"
              />
              <StatCard
                icon={Share2}
                title="Shared Links"
                value={statisticsService.formatNumber(stats.totalSharedLinks)}
                subtitle="Total sharing links created"
                color="purple"
              />
              <StatCard
                icon={Star}
                title="User Rating"
                value={stats.userRating}
                subtitle="Calculated from usage patterns"
                color="orange"
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <Database className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Data Sources</h3>
              </div>
              <div className="space-y-2 text-gray-300">
                <p>• Notes Collection: Real-time note count</p>
                <p>• Users Collection: Total registered users</p>
                <p>• Share Links Collection: Sharing statistics</p>
                <p>• Activity Analysis: Recent user engagement</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Update Frequency</h3>
              </div>
              <div className="space-y-2 text-gray-300">
                <p>• Statistics cache: 5 minutes</p>
                <p>• Landing page: On page load</p>
                <p>• About page: On page load</p>
                <p>• Manual refresh: Available</p>
              </div>
            </motion.div>
          </div>

          {/* Access Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          >
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> This page shows real-time statistics from your Appwrite database. 
              The same data is displayed on the Landing and About pages with caching for better performance.
            </p>
          </motion.div>
        </div>
      </div>
    </ProfessionalBackground>
  );
};

export default Statistics;
