import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckSquare, Square, Trash2, Plus, BarChart3, X } from 'lucide-react';
import taskService from '../services/taskService';
import Button from './Button';
import TaskAnalyticsModal from './TaskAnalyticsModal';

const TaskTracker = ({ isOpen, onClose, user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsReload, setAnalyticsReload] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      fetchTasks();
      fetchAnalytics();
    }
  }, [isOpen, user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await taskService.getUserTasks(user.$id);
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
      console.log('Fetching analytics for user:', user.$id);
      const analyticsData = await taskService.getTaskAnalytics(user.$id);
      console.log('Analytics data received:', analyticsData);
      setAnalytics(analyticsData);
      // also nudge modal to reload when open
      setAnalyticsReload((c) => c + 1);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (!user || !user.$id) {
      toast.error('User not authenticated');
      console.error('User object is missing or invalid:', user);
      return;
    }

    const taskTitle = newTaskTitle.trim();
    const taskPriority = newTaskPriority;

    // Clear form immediately for better UX
    setNewTaskTitle('');
    setNewTaskPriority('medium');

    try {
      console.log('Creating task with data:', {
        title: taskTitle,
        priority: taskPriority,
        userId: user.$id
      });

      const newTask = await taskService.createTask({
        title: taskTitle,
        priority: taskPriority,
        userId: user.$id
      });

      console.log('Task created successfully:', newTask);

      if (newTask && newTask.$id) {
        // Add the new task to the list
        setTasks(prev => [...prev, newTask]);
        toast.success('Task created successfully!');
        
        // Fetch updated analytics
        fetchAnalytics();
      } else {
        console.error('Created task is missing $id:', newTask);
        toast.error('Task created but missing ID');
        // Restore form values if task creation failed
        setNewTaskTitle(taskTitle);
        setNewTaskPriority(taskPriority);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      // Restore form values if task creation failed
      setNewTaskTitle(taskTitle);
      setNewTaskPriority(taskPriority);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    // Optimistic update - update UI immediately
    setTasks(prev => 
      prev.map(task => 
        task.$id === taskId 
          ? { ...task, completed }
          : task
      )
    );
    
    if (completed) {
      toast.success('Task completed! 🎉');
    } else {
      toast.success('Task unmarked');
    }

    try {
      await taskService.toggleTask(taskId, completed);
      // Update analytics immediately after successful toggle
      fetchAnalytics();
    } catch (error) {
      // Revert the optimistic update if the request failed
      setTasks(prev => 
        prev.map(task => 
          task.$id === taskId 
            ? { ...task, completed: !completed }
            : task
        )
      );
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Store the task for potential rollback
    const taskToDelete = tasks.find(task => task.$id === taskId);
    
    // Optimistic update - remove task immediately from UI
    setTasks(prev => prev.filter(task => task.$id !== taskId));
    toast.success('Task deleted');

    try {
      await taskService.deleteTask(taskId);
      // Update analytics immediately after successful deletion
      fetchAnalytics();
    } catch (error) {
      // Restore the task if deletion failed
      if (taskToDelete) {
        setTasks(prev => [...prev, taskToDelete]);
      }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Task Tracker</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAnalytics(true)}
              variant="outline"
              className="border-gray-600 flex items-center text-gray-400 hover:bg-gray-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button 
              type="submit" 
              disabled={!newTaskTitle.trim()}
              className="bg-blue-600 flex items-center hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </form>

        {/* Tasks List (scrollable) */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No tasks yet</p>
              <p className="text-gray-500 text-sm">Create your first task above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.$id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                      task.completed 
                        ? 'bg-gray-800/30 border-gray-700/50' 
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.$id, !task.completed)}
                      className={`transition-colors duration-200 ${
                        task.completed ? 'text-green-400' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {task.completed ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <span className={`block transition-all duration-200 ${
                        task.completed 
                          ? 'line-through text-gray-500' 
                          : 'text-white'
                      }`}>
                        {task.title}
                      </span>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTask(task.$id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analytics Modal */}
      <TaskAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        userId={user?.$id}
        reloadTrigger={analyticsReload}
      />
    </div>
  );
}

export default TaskTracker;
