import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  BarChart3, 
  AlertTriangle,
  Target,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';
import Button from './Button';
import taskService from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import TaskAnalyticsModal from './TaskAnalyticsModal';
import LoadingSkeleton from './LoadingSkeleton';

const TaskTracker = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBetaWarning, setShowBetaWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Form state
  const [planName, setPlanName] = useState('');
  const [tasks, setTasks] = useState([
    { taskName: '', priority: 'medium' }
  ]); // Array of task objects with name and priority

  // Custom modal state
  const [customModal, setCustomModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' // 'info', 'error', 'success'
  });

  useEffect(() => {
    if (isOpen && user) {
      loadActivePlan();
    }
  }, [isOpen, user]);

  const loadActivePlan = async () => {
    try {
      setLoading(true);
      const plan = await taskService.getActivePlan(user.$id);
      setActivePlan(plan);
    } catch (error) {
      console.error('Error loading active plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setShowBetaWarning(true);
  };

  const confirmCreatePlan = () => {
    setShowBetaWarning(false);
    setShowCreateModal(true);
  };

  const addTask = () => {
    setTasks([...tasks, { taskName: '', priority: 'medium' }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = tasks.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    );
    setTasks(updatedTasks);
  };

  const submitPlan = async () => {
    try {
      if (!planName.trim()) {
        setCustomModal({
          isOpen: true,
          title: 'Validation Error',
          message: 'Please enter a plan name',
          type: 'error'
        });
        return;
      }

      const validTasks = tasks.filter(task => task.taskName.trim());
      if (validTasks.length === 0) {
        setCustomModal({
          isOpen: true,
          title: 'Validation Error',
          message: 'Please add at least one task',
          type: 'error'
        });
        return;
      }

      // Show creating state and close modal
      setCreatingPlan(true);
      setShowCreateModal(false);
      setPlanName('');
      setTasks([{ taskName: '', priority: 'medium' }]);

      // Create plan in background
      await taskService.createPlan(user.$id, {
        planName: planName.trim(),
        tasks: validTasks
      });

      // Refresh plan data
      await loadActivePlan();
      setCreatingPlan(false);
    } catch (error) {
      setCustomModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to create plan',
        type: 'error'
      });
      setCreatingPlan(false);
      // Reopen modal if there was an error
      setShowCreateModal(true);
    }
  };

  const toggleTask = async (task) => {
    try {
      // Optimistic update - update UI immediately
      const updatedTasks = activePlan.tasks.map(t => 
        t.taskName === task.taskName 
          ? { ...t, isCompleted: !t.isCompleted }
          : t
      );
      setActivePlan(prev => ({
        ...prev,
        tasks: updatedTasks
      }));

      // Update backend
      await taskService.toggleTaskCompletion(
        user.$id, 
        activePlan.planId, 
        task.taskName, 
        task.priority,
        !task.isCompleted
      );
      
      // Refresh from backend to ensure consistency (silent update)
      const refreshedPlan = await taskService.getActivePlan(user.$id);
      if (refreshedPlan) {
        setActivePlan(refreshedPlan);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert optimistic update on error
      const revertedTasks = activePlan.tasks.map(t => 
        t.taskName === task.taskName 
          ? { ...t, isCompleted: task.isCompleted }
          : t
      );
      setActivePlan(prev => ({
        ...prev,
        tasks: revertedTasks
      }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header skeleton */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center">
                <LoadingSkeleton variant="default" className="w-6 h-6 mr-3" />
                <LoadingSkeleton variant="title" className="w-32" />
                <LoadingSkeleton variant="default" className="ml-3 w-16 h-6 rounded-full" />
              </div>
              <LoadingSkeleton variant="default" className="w-8 h-8 rounded-lg" />
            </div>
            
            {/* Content skeleton */}
            <div className="p-6 space-y-6">
              <LoadingSkeleton variant="planHeader" />
              <LoadingSkeleton variant="tasksSection" />
            </div>
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
          className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Target className="w-6 h-6 mr-3 text-purple-400" />
                Task Tracker
                <span className="ml-3 px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  Beta
                </span>
              </h1>
              <p className="text-gray-400 mt-1">Create daily plans and track your progress</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {creatingPlan ? (
              /* Creating Plan Skeleton */
              <div className="space-y-6">
                <LoadingSkeleton variant="planHeader" />
                <LoadingSkeleton variant="tasksSection" />
              </div>
            ) : !activePlan ? (
              /* No Plan State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <Target className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-white mb-4">
                  Ready to start tracking?
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Create your first plan with daily tasks. Track your progress and build better habits.
                </p>
                <Button onClick={handleCreatePlan} className="px-8 py-4 flex items-center justify-center mx-auto bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Plan
                </Button>
              </motion.div>
            ) : (
              /* Active Plan State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Plan Header */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                      {activePlan.planName}
                    </h2>
                    <Button 
                      onClick={() => setShowAnalytics(true)}
                      variant="outline"
                      className="bg-gray-800/50 flex items-center hover:bg-gray-700/50"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Plan resets daily at midnight
                  </div>
                </div>

                {/* Tasks List */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Today's Tasks
                  </h3>
                  
                  <div className="space-y-3">
                    {activePlan.tasks.map((task, index) => (
                      <motion.div
                        key={`${task.id}-${task.taskName || index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          group p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02]
                          ${task.isCompleted 
                            ? 'bg-green-500/10 border-green-500/30 hover:border-green-400/50' 
                            : 'bg-gray-800/30 border-gray-600/30 hover:border-gray-500/50'
                          }
                        `}
                        onClick={() => toggleTask(task)}
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400 group-hover:text-green-400" />
                            )}
                          </motion.div>
                          
                          <div className="flex-1">
                            <div className={`
                              font-medium transition-all duration-300
                              ${task.isCompleted 
                                ? 'text-green-400 line-through' 
                                : 'text-white group-hover:text-green-400'
                              }
                            `}>
                              {task.taskName}
                            </div>
                          </div>
                          
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-medium border
                            ${getPriorityColor(task.priority)}
                          `}>
                            {task.priority}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Today's Progress</span>
                      <span className="text-white font-medium">
                        {activePlan.tasks.filter(t => t.isCompleted).length} / {activePlan.tasks.length} completed
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(activePlan.tasks.filter(t => t.isCompleted).length / activePlan.tasks.length) * 100}%` 
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Beta Warning Modal */}
      <ConfirmationModal
        isOpen={showBetaWarning}
        onClose={() => setShowBetaWarning(false)}
        onConfirm={confirmCreatePlan}
        title="Beta Feature Notice"
        message="This feature is currently in beta. You can create only one plan, and tasks cannot be updated or deleted later. Please be careful when creating your plan."
        confirmText="I Understand"
        cancelText="Cancel"
        type="warning"
      />

      {/* Create Plan Modal */}
      {showCreateModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Create New Plan</h2>
              
              {/* Plan Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., Morning Routine, Work Tasks..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tasks */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Tasks
                </label>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={`task-input-${index}`} className="flex gap-3">
                      <input
                        type="text"
                        value={task.taskName}
                        onChange={(e) => updateTask(index, 'taskName', e.target.value)}
                        placeholder="Enter task name..."
                        className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      {tasks.length > 1 && (
                        <Button
                          onClick={() => removeTask(index)}
                          variant="outline"
                          className="px-3 py-3 bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={addTask}
                  variant="outline"
                  className="mt-3 w-full flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitPlan}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Create Plan
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Analytics Modal */}
      {showAnalytics && activePlan && (
        <TaskAnalyticsModal
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          planId={activePlan.planId}
          planName={activePlan.planName}
          userId={user.$id}
        />
      )}

      {/* Custom Modal */}
      {customModal.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            onClick={() => setCustomModal({ ...customModal, isOpen: false })}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
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
                  <Target className="w-6 h-6 text-blue-400 mr-3" />
                )}
                <h3 className="text-lg font-semibold text-white">{customModal.title}</h3>
              </div>
              
              <p className="text-gray-300 mb-6">{customModal.message}</p>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => setCustomModal({ ...customModal, isOpen: false })}
                  className={`
                    px-6 py-2
                    ${customModal.type === 'error' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : customModal.type === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                    }
                  `}
                >
                  OK
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskTracker;
