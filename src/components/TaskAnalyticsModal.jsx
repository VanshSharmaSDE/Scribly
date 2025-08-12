import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, CheckSquare, Square } from 'lucide-react';
import taskService from '../services/taskService';
import Button from './Button';

const TaskAnalyticsModal = ({ isOpen, onClose, userId, reloadTrigger = 0 }) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await taskService.getTaskAnalytics(userId);
      setAnalytics(data);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const stats = useMemo(() => ({
    totalCreated: analytics?.totalCreated || 0,
    totalCompleted: analytics?.totalCompleted || 0,
    totalUncompleted: analytics?.totalUncompleted || 0,
    totalDeleted: analytics?.totalDeleted || 0,
    dailyCompleted: analytics?.dailyCompleted || 0,
  }), [analytics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-semibold">Task Analytics</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadAnalytics}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalCreated}</div>
              <div className="text-sm text-gray-400">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalCompleted}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.totalUncompleted}</div>
              <div className="text-sm text-gray-400">Unmarked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.totalDeleted}</div>
              <div className="text-sm text-gray-400">Deleted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.dailyCompleted}</div>
              <div className="text-sm text-gray-400">Daily Reset</div>
            </div>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                ✅ Completed Actions ({analytics?.completedTasks?.length || 0})
              </h4>
              <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 max-h-80 overflow-y-auto space-y-2">
                {(analytics?.completedTasks || []).slice().reverse().slice(0, 50).map((task, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">{task.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)} border`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.completedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(task.completedAt).toLocaleDateString()} {new Date(task.completedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                ))}
                {(!analytics || loading) && (
                  <div className="text-center py-4 text-gray-400">Loading…</div>
                )}
              </div>
            </div>

            {/* Uncompleted */}
            <div>
              <h4 className="text-md font-medium text-white mb-3">
                ⏹️ Unmarked Actions ({analytics?.uncompletedTasks?.length || 0})
              </h4>
              <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 max-h-80 overflow-y-auto space-y-2">
                {(analytics?.uncompletedTasks || []).slice().reverse().slice(0, 50).map((task, i) => (
                  <div key={i} className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <Square className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-gray-300">{task.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)} border`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.uncompletedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(task.uncompletedAt).toLocaleDateString()} {new Date(task.uncompletedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                ))}
                {(!analytics || loading) && (
                  <div className="text-center py-4 text-gray-400">Loading…</div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Reset History */}
          <div>
            <h4 className="text-md font-medium text-white mb-3">Daily Reset History ({analytics?.dailyResetTasks?.length || 0} days)</h4>
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 max-h-80 overflow-y-auto space-y-3">
              {(analytics?.dailyResetTasks || []).slice().reverse().slice(0, 30).map((batch, idx) => (
                <div key={idx} className="bg-gray-700/30 rounded p-2">
                  <div className="text-sm font-medium text-purple-400 mb-1">
                    {batch.date} ({batch.tasks?.length || 0} tasks completed)
                  </div>
                  <div className="space-y-1">
                    {(batch.tasks || []).slice(0, 5).map((task, i) => (
                      <div key={i} className="flex items-center space-x-2 ml-4">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-xs text-gray-300">{task.title}</span>
                        <span className={`px-1 py-0.5 text-xs rounded ${getPriorityColor(task.priority)} border`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                    {batch.tasks && batch.tasks.length > 5 && (
                      <div className="text-xs text-gray-500 ml-6">+{batch.tasks.length - 5} more tasks</div>
                    )}
                  </div>
                </div>
              ))}
              {(!analytics || loading) && (
                <div className="text-center py-4 text-gray-400">Loading…</div>
              )}
            </div>
          </div>

          {analytics?.lastUpdated && (
            <div className="text-xs text-gray-500 text-center">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TaskAnalyticsModal;
