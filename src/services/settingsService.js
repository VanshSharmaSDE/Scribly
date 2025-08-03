import { databases, account } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

class SettingsService {
  constructor() {
    this.databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    this.settingsCollectionId = import.meta.env.VITE_APPWRITE_SETTINGS_COLLECTION_ID;
  }

  // Get user settings
  async getUserSettings(userId = null) {
    try {
      const user = userId ? { $id: userId } : await account.get();
      
      const settings = await databases.listDocuments(
        this.databaseId,
        this.settingsCollectionId,
        [Query.equal('userId', user.$id)]
      );

      if (settings.documents.length > 0) {
        return settings.documents[0];
      }
      
      // Return default settings if none found
      return this.getDefaultSettings();
    } catch (error) {

      return this.getDefaultSettings();
    }
  }

  // Get default settings structure
  getDefaultSettings() {
    return {
      geminiApiKey: '',
      aiProvider: 'gemini', // 'gemini' or 'local'
      localModelPath: '',
      autoSaveEnabled: true,
      autoSaveInterval: 30 // seconds
    };
  }

  // Create or update user settings
  async saveUserSettings(settings, userId = null) {
    try {
      const user = userId ? { $id: userId } : await account.get();
      
      const existingSettings = await databases.listDocuments(
        this.databaseId,
        this.settingsCollectionId,
        [Query.equal('userId', user.$id)]
      );

      const settingsData = {
        userId: user.$id,
        geminiApiKey: settings.geminiApiKey || '',
        aiProvider: settings.aiProvider || 'gemini',
        localModelPath: settings.localModelPath || '',
        autoSaveEnabled: settings.autoSaveEnabled ?? true,
        autoSaveInterval: settings.autoSaveInterval ?? 30,
        updatedAt: new Date().toISOString()
      };

      if (existingSettings.documents.length > 0) {
        // Update existing settings
        return await databases.updateDocument(
          this.databaseId,
          this.settingsCollectionId,
          existingSettings.documents[0].$id,
          settingsData
        );
      } else {
        // Create new settings document
        return await databases.createDocument(
          this.databaseId,
          this.settingsCollectionId,
          ID.unique(),
          settingsData
        );
      }
    } catch (error) {

      throw error;
    }
  }

  // Update Gemini API key
  async updateGeminiApiKey(userId, apiKey) {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = {
        ...currentSettings,
        geminiApiKey: apiKey
      };
      
      return await this.saveUserSettings(updatedSettings, userId);
    } catch (error) {

      throw error;
    }
  }

  // Update AI provider
  async updateAiProvider(userId, provider) {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = {
        ...currentSettings,
        aiProvider: provider
      };
      
      return await this.saveUserSettings(updatedSettings, userId);
    } catch (error) {

      throw error;
    }
  }

  // Update local model path
  async updateLocalModelPath(userId, modelPath) {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = {
        ...currentSettings,
        localModelPath: modelPath
      };
      
      return await this.saveUserSettings(updatedSettings, userId);
    } catch (error) {

      throw error;
    }
  }

  // Update auto-save preferences
  async updateAutoSaveSettings(userId, autoSaveEnabled, autoSaveInterval) {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = {
        ...currentSettings,
        autoSaveEnabled: autoSaveEnabled,
        autoSaveInterval: autoSaveInterval
      };
      
      return await this.saveUserSettings(updatedSettings, userId);
    } catch (error) {

      throw error;
    }
  }

  // Get Gemini API key
  async getGeminiApiKey() {
    try {
      const settings = await this.getUserSettings();
      return settings.geminiApiKey || '';
    } catch (error) {

      return '';
    }
  }

  // Get AI provider
  async getAiProvider() {
    try {
      const settings = await this.getUserSettings();
      return settings.aiProvider || 'gemini';
    } catch (error) {

      return 'gemini';
    }
  }

  // Get local model path
  async getLocalModelPath() {
    try {
      const settings = await this.getUserSettings();
      return settings.localModelPath || '';
    } catch (error) {

      return '';
    }
  }

  // Get auto-save settings
  async getAutoSaveSettings() {
    try {
      const settings = await this.getUserSettings();
      return {
        enabled: settings.autoSaveEnabled ?? true,
        interval: settings.autoSaveInterval ?? 30
      };
    } catch (error) {

      return { enabled: true, interval: 30 };
    }
  }

  // Delete user settings
  async deleteUserSettings(userId = null) {
    try {
      const user = userId ? { $id: userId } : await account.get();
      
      const settings = await databases.listDocuments(
        this.databaseId,
        this.settingsCollectionId,
        [Query.equal('userId', user.$id)]
      );

      if (settings.documents.length > 0) {
        await databases.deleteDocument(
          this.databaseId,
          this.settingsCollectionId,
          settings.documents[0].$id
        );
      }
    } catch (error) {

      throw error;
    }
  }
}

export default new SettingsService();

