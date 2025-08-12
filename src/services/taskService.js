import { databases, Query } from '../lib/appwrite';
import { Permission, Role } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;
const TASKS_ANALYTICS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_ANALYTICS_COLLECTION_ID;

class TaskService {
  
  // Create a new task (simple task creation)
  async createTask({ title, priority, userId }) {
    try {
      const taskData = {
        title,
        priority,
        userId,
        completed: false
      };

      const newTask = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        'unique()',
        taskData
      );

      console.log('Task created:', newTask);

      // Update analytics (don't let this fail the task creation)
      try {
        console.log('Updating analytics for task creation...');
        await this.updateAnalytics(userId, 'created');
        console.log('Analytics updated successfully for task creation');
      } catch (analyticsError) {
        console.error('Analytics update failed, but task was created:', analyticsError);
      }

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all tasks for a user
  async getUserTasks(userId) {
    try {
      await this.checkAndResetDaily(userId);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Toggle task completion (mark/unmark)
  async toggleTask(taskId, completed) {
    try {
      const updatedTask = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        { completed }
      );

      // Update analytics for EVERY toggle action (completed OR uncompleted)
      try {
        console.log('Updating analytics for task toggle...');
        if (completed) {
          // Count as completion
          console.log('Recording completion for:', updatedTask.title);
          await this.updateAnalytics(updatedTask.userId, 'completed', {
            title: updatedTask.title,
            priority: updatedTask.priority
          });
        } else {
          // Count as uncompletion (separate action)
          console.log('Recording uncompletion for:', updatedTask.title);
          await this.updateAnalytics(updatedTask.userId, 'uncompleted', {
            title: updatedTask.title,
            priority: updatedTask.priority
          });
        }
        console.log('Analytics updated successfully for task toggle');
      } catch (analyticsError) {
        console.error('Analytics update failed, but task was updated:', analyticsError);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      // Get task details before deletion for analytics
      const task = await databases.getDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );

      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );

      // Update analytics for deletion (don't let this fail the deletion)
      try {
        await this.updateAnalytics(task.userId, 'deleted');
      } catch (analyticsError) {
        console.error('Analytics update failed, but task was deleted:', analyticsError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Update analytics (single document per user) - SIMPLIFIED AND ROBUST
  async updateAnalytics(userId, action, taskData = null) {
    try {
      console.log(`🔧 ANALYTICS: updateAnalytics called - userId: ${userId}, action: ${action}`);
      
      // Get or create analytics document
      let analyticsDoc = await this.getOrCreateAnalyticsDoc(userId);
      console.log('📊 ANALYTICS: Got/created analytics doc:', analyticsDoc.$id);
      
      const today = new Date().toDateString();
      
      // Parse existing data
      const completedTasks = analyticsDoc.completedTasks ? JSON.parse(analyticsDoc.completedTasks) : [];
      const uncompletedTasks = analyticsDoc.uncompletedTasks ? JSON.parse(analyticsDoc.uncompletedTasks) : [];
      const dailyResetTasks = analyticsDoc.dailyResetTasks ? JSON.parse(analyticsDoc.dailyResetTasks) : [];

      // Update based on action
      let updateData = {
        totalCreated: analyticsDoc.totalCreated || 0,
        totalCompleted: analyticsDoc.totalCompleted || 0,
        totalUncompleted: analyticsDoc.totalUncompleted || 0,
        totalDeleted: analyticsDoc.totalDeleted || 0,
        dailyCompleted: analyticsDoc.dailyCompleted || 0,
        dailyUncompleted: analyticsDoc.dailyUncompleted || 0,
        lastUpdated: new Date().toISOString()
      };

      if (action === 'created') {
        updateData.totalCreated++;
        console.log('📈 ANALYTICS: Incremented totalCreated to', updateData.totalCreated);
      } else if (action === 'completed' && taskData) {
        updateData.totalCompleted++;
        completedTasks.push({
          title: taskData.title,
          priority: taskData.priority,
          completedAt: new Date().toISOString()
        });
        console.log('✅ ANALYTICS: Incremented totalCompleted to', updateData.totalCompleted);
      } else if (action === 'uncompleted' && taskData) {
        updateData.totalUncompleted++;
        uncompletedTasks.push({
          title: taskData.title,
          priority: taskData.priority,
          uncompletedAt: new Date().toISOString()
        });
        console.log('❌ ANALYTICS: Incremented totalUncompleted to', updateData.totalUncompleted);
      } else if (action === 'deleted') {
        updateData.totalDeleted++;
        console.log('🗑️ ANALYTICS: Incremented totalDeleted to', updateData.totalDeleted);
      } else if (typeof action === 'object' && action.action === 'daily_reset') {
        const completedCount = action.completedCount ?? action.count ?? 0;
        const uncompletedCount = action.uncompletedCount ?? 0;
        updateData.dailyCompleted += completedCount;
        updateData.dailyUncompleted += uncompletedCount;
        updateData.lastResetDate = today;

        const dateLabel = action.date ? new Date(action.date).toDateString() : today;
        const completedArr = (action.completedTasks || action.tasks || []).map(task => ({
          title: task.title,
          priority: task.priority
        }));
        const uncompletedArr = (action.uncompletedTasks || []).map(task => ({
          title: task.title,
          priority: task.priority
        }));

        // Backward compatible: keep 'tasks' (completed) while adding structured fields
        dailyResetTasks.push({
          date: dateLabel,
          tasks: completedArr,
          completed: {
            count: completedCount,
            tasks: completedArr
          },
          uncompleted: {
            count: uncompletedCount,
            tasks: uncompletedArr
          }
        });
        console.log('🌅 ANALYTICS: Daily reset processed — completed:', completedCount, 'uncompleted:', uncompletedCount);
      }

      // Add the arrays back
      updateData.completedTasks = JSON.stringify(completedTasks);
      updateData.uncompletedTasks = JSON.stringify(uncompletedTasks);
  updateData.dailyResetTasks = JSON.stringify(dailyResetTasks);

      console.log('💾 ANALYTICS: About to update document with:', updateData);
      
      await databases.updateDocument(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        analyticsDoc.$id,
        updateData
      );

      console.log('✅ ANALYTICS: Successfully updated analytics document!');

    } catch (error) {
      console.error('❌ ANALYTICS ERROR:', error);
    }
  }

  // Helper function to get or create analytics document
  async getOrCreateAnalyticsDoc(userId) {
    const docId = `user_${userId}`; // deterministic ID to avoid queries/indexes
    try {
      console.log('🔍 ANALYTICS: Fetching analytics doc by ID:', docId);
      const existing = await databases.getDocument(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        docId
      );
      console.log('📋 ANALYTICS: Found existing analytics document:', existing.$id);
      return existing;
    } catch (err) {
      // If not found, create it
      if (err && (err.code === 404 || (err.response && err.response.code === 404))) {
        try {
          console.log('🆕 ANALYTICS: Creating new analytics document with ID:', docId);
          const newDoc = await databases.createDocument(
            DATABASE_ID,
            TASKS_ANALYTICS_COLLECTION_ID,
            docId,
            {
              userId,
              totalCreated: 0,
              totalCompleted: 0,
              totalUncompleted: 0,
              totalDeleted: 0,
              dailyCompleted: 0,
              completedTasks: '[]',
              uncompletedTasks: '[]',
              dailyResetTasks: '[]',
              lastUpdated: new Date().toISOString(),
              lastResetDate: ''
            },
            [
              Permission.read(Role.user(userId)),
              Permission.update(Role.user(userId)),
              Permission.delete(Role.user(userId)),
              Permission.write(Role.user(userId))
            ]
          );
          console.log('✅ ANALYTICS: Successfully created new analytics document:', newDoc.$id);
          return newDoc;
        } catch (createErr) {
          console.error('❌ ANALYTICS: Failed to create analytics document:', createErr);
          throw createErr;
        }
      }
      console.error('❌ ANALYTICS: Error getting analytics document:', err);
      throw err;
    }
  }

  // Check if it's a new day and reset tasks if needed
  async checkAndResetDaily(userId) {
    try {
      const today = new Date().toDateString();
      const lastResetDate = localStorage.getItem('lastTaskReset');

      if (lastResetDate !== today) {
        console.log('New day detected, resetting tasks...');
        
        // Get all current tasks
        const currentTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_COLLECTION_ID,
          [Query.equal('userId', userId)]
        );

  // Split tasks by completion state for analytics snapshot
  const completedTasks = currentTasks.documents.filter(task => task.completed);
  const uncompletedTasks = currentTasks.documents.filter(task => !task.completed);
        
        // Update analytics with daily reset count and task details
        await this.updateAnalytics(userId, {
          action: 'daily_reset',
          date: today,
          completedCount: completedTasks.length,
          uncompletedCount: uncompletedTasks.length,
          completedTasks,
          uncompletedTasks
        });

        // Reset all tasks to uncompleted
        for (const task of currentTasks.documents) {
          if (task.completed) {
            await databases.updateDocument(
              DATABASE_ID,
              TASKS_COLLECTION_ID,
              task.$id,
              { completed: false }
            );
          }
        }

        localStorage.setItem('lastTaskReset', today);
        return true; // Indicates reset occurred
      }
      
      return false; // No reset needed
    } catch (error) {
      console.error('Error in daily reset:', error);
      return false;
    }
  }

  // Get analytics data (single document per user)
  async getTaskAnalytics(userId) {
    const docId = `user_${userId}`;
    try {
      const analytics = await databases.getDocument(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        docId
      );

      return {
        ...analytics,
        completedTasks: analytics.completedTasks ? JSON.parse(analytics.completedTasks) : [],
        uncompletedTasks: analytics.uncompletedTasks ? JSON.parse(analytics.uncompletedTasks) : [],
        dailyResetTasks: analytics.dailyResetTasks ? JSON.parse(analytics.dailyResetTasks) : []
      };
    } catch (error) {
      // If missing, auto-create the analytics doc and return defaults
      if (error && (error.code === 404 || (error.response && error.response.code === 404))) {
        try {
          await this.getOrCreateAnalyticsDoc(userId);
        } catch (e) {
          console.warn('Auto-create analytics doc failed (will still return defaults):', e?.message || e);
        }
        return {
          totalCreated: 0,
          totalCompleted: 0,
          totalUncompleted: 0,
          totalDeleted: 0,
          dailyCompleted: 0,
          completedTasks: [],
          uncompletedTasks: [],
          dailyResetTasks: [],
          lastUpdated: null,
          lastResetDate: null
        };
      }
      console.error('Error fetching analytics:', error);
      return {
        totalCreated: 0,
        totalCompleted: 0,
        totalUncompleted: 0,
        totalDeleted: 0,
        dailyCompleted: 0,
        completedTasks: [],
        uncompletedTasks: [],
        dailyResetTasks: [],
        lastUpdated: null,
        lastResetDate: null
      };
    }
  }

  // Get analytics summary (same as analytics data since it's already aggregated)
  async getAnalyticsSummary(userId) {
    return await this.getTaskAnalytics(userId);
  }

  // Debug function to test analytics collection
  async testAnalyticsCollection(userId) {
    try {
      console.log('Testing analytics collection...');
      console.log('DATABASE_ID:', DATABASE_ID);
      console.log('TASKS_ANALYTICS_COLLECTION_ID:', TASKS_ANALYTICS_COLLECTION_ID);
      
      // Try to list all documents in the analytics collection
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID
      );
      
      console.log('Analytics collection response:', response);
      return response;
    } catch (error) {
      console.error('Error testing analytics collection:', error);
      return null;
    }
  }
}

export default new TaskService();
