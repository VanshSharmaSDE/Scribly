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
      console.error("AuthService :: createAccount :: ", error);
      
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
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      return await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
    } catch (error) {
      if (error.message?.includes('Document with the requested ID could not be found')) {
        console.warn(`User profile not found for userId: ${userId}. User may need to complete registration.`);
        return null; // Return null instead of throwing error
      }
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      return await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, userId, data);
    } catch (error) {
      console.error('Error updating profile:', error);
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
          console.log('User already logged in with same email');
          return { $id: existingUser.$id, userId: existingUser.$id };
        } else {
          // Different user trying to login, logout first
          console.log('Different user trying to login, logging out existing session');
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
          console.log('Creating missing user profile for existing user');
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
      console.error("AuthService :: login :: ", error);
      
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
          console.warn('Failed to parse user preferences:', e);
          userDoc.preferences = { defaultView: 'grid' };
        }
      } else {
        userDoc.preferences = { defaultView: 'grid' };
      }
      
      return userDoc;
    } catch (error) {
      console.error('Get user document error:', error);
      return null;
    }
  }

  // Logout user
  async logout() {
    try {
      await account.deleteSessions();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      console.log('Sending verification email with URL:', `${window.location.origin}/verify-email`);
      
      const result = await account.createVerification(
        `${window.location.origin}/verify-email`
      );
      
      console.log('Verification email sent successfully!');
      console.log('Full verification result:', result);
      console.log('Result keys:', Object.keys(result));
      console.log('Result has secret?', 'secret' in result);
      console.log('Result.secret value:', result.secret);
      console.log('Type of result:', typeof result);
      
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
            console.log('Appwrite secret stored in database for verification');
          }
        } catch (dbError) {
          console.error('Error storing secret in database:', dbError);
          console.error('Make sure you have added "secret" attribute to Users collection');
        }
      } else {
        console.log('❌ No secret returned from Appwrite verification result');
        console.log('This means Appwrite does not provide the secret in createVerification response');
        console.log('The secret is only available in the email URL that user clicks');
      }
      
      console.log('Check your email for verification link!');
      return result;
    } catch (error) {
      console.error('Send verification error:', error);
      throw error;
    }
  }

  // Confirm email verification
  async confirmEmailVerification(userId, secret) {
    try {
      console.log('=== authService.confirmEmailVerification called ===');
      console.log('authService received parameters:', { userId, secret });
      
      if (!secret) {
        console.error('Secret is missing from verification URL!');
        throw new Error('Verification secret is required. Please use the link from your email.');
      }
      
      console.log('Using secret directly from URL for verification');
      console.log('Secret length:', secret.length);
      console.log('Secret (first 50 chars):', secret.substring(0, 50));
      
      // Verify the email with Appwrite using the secret from URL directly
      // Note: Appwrite's updateVerification requires both userId and secret
      const result = await account.updateVerification(userId, secret);
      
      console.log('=== Verification successful ===');
      console.log('Verification result:', result);
      
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
          console.log('User document updated: emailVerified=true');
          
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
        console.error('Error updating user document after verification:', dbError);
        // Still return success if verification worked but DB update failed
        return {
          verified: true,
          message: 'Email verified successfully! Please login to continue.'
        };
      }
    } catch (error) {
      console.error('=== authService verification error ===');
      console.error('Confirm verification error:', error);
      
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
      console.error('Send password recovery error:', error);
      throw error;
    }
  }

  // Confirm password recovery
  async confirmPasswordRecovery(userId, secret, newPassword) {
    try {
      return await account.updateRecovery(userId, secret, newPassword, newPassword);
    } catch (error) {
      console.error('Confirm password recovery error:', error);
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
      console.error('Update preferences error:', error);
      throw error;
    }
  }
}

export default new AuthService();
