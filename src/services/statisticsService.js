import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

class StatisticsService {
  constructor() {
    this.databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    this.notesCollectionId = import.meta.env.VITE_APPWRITE_NOTES_COLLECTION_ID;
    this.usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
  }

  // Get total number of users
  async getTotalUsers() {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollectionId,
        [Query.limit(1)] // We only need the count
      );
      return response.total || 0;
    } catch (error) {
      // Return fallback number if error
      return 0;
    }
  }

  // Get total number of notes
  async getTotalNotes() {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.notesCollectionId,
        [Query.limit(1)] // We only need the count
      );
      return response.total || 0;
    } catch (error) {
      // Return fallback number if error
      return 0;
    }
  }

  // Get total number of shared links from notes collection
  async getTotalSharedLinks() {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.notesCollectionId,
        [Query.limit(1000)] // Get notes to count shared links
      );
      
      let totalSharedLinks = 0;
      
      response.documents.forEach(note => {
        // The field is called 'shareLinks' and it's stored as an array of JSON strings
        if (note.shareLinks && Array.isArray(note.shareLinks)) {
          totalSharedLinks += note.shareLinks.length;
        }
      });
      
      return totalSharedLinks;
    } catch (error) {
      // Return fallback number if error
      return 0;
    }
  }

  // Simply return total users count (no complex active user calculation)
  async getActiveUsers() {
    return this.getTotalUsers();
  }

  // Fixed rating at 4.2
  async getUserRating() {
    return 4.2;
  }

  // Get all statistics at once
  async getAllStatistics() {
    try {
      const [totalUsers, totalNotes, totalSharedLinks, activeUsers, userRating] = await Promise.allSettled([
        this.getTotalUsers(),
        this.getTotalNotes(),
        this.getTotalSharedLinks(),
        this.getActiveUsers(),
        this.getUserRating()
      ]);

      return {
        activeUsers: activeUsers.status === 'fulfilled' ? activeUsers.value : 0,
        totalNotes: totalNotes.status === 'fulfilled' ? totalNotes.value : 0,
        totalSharedLinks: totalSharedLinks.status === 'fulfilled' ? totalSharedLinks.value : 0,
        userRating: userRating.status === 'fulfilled' ? userRating.value : 4.2,
        totalUsers: totalUsers.status === 'fulfilled' ? totalUsers.value : 0
      };
    } catch (error) {
      // Return fallback statistics
      return {
        activeUsers: 0,
        totalNotes: 0,
        totalSharedLinks: 0,
        userRating: 4.2,
        totalUsers: 0
      };
    }
  }

  // Get formatted statistics for display
  async getFormattedStatistics() {
    const stats = await this.getAllStatistics();
    
    return {
      activeUsers: {
        value: stats.totalUsers,
        label: 'Total Users',
        formatted: this.formatNumber(stats.totalUsers)
      },
      totalNotes: {
        value: stats.totalNotes,
        label: 'Total Notes', 
        formatted: this.formatNumber(stats.totalNotes)
      },
      totalSharedLinks: {
        value: stats.totalSharedLinks,
        label: 'Shared Links',
        formatted: this.formatNumber(stats.totalSharedLinks)
      },
      userRating: {
        value: stats.userRating,
        label: 'User Rating',
        formatted: stats.userRating.toString()
      }
    };
  }

  // Format numbers for display (e.g., 1200 -> 1.2K)
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

export default new StatisticsService();
