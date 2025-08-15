import { 
  databases, 
  DATABASE_ID, 
  TASKS_COLLECTION_ID, 
  TASKS_ANALYTICS_COLLECTION_ID, 
  ID, 
  Query 
} from '../lib/appwrite';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

class TaskService {
  // Create a new plan with tasks
  async createPlan(userId, planData) {
    try {
      const planId = ID.unique();

      // First, check if user already has an active plan
      const existingPlans = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true)
        ]
      );

      if (existingPlans.documents.length > 0) {
        throw new Error('You already have an active plan. This feature allows only one plan per user.');
      }

      // Create the plan with array of task names and comma-separated priorities
      const plan = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        planId,
        {
          planId,
          userId,
          planName: planData.planName,
          taskNames: planData.tasks.map(task => task.taskName), // Array of task name strings
          priorities: planData.tasks.map(task => task.priority).join(','), // Comma-separated priorities string
          createdAt: dayjs().toISOString(),
          isActive: true
        }
      );

      // Create historical records for all days from plan creation to today
      await this.createHistoricalRecords(userId, planId, planData.tasks, dayjs().toISOString());

      return plan;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  // Get user's active plan with today's completion status
  async getActivePlan(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true)
        ]
      );

      if (response.documents.length === 0) {
        return null;
      }

      const planDoc = response.documents[0];
      
      // Build plan data with task names and priorities
      const taskNames = planDoc.taskNames || [];
      const priorities = planDoc.priorities ? planDoc.priorities.split(',') : [];
      
      const planData = {
        planId: planDoc.planId,
        planName: planDoc.planName,
        createdAt: planDoc.createdAt,
        taskNames: taskNames,
        priorities: priorities,
        tasks: taskNames.map((taskName, index) => ({
          id: `task_${index}`,
          taskName: taskName,
          priority: priorities[index] || 'medium',
          isCompleted: false // Will be updated with today's status
        }))
      };

      // Ensure today's records exist for all tasks
      await this.ensureTodayRecords(userId, planData.planId, planData.tasks);

      // Get today's completion status
      const today = dayjs().format('YYYY-MM-DD');
      const todayAnalytics = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('planId', planData.planId),
          Query.equal('date', today)
        ]
      );

      // Update completion status based on today's analytics
      planData.tasks.forEach(task => {
        const analytics = todayAnalytics.documents.find(
          a => a.taskName === task.taskName
        );
        task.isCompleted = analytics ? analytics.isCompleted : false;
      });

      return planData;
    } catch (error) {
      console.error('Error getting active plan:', error);
      throw error;
    }
  }

  // Ensure today's records exist for all tasks
  async ensureTodayRecords(userId, planId, tasks) {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      
      // Check which tasks already have records for today
      const existingRecords = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('planId', planId),
          Query.equal('date', today)
        ]
      );

      const existingTaskNames = existingRecords.documents.map(record => record.taskName);

      // Create records for tasks that don't have today's record
      for (const task of tasks) {
        if (!existingTaskNames.includes(task.taskName)) {
          await databases.createDocument(
            DATABASE_ID,
            TASKS_ANALYTICS_COLLECTION_ID,
            ID.unique(),
            {
              planId,
              userId,
              taskName: task.taskName,
              priority: task.priority,
              isCompleted: false,
              date: today,
              createdAt: dayjs().toISOString()
            }
          );
        }
      }
    } catch (error) {
      console.error('Error ensuring today records:', error);
      throw error;
    }
  }

  // Create daily records for all days since plan creation
  async createHistoricalRecords(userId, planId, tasks, planCreatedAt) {
    try {
      const startDate = dayjs(planCreatedAt);
      const today = dayjs();
      
      // Get all existing records to avoid duplicates
      const existingRecords = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('planId', planId)
        ]
      );

      const existingKeys = new Set(
        existingRecords.documents.map(record => `${record.date}-${record.taskName}`)
      );

      // Create records for each day from plan creation to today
      let currentDate = startDate;
      while (currentDate.isSameOrBefore(today, 'day')) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        
        for (const task of tasks) {
          const key = `${dateStr}-${task.taskName}`;
          
          if (!existingKeys.has(key)) {
            await databases.createDocument(
              DATABASE_ID,
              TASKS_ANALYTICS_COLLECTION_ID,
              ID.unique(),
              {
                planId,
                userId,
                taskName: task.taskName,
                priority: task.priority,
                isCompleted: false,
                date: dateStr,
                createdAt: dayjs().toISOString()
              }
            );
          }
        }
        
        currentDate = currentDate.add(1, 'day');
      }
    } catch (error) {
      console.error('Error creating historical records:', error);
      throw error;
    }
  }

  // Toggle task completion
  async toggleTaskCompletion(userId, planId, taskName, priority, isCompleted) {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      
      // Find today's record for this task
      const existingRecord = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('planId', planId),
          Query.equal('taskName', taskName),
          Query.equal('date', today)
        ]
      );

      if (existingRecord.documents.length > 0) {
        // Update existing record
        const recordId = existingRecord.documents[0].$id;
        await databases.updateDocument(
          DATABASE_ID,
          TASKS_ANALYTICS_COLLECTION_ID,
          recordId,
          {
            isCompleted,
            updatedAt: dayjs().toISOString()
          }
        );
      } else {
        // Create new record (fallback if record doesn't exist)
        await databases.createDocument(
          DATABASE_ID,
          TASKS_ANALYTICS_COLLECTION_ID,
          ID.unique(),
          {
            planId,
            userId,
            taskName,
            priority: priority,
            isCompleted,
            date: today,
            createdAt: dayjs().toISOString()
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  // Get task analytics
  async getTaskAnalytics(userId, planId, days = 30) {
    try {
      const endDate = dayjs();
      const startDate = endDate.subtract(days - 1, 'day');

      const analytics = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ANALYTICS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('planId', planId),
          Query.greaterThanEqual('date', startDate.format('YYYY-MM-DD')),
          Query.lessThanEqual('date', endDate.format('YYYY-MM-DD')),
          Query.orderDesc('date')
        ]
      );

      // Group by date and task
      const groupedData = {};
      analytics.documents.forEach(record => {
        const date = record.date;
        if (!groupedData[date]) {
          groupedData[date] = {};
        }
        groupedData[date][record.taskName] = {
          isCompleted: record.isCompleted,
          priority: record.priority || 'medium'
        };
      });

      return groupedData;
    } catch (error) {
      console.error('Error getting task analytics:', error);
      throw error;
    }
  }

  // Delete plan (optional - for future use)
  async deletePlan(userId, planId) {
    try {
      // Delete the plan document
      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        planId
      );

      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }
}

export default new TaskService();
