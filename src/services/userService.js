import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '../lib/appwrite';

class UserService {
  // Update user name
  async updateName(name) {
    try {
      return await account.updateName(name);
    } catch (error) {

      throw error;
    }
  }

  // Update user email
  async updateEmail(email, password) {
    try {
      return await account.updateEmail(email, password);
    } catch (error) {

      throw error;
    }
  }

  // Update user password
  async updatePassword(newPassword, oldPassword) {
    try {
      return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {

      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {

      throw error;
    }
  }

  // Get minimal user info for sharing (public safe)
  async getPublicUserInfo(userId) {
    try {
      // Try to get user info from users collection first
      if (USERS_COLLECTION_ID) {
        try {
          const userProfile = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId
          );
          
          return {
            name: userProfile.name || 'Scribly User',
            avatar: userProfile.avatar || null,
            // Don't expose email in public contexts for privacy
          };
        } catch (error) {

        }
      }
      
      // Fallback to account service (won't work for public access, but try anyway)
      try {
        const currentUser = await account.get();
        if (currentUser.$id === userId) {
          return {
            name: currentUser.name || 'Scribly User',
            avatar: null
          };
        }
      } catch (error) {

      }
      
      // Final fallback
      return {
        name: 'Scribly User',
        avatar: null
      };
    } catch (error) {

      return {
        name: 'Scribly User',
        avatar: null
      };
    }
  }

  // Create or update user profile in database
  async createOrUpdateProfile(userData) {
    try {
      if (!USERS_COLLECTION_ID) {

        return null;
      }

      const userProfile = {
        name: userData.name || userData.email || 'Scribly User',
        email: userData.email,
        avatar: userData.avatar || null,
        userId: userData.$id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        const result = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userData.$id,
          userProfile
        );

        return result;
      } catch (createError) {
        if (createError.message?.includes('already exists')) {
          const updateData = {
            name: userData.name || userData.email || 'Scribly User',
            email: userData.email,
            avatar: userData.avatar || null,
            updatedAt: new Date().toISOString()
          };
          
          const result = await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userData.$id,
            updateData
          );

          return result;
        }
        throw createError;
      }
    } catch (error) {

      return null;
    }
  }
}

const userService = new UserService();
export default userService;

