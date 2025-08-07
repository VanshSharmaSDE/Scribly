import { ID, Query } from 'appwrite';
import { databases } from '../lib/appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const EMAIL_UPDATES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_EMAIL_UPDATES_COLLECTION_ID;

class EmailUpdatesService {
  // Subscribe to email updates
  async subscribe(email) {
    try {
      // First check if email already exists
      const existingSubscription = await this.checkEmailExists(email);
      
      if (existingSubscription) {
        throw new Error('You are already subscribed with this email address');
      }

      // Create new subscription
      const subscription = await databases.createDocument(
        DATABASE_ID,
        EMAIL_UPDATES_COLLECTION_ID,
        ID.unique(),
        {
          email,
          subscribedAt: new Date().toISOString(),
          isActive: true
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error subscribing to email updates:', error);
      throw error;
    }
  }

  // Check if email already exists
  async checkEmailExists(email) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EMAIL_UPDATES_COLLECTION_ID,
        [
          Query.equal('email', email),
          Query.equal('isActive', true)
        ]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  // Unsubscribe from email updates
  async unsubscribe(email) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EMAIL_UPDATES_COLLECTION_ID,
        [
          Query.equal('email', email),
          Query.equal('isActive', true)
        ]
      );

      if (response.documents.length > 0) {
        const document = response.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          EMAIL_UPDATES_COLLECTION_ID,
          document.$id,
          {
            isActive: false,
            unsubscribedAt: new Date().toISOString()
          }
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from email updates:', error);
      throw error;
    }
  }

  // Get all active subscriptions (admin only)
  async getAllSubscriptions() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EMAIL_UPDATES_COLLECTION_ID,
        [
          Query.equal('isActive', true),
          Query.orderDesc('subscribedAt')
        ]
      );

      return response.documents;
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw error;
    }
  }
}

const emailUpdatesService = new EmailUpdatesService();
export default emailUpdatesService;
