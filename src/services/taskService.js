import { databases, Query } from '../lib/appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;
const TASKS_ANALYTICS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_ANALYTICS_COLLECTION_ID;

class TaskService {
  // Create a new permanent task
  async createTask({ title, priority, userId }) {
    try {
      const taskData = {
        title,
        priority,
        userId,
        completed: false,
        date: '', // Empty string for permanent tasks
        isTemplate: true, // Mark as template since it's permanent
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        'unique()',
        taskData
      );

      console.log('Task created:', task);
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all user's tasks
  async getUserTasks(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true),
          Query.orderDesc('createdAt')
        ]
      );

      console.log('Fetched user tasks:', response.documents);
      return response.documents;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Toggle task completion
  async toggleTask(taskId, completed) {
    try {
      console.log('Toggling task:', taskId, 'to completed:', completed);
      
      const updateData = {
        completed
      };
      
      console.log('Update data:', updateData);
      
      const updatedTask = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        updateData
      );

      console.log('Task updated successfully:', updatedTask);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('TaskId:', taskId, 'Completed:', completed);
      throw error;
    }
  }

  // Delete a task permanently
  async deleteTask(taskId) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        { isActive: false }
      );
      
      console.log('Task deleted:', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Save today's progress to history and reset all tasks
  async resetDailyTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all user tasks
      const tasks = await this.getUserTasks(userId);
      console.log('Resetting tasks for new day. Found tasks:', tasks.length);
      
      // Save completed tasks to history
      const completedTasks = tasks.filter(task => task.completed);
      console.log('Completed tasks to save:', completedTasks.length);

      if (tasks.length > 0) {
        // Save to database instead of localStorage
        const historyEntry = {
          userId,
          date: today,
          totalTasks: tasks.length,
          completedCount: completedTasks.length,
          taskDetails: JSON.stringify(tasks.map(task => ({
            title: task.title,
            priority: task.priority,
            completed: task.completed
          }))),
          createdAt: new Date().toISOString()
        };

        try {
          await databases.createDocument(
            DATABASE_ID,
            TASKS_ANALYTICS_COLLECTION_ID,
            'unique()',
            historyEntry
          );
          console.log('History saved to database for:', today, historyEntry);
        } catch (error) {
          console.error('Error saving history to database:', error);
          // Fallback to localStorage if database fails
          localStorage.setItem(`taskHistory_${userId}_${today}`, JSON.stringify(historyEntry));
        }
      }

      // Reset all tasks to uncompleted
      const resetPromises = tasks.map(task => 
        databases.updateDocument(
          DATABASE_ID,
          TASKS_COLLECTION_ID,
          task.$id,
          {
            completed: false
          }
        )
      );

      await Promise.all(resetPromises);
      console.log('All tasks reset for new day');
      
      return { tasksReset: tasks.length, completedToday: completedTasks.length };
    } catch (error) {
      console.error('Error resetting daily tasks:', error);
      throw error;
    }
  }

  // Check if tasks need to be reset (call this when app loads)
  async checkAndResetIfNewDay(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastResetDate = localStorage.getItem(`lastResetDate_${userId}`);
      
      console.log('Checking reset - Today:', today, 'Last reset:', lastResetDate);
      
      if (lastResetDate !== today) {
        // New day detected, save yesterday's progress and reset tasks
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        console.log('New day detected, resetting from:', lastResetDate, 'to:', today);
        await this.resetDailyTasks(userId);
        localStorage.setItem(`lastResetDate_${userId}`, today);
        return true; // Tasks were reset
      }
      
      console.log('Same day, no reset needed');
      return false; // No reset needed
    } catch (error) {
      console.error('Error checking daily reset:', error);
      throw error;
    }
  }

  // Get analytics/history
  async getTaskAnalytics(userId) {
    try {
      const analytics = {};
      
      // Get current day completion
      const today = new Date().toISOString().split('T')[0];
      const tasks = await this.getUserTasks(userId);
      const completedToday = tasks.filter(task => task.completed);

      analytics[today] = {
        total: tasks.length,
        completed: completedToday.length,
        tasks: tasks.map(task => ({
          title: task.title,
          priority: task.priority,
          completed: task.completed
        }))
      };

      // Get historical data from database
      try {
        const historyResponse = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ANALYTICS_COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.orderDesc('date'),
            Query.limit(30) // Last 30 days
          ]
        );

        console.log('Found analytics records:', historyResponse.documents.length);

        historyResponse.documents.forEach(record => {
          if (record.date !== today) { // Don't override today's live data
            analytics[record.date] = {
              total: record.totalTasks,
              completed: record.completedCount,
              tasks: JSON.parse(record.taskDetails || '[]')
            };
          }
        });
      } catch (error) {
        console.error('Error fetching analytics from database:', error);
        
        // Fallback to localStorage for existing data
        for (let i = 1; i <= 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const historyKey = `taskHistory_${userId}_${dateStr}`;
          const dayHistory = localStorage.getItem(historyKey);
          
          if (dayHistory) {
            analytics[dateStr] = JSON.parse(dayHistory);
          }
        }
      }

      console.log('Analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
}

export default new TaskService();