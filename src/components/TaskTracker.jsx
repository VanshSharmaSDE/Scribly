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
  TrendingUp
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
  const [streak, setStreak] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchTodayTasks();
      fetchAnalytics();
      fetchStreak();
    }
  }, [isOpen, user]);

  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      const todayTasks = await taskService.getTodayTasks(user.$id);
      setTasks(todayTasks);
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

  const fetchStreak = async () => {
    try {
      const streakCount = await taskService.getCompletionStreak(user.$id);
      setStreak(streakCount);
    } catch (error) {
      console.error('Error fetching streak:', error);
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

      setTasks(prev => [task, ...prev]);
      setNewTask('');
      setNewTaskPriority('medium');
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await taskService.toggleTaskCompletion(taskId, completed);
      setTasks(prev => 
        prev.map(task => 
          task.$id === taskId 
            ? { ...task, completed, completedAt: completed ? new Date().toISOString() : null }
            : task
        )
      );
      
      if (completed) {
        toast.success('Task completed! 🎉');
      }
      
      // Refresh analytics and streak
      fetchAnalytics();
      fetchStreak();
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
                Today • {getCompletionRate()}% Complete
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
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {tasks.filter(task => task.completed).length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">{streak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
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
                placeholder="Add a new task..."
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
              <p>No tasks for today. Add your first task above!</p>
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
              className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Last 30 Days</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(analytics)
                  .sort(([a], [b]) => new Date(b) - new Date(a))
                  .slice(0, 10)
                  .map(([date, data]) => (
                    <div key={date} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{new Date(date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{data.completed}/{data.total}</span>
                        <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${(data.completed / data.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TaskTracker;
