import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp, CheckCircle2, XCircle, BarChart3, Download, AlertTriangle } from 'lucide-react';
import taskService from '../services/taskService';
import LoadingSkeleton from './LoadingSkeleton';

const TaskAnalyticsModal = ({ isOpen, onClose, planId, planName, userId, embedded = false, defaultDays = 7 }) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(defaultDays);

  // Custom modal state
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' // 'info', 'error', 'success'
  });

  useEffect(() => {
    if (isOpen && planId) {
      loadAnalytics();
    }
  }, [isOpen, planId, selectedDays]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTaskAnalytics(userId, planId, selectedDays);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic update for day range selection
  const handleDayRangeChange = (days) => {
    setSelectedDays(days);
    // Don't set loading to true for instant UI feedback
    loadAnalytics();
  };

  const getDayLabels = () => {
    const days = [];
    for (let i = selectedDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const getTaskNames = () => {
    const taskNames = new Set();
    Object.values(analyticsData).forEach(dayData => {
      Object.keys(dayData).forEach(taskName => taskNames.add(taskName));
    });
    return Array.from(taskNames);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const calculateCompletionRate = () => {
    const days = getDayLabels();
    const taskNames = getTaskNames();
    let totalTasks = 0;
    let completedTasks = 0;

    days.forEach(day => {
      const dayData = analyticsData[day.date] || {};
      taskNames.forEach(taskName => {
        totalTasks++;
        if (dayData[taskName]?.isCompleted) {
          completedTasks++;
        }
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateOverallCompletion = () => {
    return calculateCompletionRate();
  };

  const downloadAnalyticsData = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set larger canvas for analytics data
      canvas.width = 1400;
      canvas.height = 1000;
      
      // Set background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`Task Analytics - ${selectedDays} Days Report`, 50, 50);
      
      // Add plan name
      ctx.font = '20px Arial';
      ctx.fillText(`Plan: ${planName}`, 50, 90);
      
      // Add date range
      ctx.font = '16px Arial';
      ctx.fillStyle = '#9ca3af';
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (selectedDays - 1));
      ctx.fillText(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 50, 120);
      
      // Add overall completion rate
      const completionRate = calculateOverallCompletion();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(`Overall Completion Rate: ${completionRate}%`, 50, 170);
      
      // Add task breakdown
      const taskNames = getTaskNames();
      const days = getDayLabels();
      
      let yPos = 220;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Daily Task Breakdown:', 50, yPos);
      
      // Create a grid of task completion
      yPos += 40;
      ctx.font = '14px Arial';
      
      // Header row with dates
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('Task \\ Date', 50, yPos);
      days.slice(0, 10).forEach((day, index) => { // Show first 10 days to fit
        const shortDate = day.date.split('-').slice(1).join('/'); // MM/DD format
        ctx.fillText(shortDate, 200 + index * 80, yPos);
      });
      
      // Task rows
      taskNames.forEach((taskName, taskIndex) => {
        yPos += 25;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(taskName.length > 15 ? taskName.substring(0, 12) + '...' : taskName, 50, yPos);
        
        days.slice(0, 10).forEach((day, dayIndex) => {
          const dayData = analyticsData[day.date] || {};
          const isCompleted = dayData[taskName]?.isCompleted;
          
          ctx.fillStyle = isCompleted ? '#10b981' : '#ef4444';
          ctx.fillText(isCompleted ? '✓' : '✗', 200 + dayIndex * 80, yPos);
        });
      });
      
      // Add summary statistics
      yPos += 60;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Summary Statistics:', 50, yPos);
      
      // Calculate stats
      let totalPossibleTasks = 0;
      let actualCompletedTasks = 0;
      let perfectDays = 0;
      
      days.forEach(day => {
        const dayData = analyticsData[day.date] || {};
        const dayTasks = Object.values(dayData);
        const dayCompleted = dayTasks.filter(task => task.isCompleted).length;
        
        totalPossibleTasks += taskNames.length;
        actualCompletedTasks += dayCompleted;
        
        if (dayCompleted === taskNames.length && taskNames.length > 0) {
          perfectDays++;
        }
      });
      
      yPos += 30;
      ctx.font = '14px Arial';
      ctx.fillText(`Perfect Days: ${perfectDays}/${selectedDays}`, 70, yPos);
      yPos += 25;
      ctx.fillText(`Total Tasks Completed: ${actualCompletedTasks}/${totalPossibleTasks}`, 70, yPos);
      yPos += 25;
      ctx.fillText(`Average Daily Completion: ${totalPossibleTasks > 0 ? Math.round((actualCompletedTasks / totalPossibleTasks) * 100) : 0}%`, 70, yPos);
      
      // Download
      const link = document.createElement('a');
      link.download = `task-analytics-${selectedDays}days-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
    } catch (error) {
      console.error('Error downloading analytics data:', error);
      setCustomModal({
        isOpen: true,
        title: 'Download Error',
        message: 'Failed to download analytics data. Please try again.',
        type: 'error'
      });
    }
  };

  if (!isOpen) return null;

  if (loading) {
    const skeletonContent = (
      <div className="space-y-6">
        <LoadingSkeleton variant="title" className="w-64" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="button" className="w-20" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingSkeleton key={i} variant="default" className="h-12 w-full" />
          ))}
        </div>
      </div>
    );

    if (embedded) {
      return skeletonContent;
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            {skeletonContent}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                Task Analytics
              </h2>
              <p className="text-gray-400 mt-1">{planName}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                value={selectedDays}
                onChange={(e) => handleDayRangeChange(parseInt(e.target.value))}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last 1 year</option>
              </select>
              
              {/* Download Button */}
              <button
                onClick={downloadAnalyticsData}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm"
                title="Download Analytics as PNG"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Completion Rate</p>
                      <p className="text-2xl font-bold text-white">{calculateCompletionRate()}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Tasks</p>
                      <p className="text-2xl font-bold text-white">{getTaskNames().length}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Days Tracked</p>
                      <p className="text-2xl font-bold text-white">{selectedDays}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Analytics Grid */}
              {getTaskNames().length > 0 ? (
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Task Completion Timeline</h3>
                  
                  {/* Table Header */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50">
                          <th className="text-left py-3 px-4 text-gray-300 font-medium">Task Name</th>
                          {getDayLabels().map(day => (
                            <th key={day.date} className="text-center py-3 px-2 text-gray-300 font-medium min-w-[80px]">
                              <div className="text-xs">{day.label}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getTaskNames().map((taskName, taskIndex) => {
                          // Get priority from the most recent entry
                          let taskPriority = 'medium';
                          Object.values(analyticsData).forEach(dayData => {
                            if (dayData[taskName]) {
                              taskPriority = dayData[taskName].priority || 'medium';
                            }
                          });

                          return (
                            <motion.tr
                              key={taskName}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: taskIndex * 0.1 }}
                              className="border-b border-gray-700/30 hover:bg-gray-800/20"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-3">
                                  <span className="text-white font-medium">{taskName}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(taskPriority)}`}>
                                    {taskPriority}
                                  </span>
                                </div>
                              </td>
                              {getDayLabels().map(day => {
                                const dayData = analyticsData[day.date];
                                const taskData = dayData?.[taskName];
                                
                                return (
                                  <td key={day.date} className="py-4 px-2 text-center">
                                    {taskData !== undefined ? (
                                      taskData.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                                      ) : (
                                        <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                      )
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-gray-700/50 mx-auto" />
                                    )}
                                  </td>
                                );
                              })}
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Analytics Data</h3>
                  <p className="text-gray-500">Start completing tasks to see your analytics here.</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Custom Modal */}
      {customModal.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setCustomModal({ ...customModal, isOpen: false })}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                {customModal.type === 'error' && (
                  <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                )}
                {customModal.type === 'success' && (
                  <CheckCircle2 className="w-6 h-6 text-green-400 mr-3" />
                )}
                {customModal.type === 'info' && (
                  <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
                )}
                <h3 className="text-lg font-semibold text-white">{customModal.title}</h3>
              </div>
              
              <p className="text-gray-300 mb-6">{customModal.message}</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setCustomModal({ ...customModal, isOpen: false })}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-colors
                    ${customModal.type === 'error' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : customModal.type === 'success'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                  `}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskAnalyticsModal;
