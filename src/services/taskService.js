import { databases, DATABASE_ID, TASKS_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';

class TaskService {
  // Create a new task
  async createTask({ title, priority = 'medium', userId }) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const taskData = {
        title,
        priority, // low, medium, high
        completed: false,
        userId,
        date: today,
        createdAt: new Date().toISOString()
      };

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        ID.unique(),
        taskData
      );

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get tasks for today for a specific user
  async getTodayTasks(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const tasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('date', today),
          Query.orderDesc('createdAt')
        ]
      );

      return tasks.documents;
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      throw error;
    }
  }

  // Get tasks for a specific date
  async getTasksByDate(userId, date) {
    try {
      const tasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('date', date),
          Query.orderDesc('createdAt')
        ]
      );

      return tasks.documents;
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      throw error;
    }
  }

  // Update task completion status
  async toggleTaskCompletion(taskId, completed) {
    try {
      const updatedTask = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        { 
          completed,
          completedAt: completed ? new Date().toISOString() : null
        }
      );

      return updatedTask;
    } catch (error) {
      console.error('Error updating task completion:', error);
      throw error;
    }
  }

  // Update task priority
  async updateTaskPriority(taskId, priority) {
    try {
      const updatedTask = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        { priority }
      );

      return updatedTask;
    } catch (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get task analytics for the last 30 days
  async getTaskAnalytics(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const tasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('date', thirtyDaysAgoStr),
          Query.orderDesc('date')
        ]
      );

      // Group tasks by date and calculate completion rates
      const analytics = {};
      tasks.documents.forEach(task => {
        const date = task.date;
        if (!analytics[date]) {
          analytics[date] = {
            total: 0,
            completed: 0,
            high: 0,
            medium: 0,
            low: 0
          };
        }
        
        analytics[date].total++;
        if (task.completed) analytics[date].completed++;
        analytics[date][task.priority]++;
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      throw error;
    }
  }

  // Get completion streak (consecutive days with all tasks completed)
  async getCompletionStreak(userId) {
    try {
      const tasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date'),
          Query.limit(100) // Last 100 days max
        ]
      );

      // Group by date and check completion
      const dateGroups = {};
      tasks.documents.forEach(task => {
        if (!dateGroups[task.date]) {
          dateGroups[task.date] = { total: 0, completed: 0 };
        }
        dateGroups[task.date].total++;
        if (task.completed) dateGroups[task.date].completed++;
      });

      // Calculate streak
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 100; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayData = dateGroups[dateStr];
        if (!dayData || dayData.total === 0) {
          // No tasks for this day, continue
          continue;
        }
        
        if (dayData.completed === dayData.total) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating completion streak:', error);
      return 0;
    }
  }
}

export default new TaskService();
