import { ID, Query } from 'appwrite';
import { databases } from '../lib/appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const FEATURE_REQUESTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FEATURE_REQUESTS_COLLECTION_ID;

class FeatureRequestService {
  // Create a new feature request
  async createFeatureRequest(requestData) {
    try {
      // Check if email already has a pending or in-progress feature request
      const existingRequest = await this.checkEmailHasActiveRequest(requestData.email);
      
      if (existingRequest) {
        throw new Error('You already have an active feature request. Please wait for it to be processed before submitting another.');
      }

      const featureRequest = await databases.createDocument(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        ID.unique(),
        {
          name: requestData.name,
          email: requestData.email,
          feature: requestData.feature,
          requirement: requestData.requirement,
          description: requestData.description || '',
          priority: requestData.priority || 'medium',
          category: requestData.category || 'general',
          likes: 0,
          likedBy: [], // Initialize as empty array for email strings
          status: 'pending',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      );

      return featureRequest;
    } catch (error) {
      console.error('Error creating feature request:', error);
      throw error;
    }
  }

  // Check if email has an active feature request
  async checkEmailHasActiveRequest(email) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        [
          Query.equal('email', email),
          Query.equal('isActive', true),
          Query.notEqual('status', 'completed'),
          Query.notEqual('status', 'rejected')
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking email for active requests:', error);
      return false;
    }
  }

  // Get all feature requests ordered by likes
  async getAllFeatureRequests() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        [
          Query.equal('isActive', true),
          Query.orderDesc('likes'),
          Query.orderDesc('createdAt'),
          Query.limit(100)
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting feature requests:', error);
      throw error;
    }
  }

  // Check if user has liked a feature request by email
  checkUserHasLiked(featureRequest, userEmail) {
    if (!userEmail || !featureRequest.likedBy) return false;
    
    // likedBy is now an array of email strings
    const likedBy = Array.isArray(featureRequest.likedBy) ? featureRequest.likedBy : [];
    return likedBy.includes(userEmail);
  }

  // Like or unlike a feature request (using email tracking in likedBy attribute as array of strings)
  async toggleLike(featureRequestId, userEmail) {
    try {
      // Get the current feature request
      const featureRequest = await databases.getDocument(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        featureRequestId
      );

      // likedBy is an array of email strings
      const likedBy = Array.isArray(featureRequest.likedBy) ? featureRequest.likedBy : [];
      const hasLiked = likedBy.includes(userEmail);

      let updatedLikes;
      let updatedLikedBy;

      if (hasLiked) {
        // Unlike: decrease likes count and remove email
        updatedLikes = Math.max(0, featureRequest.likes - 1);
        updatedLikedBy = likedBy.filter(email => email !== userEmail);
      } else {
        // Like: increase likes count and add email
        updatedLikes = featureRequest.likes + 1;
        updatedLikedBy = [...likedBy, userEmail];
      }

      // Update the document with new likes count and email array
      const updatedRequest = await databases.updateDocument(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        featureRequestId,
        {
          likes: updatedLikes,
          likedBy: updatedLikedBy
        }
      );

      return {
        ...updatedRequest,
        hasLiked: !hasLiked,
        likedBy: updatedLikedBy
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  // Update feature request status (admin only)
  async updateStatus(featureRequestId, status) {
    try {
      const updatedRequest = await databases.updateDocument(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        featureRequestId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedRequest;
    } catch (error) {
      console.error('Error updating feature request status:', error);
      throw error;
    }
  }

  // Delete feature request (admin only)
  async deleteFeatureRequest(featureRequestId) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        featureRequestId,
        {
          isActive: false,
          deletedAt: new Date().toISOString()
        }
      );

      return true;
    } catch (error) {
      console.error('Error deleting feature request:', error);
      throw error;
    }
  }

  // Get feature requests by status
  async getFeatureRequestsByStatus(status) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        [
          Query.equal('status', status),
          Query.equal('isActive', true),
          Query.orderDesc('likes'),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting feature requests by status:', error);
      throw error;
    }
  }

  // Search feature requests
  async searchFeatureRequests(searchTerm) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FEATURE_REQUESTS_COLLECTION_ID,
        [
          Query.equal('isActive', true),
          Query.search('feature', searchTerm),
          Query.orderDesc('likes')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error searching feature requests:', error);
      throw error;
    }
  }
}

const featureRequestService = new FeatureRequestService();
export default featureRequestService;
