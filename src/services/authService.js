import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';

class AuthService {
  // Register new user with email and password and send verification email
  async createAccount({ email, password, name }) {
    try {
      // Create account directly without checking for existing sessions
      const userAccount = await account.create(ID.unique(), email, password, name);
      
      if (userAccount) {
        // Create user profile in database
        await this.createUserProfile({
          userId: userAccount.$id,
          email: userAccount.email,
          name: userAccount.name,
        });
        
        // Login to send verification email
        const session = await account.createEmailPasswordSession(email, password);
        
        // Send verification email automatically
        await this.sendEmailVerification();
        
        // Logout to keep account in unverified state until verification
        await account.deleteSessions();
        
        return {
          ...userAccount,
          verificationSent: true,
          message: 'Account created! Please check your email and verify your account before logging in.'
        };
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {

      // Provide more helpful error messages
      if (error.message && error.message.includes("already exists")) {
        throw new Error("A user with this email already exists.");
      } else if (error.message && error.message.includes("missing scope")) {
        throw new Error("Permission error: Please check your Appwrite project settings.");
      } else {
        throw error;
      }
    }
  }

  // Create user profile in database
  async createUserProfile({ userId, email, name, emailVerified = false }) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          email,
          name,
          emailVerified,
          preferences: JSON.stringify({ defaultView: 'grid' }),
          createdAt: new Date().toISOString(),
        }
      );
    } catch (error) {

      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      return await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
    } catch (error) {
      if (error.message?.includes('Document with the requested ID could not be found')) {

        return null; // Return null instead of throwing error
      }

      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      return await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, data);
    } catch (error) {

      throw error;
    }
  }

  // Login user
  async login({ email, password }) {
    try {
      // Check if user is already logged in
      const existingUser = await this.getCurrentUser();
      if (existingUser) {
        // Check if the logged-in user matches the login credentials
        if (existingUser.email === email) {

          return { $id: existingUser.$id, userId: existingUser.$id };
        } else {
          // Different user trying to login, logout first

          await account.deleteSessions();
        }
      }
      
      // Create the session
      const session = await account.createEmailPasswordSession(email, password);
      
      // Ensure user profile exists (for users created before this system)
      if (session) {
        const userAccount = await account.get();
        const userProfile = await this.getUserProfile(userAccount.$id);
        
        if (!userProfile) {

          await this.createUserProfile({
            userId: userAccount.$id,
            email: userAccount.email,
            name: userAccount.name,
            emailVerified: userAccount.emailVerification
          });
        }
      }
      
      return session;
    } catch (error) {

      // Provide more helpful error messages
      if (error.code === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message && error.message.includes('User not found')) {
        throw new Error('No account found with this email address. Please sign up first.');
      } else {
        throw error;
      }
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      return null;
    }
  }

  // Get user document from database
  async getUserDocument(userId) {
    try {
      const userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
      
      // Parse preferences from JSON string
      if (userDoc.preferences) {
        try {
          userDoc.preferences = JSON.parse(userDoc.preferences);
        } catch (e) {

          userDoc.preferences = { defaultView: 'grid' };
        }
      } else {
        userDoc.preferences = { defaultView: 'grid' };
      }
      
      return userDoc;
    } catch (error) {

      return null;
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSessions();
    } catch (error) {

      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {

      const result = await account.createVerification(
        `${window.location.origin}/verify-email`
      );

      // Store the Appwrite secret in database for later verification
      if (result && result.secret) {
        try {
          const currentUser = await account.get();
          if (currentUser) {
            await databases.updateDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              currentUser.$id,
              { secret: result.secret }
            );

          }
        } catch (dbError) {

        }
      } else {

      }

      return result;
    } catch (error) {

      throw error;
    }
  }

  // Confirm email verification
  async confirmEmailVerification(userId, secret) {
    try {

      if (!secret) {

        throw new Error('Verification secret is required. Please use the link from your email.');
      }

      // Verify the email with Appwrite using the secret from URL directly
      // Note: Appwrite's updateVerification requires both userId and secret
      const result = await account.updateVerification(userId, secret);

      // After successful verification, get the current user and update their profile
      try {
        const currentUser = await account.get();
        if (currentUser) {
          // Update user document to mark email as verified
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentUser.$id,
            { 
              emailVerified: true
            }
          );

          return {
            verified: true,
            user: currentUser,
            message: 'Email verified successfully! Welcome to Scribly.'
          };
        } else {
          // If no current user, still return success
          return {
            verified: true,
            message: 'Email verified successfully! Please login to continue.'
          };
        }
      } catch (dbError) {

        // Still return success if verification worked but DB update failed
        return {
          verified: true,
          message: 'Email verified successfully! Please login to continue.'
        };
      }
    } catch (error) {

      // Handle specific error cases
      if (error.message?.includes('Invalid token') || error.message?.includes('expired')) {
        throw new Error('This verification link is invalid or has expired. Please request a new verification email.');
      }
      
      if (error.message?.includes('User with the requested ID could not be found')) {
        throw new Error('This verification link is invalid. The user account may have been deleted.');
      }
      
      throw error;
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email) {
    try {
      return await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {

      throw error;
    }
  }

  // Confirm password recovery
  async confirmPasswordRecovery(userId, secret, newPassword) {
    try {
      return await account.updateRecovery(userId, secret, newPassword, newPassword);
    } catch (error) {

      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        { preferences: JSON.stringify(preferences) }
      );
    } catch (error) {

      throw error;
    }
  }
}

export default new AuthService();

