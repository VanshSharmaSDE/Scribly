import { databases, DATABASE_ID, TASKS_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';

class TaskMigration {
  // Migrate existing tasks to the new template system
  async migrateExistingTasks(userId) {
    try {
      console.log('Starting task migration for user:', userId);
      
      // Get all existing tasks for the user
      const existingTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(1000) // Limit to prevent too many API calls
        ]
      );

      // Group tasks by title to identify recurring tasks
      const taskGroups = {};
      existingTasks.documents.forEach(task => {
        // Skip if already a template or progress entry
        if (task.isTemplate !== undefined || task.templateId) {
          return;
        }

        const title = task.title.trim().toLowerCase();
        if (!taskGroups[title]) {
          taskGroups[title] = [];
        }
        taskGroups[title].push(task);
      });

      // Create templates for tasks that appear multiple times or are recent
      const templates = [];
      const today = new Date().toISOString().split('T')[0];
      
      for (const [title, tasks] of Object.entries(taskGroups)) {
        // Create template if task appears more than once, or if it's from today
        const shouldCreateTemplate = tasks.length > 1 || 
          tasks.some(task => task.date === today);
        
        if (shouldCreateTemplate) {
          const recentTask = tasks[0]; // Most recent task
          
          // Create template
          const templateData = {
            title: recentTask.title,
            priority: recentTask.priority || 'medium',
            userId,
            isTemplate: true,
            isActive: true,
            createdAt: new Date().toISOString()
          };

          const template = await databases.createDocument(
            DATABASE_ID,
            TASKS_COLLECTION_ID,
            ID.unique(),
            templateData
          );

          templates.push(template);

          // Convert existing tasks to progress entries
          for (const task of tasks) {
            // Update the existing task to be a progress entry
            await databases.updateDocument(
              DATABASE_ID,
              TASKS_COLLECTION_ID,
              task.$id,
              {
                templateId: template.$id,
                isTemplate: false,
                // Keep existing data: date, completed, completedAt, etc.
              }
            );
          }
        }
      }

      console.log(`Migration completed. Created ${templates.length} templates.`);
      return {
        templatesCreated: templates.length,
        tasksProcessed: existingTasks.documents.length
      };

    } catch (error) {
      console.error('Error during task migration:', error);
      throw error;
    }
  }

  // Check if user needs migration
  async needsMigration(userId) {
    try {
      // Check if user has any templates
      const templates = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('isTemplate', true),
          Query.limit(1)
        ]
      );

      // Check if user has old-style tasks (without isTemplate field)
      const oldTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.limit(1)
        ]
      );

      // User needs migration if they have no templates but have old tasks
      const hasOldTasks = oldTasks.documents.some(task => 
        task.isTemplate === undefined && !task.templateId
      );

      return templates.documents.length === 0 && hasOldTasks;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }
}

export default new TaskMigration();
