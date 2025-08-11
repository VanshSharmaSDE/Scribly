import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  ChevronDown,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import taskService from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TaskTracker = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      handleDailyReset();
      fetchUserTasks();
      fetchAnalytics();
    }
  }, [isOpen, user]);

  const handleDailyReset = async () => {
    try {
      const wasReset = await taskService.checkAndResetIfNewDay(user.$id);
      if (wasReset) {
        toast.info('Tasks reset for the new day!');
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  };

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await taskService.getUserTasks(user.$id);
      console.log('Fetched user tasks:', userTasks);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await taskService.getTaskAnalytics(user.$id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const task = await taskService.createTask({
        title: newTask.trim(),
        priority: newTaskPriority,
        userId: user.$id
      });

      console.log('Task created:', task);

      // Refresh tasks from database
      await fetchUserTasks();
      
      setNewTask('');
      setNewTaskPriority('medium');
      toast.success('Task created successfully!');
      
      // Refresh analytics
      fetchAnalytics();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await taskService.toggleTask(taskId, completed);
      setTasks(prev => 
        prev.map(task => 
          task.$id === taskId 
            ? { ...task, completed }
            : task
        )
      );
      
      if (completed) {
        toast.success('Task completed! 🎉');
      }
      
      // Refresh analytics
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.$id !== taskId));
      toast.success('Task deleted');
      
      // Refresh analytics since task count changed
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Tasks</h2>
              <p className="text-sm text-gray-400">
                Today • {getCompletionRate()}% Complete • {tasks.length} Task Templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-sm text-gray-400">Task Templates</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {tasks.filter(task => task.completed).length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((tasks.filter(task => task.completed).length / Math.max(tasks.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Today Progress</div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task template..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/10"
                maxLength={100}
              />
            </div>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="space-y-3 mb-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No task templates yet. Create your first template above!</p>
              <p className="text-xs mt-2">Templates will appear as daily tasks that reset each day.</p>
            </div>
          ) : (
            <AnimatePresence>
              {tasks.map((task) => (
                <motion.div
                  key={task.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleTask(task.$id, !task.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-400 hover:border-green-500'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        task.completed 
                          ? 'text-gray-400 line-through' 
                          : 'text-white'
                      }`}>
                        {task.title}
                      </p>
                      {task.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed at {new Date(task.completedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <div className={`px-2 py-1 rounded-lg border text-xs font-medium flex items-center space-x-1 ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)}
                      <span className="capitalize">{task.priority}</span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.$id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Analytics Toggle */}
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>View Analytics</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${showAnalytics ? 'rotate-180' : ''}`} />
        </button>

        {/* Analytics Section */}
        <AnimatePresence>
          {showAnalytics && analytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Tasks Card */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">
                    {Object.values(analytics).reduce((sum, day) => sum + day.total, 0)}
                  </div>
                  <div className="text-sm text-blue-300">Total Tasks</div>
                  <div className="text-xs text-blue-200 mt-1">Last 30 days</div>
                </div>

                {/* Completed Tasks Card */}
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-xl border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">
                    {Object.values(analytics).reduce((sum, day) => sum + day.completed, 0)}
                  </div>
                  <div className="text-sm text-green-300">Completed</div>
                  <div className="text-xs text-green-200 mt-1">
                    {Object.values(analytics).length > 0 ? 
                      Math.round((Object.values(analytics).reduce((sum, day) => sum + day.completed, 0) / 
                                Object.values(analytics).reduce((sum, day) => sum + day.total, 0)) * 100) : 0}% success rate
                  </div>
                </div>

                {/* Current Streak Card */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-xl border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">
                    {(() => {
                      const sortedDates = Object.keys(analytics).sort((a, b) => new Date(b) - new Date(a));
                      let streak = 0;
                      for (const date of sortedDates) {
                        const dayData = analytics[date];
                        if (dayData.total > 0 && dayData.completed === dayData.total) {
                          streak++;
                        } else {
                          break;
                        }
                      }
                      return streak;
                    })()}
                  </div>
                  <div className="text-sm text-purple-300">Day Streak</div>
                  <div className="text-xs text-purple-200 mt-1">100% completion</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Recent Activity
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(analytics)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .slice(0, 7)
                    .map(([date, data]) => (
                      <div key={date} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">{data.completed}/{data.total}</span>
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  data.total > 0 && data.completed === data.total ? 'bg-green-500' : 
                                  data.completed > 0 ? 'bg-yellow-500' : 'bg-gray-600'
                                }`}
                                style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` }}
                              />
                            </div>
                            {data.total > 0 && data.completed === data.total && (
                              <div className="text-green-400 text-xs">✓</div>
                            )}
                          </div>
                        </div>
                        {data.tasks && data.tasks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {data.tasks.map((task, index) => (
                              <span 
                                key={index} 
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                  task.completed 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                              >
                                {task.completed && <span className="mr-1">✓</span>}
                                {task.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TaskTracker;
