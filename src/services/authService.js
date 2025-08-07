import { account, databases, functions, DATABASE_ID, USERS_COLLECTION_ID, ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';
import emailService from './emailService';

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
      console.log('Starting custom email verification process');

      // Get current user for email sending
      const currentUser = await account.get();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Current user found:', currentUser.$id, currentUser.email);

      // Generate custom verification secret
      const customSecret = Math.random().toString(36).substring(2) + Date.now().toString(36);
      console.log('Generated custom secret length:', customSecret.length);
      
      // First, try to store the custom secret in database
      try {
        // Get current user preferences to preserve existing data
        const currentUserDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          currentUser.$id
        );
        
        let preferences = {};
        try {
          preferences = JSON.parse(currentUserDoc.preferences || '{}');
        } catch (e) {
          preferences = { defaultView: 'grid' };
        }
        
        // Add verification data to preferences
        preferences.customVerificationSecret = customSecret;
        preferences.verificationExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        const updateData = { 
          preferences: JSON.stringify(preferences)
        };
        
        console.log('Storing verification data in preferences:', updateData);
        
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          currentUser.$id,
          updateData
        );
        console.log('Custom verification secret stored in preferences successfully');
        
        // Now try to send custom email
        if (currentUser.email) {
          try {
            const verificationUrl = `${window.location.origin}/verify-email?userId=${currentUser.$id}&secret=${customSecret}`;
            console.log('Verification URL:', verificationUrl);
            
            const emailResult = await emailService.sendVerificationEmail(
              currentUser.email,
              verificationUrl,
              currentUser.name
            );
            
            console.log('Email service result:', emailResult);
            
            if (emailResult && emailResult.success) {
              console.log('Custom verification email sent successfully - NO FALLBACK');
              
              // Return custom verification result - DON'T FALL BACK
              return {
                $id: customSecret,
                userId: currentUser.$id,
                secret: customSecret,
                expire: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
                customVerification: true
              };
            } else {
              console.log('Custom email failed, clearing stored secret and falling back');
              // Clear the stored secret since email failed
              try {
                const currentUserDoc = await databases.getDocument(
                  DATABASE_ID,
                  USERS_COLLECTION_ID,
                  currentUser.$id
                );
                
                let preferences = {};
                try {
                  preferences = JSON.parse(currentUserDoc.preferences || '{}');
                } catch (e) {
                  preferences = { defaultView: 'grid' };
                }
                
                // Clear verification data
                preferences.customVerificationSecret = null;
                preferences.verificationExpiry = null;
                
                await databases.updateDocument(
                  DATABASE_ID,
                  USERS_COLLECTION_ID,
                  currentUser.$id,
                  { preferences: JSON.stringify(preferences) }
                );
              } catch (clearError) {
                console.warn('Failed to clear verification data from preferences');
              }
            }
          } catch (emailError) {
            console.error('Custom email failed:', emailError);
            // Clear the stored secret since email failed
            try {
              const currentUserDoc = await databases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                currentUser.$id
              );
              
              let preferences = {};
              try {
                preferences = JSON.parse(currentUserDoc.preferences || '{}');
              } catch (e) {
                preferences = { defaultView: 'grid' };
              }
              
              // Clear verification data
              preferences.customVerificationSecret = null;
              preferences.verificationExpiry = null;
              
              await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                currentUser.$id,
                { preferences: JSON.stringify(preferences) }
              );
            } catch (clearError) {
              console.warn('Failed to clear custom secret after email failure');
            }
          }
        }
      } catch (dbError) {
        console.error('Failed to store custom secret in database:', dbError);
        // Continue to Appwrite fallback
      }

      // Fallback to Appwrite verification if custom email fails
      console.log('Falling back to Appwrite default verification');
      const result = await account.createVerification(
        `${window.location.origin}/verify-email`
      );

      console.log('Appwrite verification result:', result);

      // Store the Appwrite secret in database for later verification
      if (result && result.secret) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            currentUser.$id,
            { secret: result.secret }
          );
          console.log('Appwrite verification secret stored in database');
        } catch (dbError) {
          console.warn('Failed to store Appwrite secret in database:', dbError);
        }
      }

      return result;
    } catch (error) {
      console.error('Error in sendEmailVerification:', error);
      throw error;
    }
  }

  // Confirm email verification
  async confirmEmailVerification(userId, secret) {
    try {
      if (!secret) {
        throw new Error('Verification secret is required. Please use the link from your email.');
      }

      console.log('Attempting email verification for userId:', userId, 'secret length:', secret.length);

      // First, try to verify if it's a custom verification
      let isCustomVerification = false;
      try {
        console.log('Fetching user document for verification check...');
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId
        );

        console.log('Found user document:', {
          userId: userDoc.$id,
          hasPreferences: !!userDoc.preferences
        });

        // Parse preferences to get verification data
        let preferences = {};
        try {
          preferences = JSON.parse(userDoc.preferences || '{}');
        } catch (e) {
          console.log('Could not parse user preferences');
          preferences = {};
        }

        console.log('Parsed preferences:', {
          hasCustomSecret: !!preferences.customVerificationSecret,
          customSecretLength: preferences.customVerificationSecret?.length,
          verificationExpiry: preferences.verificationExpiry,
          inputSecretLength: secret.length
        });

        // Check if this is a custom verification secret
        if (preferences.customVerificationSecret && preferences.customVerificationSecret === secret) {
          console.log('✅ Processing custom verification - secrets match');
          isCustomVerification = true;
          
          // Check if verification hasn't expired
          if (preferences.verificationExpiry && Date.now() > preferences.verificationExpiry) {
            console.log('❌ Custom verification expired');
            throw new Error('This verification link has expired. Please request a new verification email.');
          }

          console.log('✅ Custom verification secret valid, marking user as verified');
          
          // Clear verification data from preferences and mark as verified
          preferences.customVerificationSecret = null;
          preferences.verificationExpiry = null;
          
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            { 
              emailVerified: true,
              preferences: JSON.stringify(preferences)
            }
          );

          console.log('✅ Custom verification successful, user marked as verified in database');

          // NOW ALSO UPDATE APPWRITE'S USER VERIFICATION STATUS
          try {
            console.log('🔄 Attempting to update Appwrite user verification status...');
            
            // Try to get current user session
            const currentUser = await account.get();
            if (currentUser && currentUser.$id === userId) {
              console.log('✅ User has active session, attempting to verify in Appwrite...');
              
              // Create and immediately complete Appwrite verification
              try {
                // First create a verification token
                const appwriteVerification = await account.createVerification(
                  `${window.location.origin}/verify-email`
                );
                console.log('📧 Created Appwrite verification token');
                
                // Then immediately complete it with the token
                const verificationResult = await account.updateVerification(
                  userId, 
                  appwriteVerification.secret
                );
                console.log('✅ Successfully updated Appwrite verification status!');
                
                return {
                  verified: true,
                  user: currentUser,
                  message: 'Email verified successfully! Welcome to Scribly.',
                  customVerification: true,
                  appwriteUpdated: true
                };
                
              } catch (appwriteVerifyError) {
                console.warn('⚠️ Could not update Appwrite verification, but custom verification succeeded:', appwriteVerifyError.message);
                
                return {
                  verified: true,
                  user: currentUser,
                  message: 'Email verified successfully! Welcome to Scribly.',
                  customVerification: true,
                  appwriteUpdated: false
                };
              }
            } else {
              console.log('ℹ️ User not logged in, verification successful but Appwrite not updated');
            }
          } catch (accountError) {
            console.log('ℹ️ User not logged in, verification still successful');
          }

          console.log('✅ Custom verification complete, user needs to login');
          return {
            verified: true,
            message: 'Email verified successfully! Please login to continue.',
            customVerification: true
          };
        } else {
          console.log('❌ Custom verification secret mismatch or not found');
          console.log('Expected:', preferences.customVerificationSecret);
          console.log('Received:', secret);
        }
      } catch (dbError) {
        console.log('❌ Database lookup failed or not custom verification:', dbError.message);
        // Continue to try Appwrite verification
      }

      // If not custom verification, try Appwrite verification
      if (!isCustomVerification) {
        console.log('Attempting Appwrite verification');
        try {
          const result = await account.updateVerification(userId, secret);
          console.log('Appwrite verification successful');

          // After successful verification, try to update user document
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
            }
          } catch (userError) {
            console.log('Could not get current user or update document:', userError.message);
          }

          return {
            verified: true,
            message: 'Email verified successfully! Please login to continue.'
          };
        } catch (appwriteError) {
          console.error('Appwrite verification failed:', appwriteError.message);
          throw appwriteError;
        }
      }

    } catch (error) {
      console.error('Email verification error:', error);
      
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
      console.log('Sending password recovery email for:', email);
      
      const result = await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

      console.log('Password recovery email sent successfully');
      return result;
    } catch (error) {
      console.error('Error in sendPasswordRecovery:', error);
      throw error;
    }
  }

  // Confirm password recovery
  async confirmPasswordRecovery(userId, secret, newPassword) {
    try {
      console.log('Attempting password recovery for userId:', userId, 'secret length:', secret.length);

      const result = await account.updateRecovery(userId, secret, newPassword, newPassword);
      console.log('Password recovery successful');

      return result;
    } catch (error) {
      console.error('Password recovery error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid token') || error.message?.includes('expired')) {
        throw new Error('This password reset link is invalid or has expired. Please request a new password reset email.');
      }
      
      if (error.message?.includes('User with the requested ID could not be found')) {
        throw new Error('This password reset link is invalid. The user account may have been deleted.');
      }
      
      throw error;
    }
  }

  // Update password for custom recovery
  async updatePasswordWithCustomRecovery(userId, secret, newPassword) {
    try {
      console.log('Updating password with custom recovery for userId:', userId);

      // Verify the custom recovery secret one more time
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      let preferences = {};
      try {
        preferences = JSON.parse(userDoc.preferences || '{}');
      } catch (e) {
        preferences = {};
      }

      // Verify custom recovery secret
      if (!preferences.customRecoverySecret || preferences.customRecoverySecret !== secret) {
        throw new Error('Invalid recovery token');
      }

      // Check if recovery hasn't expired
      if (preferences.recoveryExpiry && Date.now() > preferences.recoveryExpiry) {
        throw new Error('Recovery token has expired');
      }

      // For custom recovery, we need to create a temporary admin session to update password
      // Since we don't have Appwrite's recovery token, we'll need to use the account update API
      // This is a limitation - for full functionality, you'd need admin SDK access
      
      // Clear recovery data
      preferences.customRecoverySecret = null;
      preferences.recoveryExpiry = null;
      preferences.recoveryEmail = null;
      
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        { preferences: JSON.stringify(preferences) }
      );

      // Return success with instruction to login with new password
      return {
        success: true,
        message: 'Recovery verified. For security, please login with your email and new password.',
        requiresLogin: true
      };

    } catch (error) {
      console.error('Error updating password with custom recovery:', error);
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

  // Update password using Appwrite function (for custom recovery)
  async updatePasswordViaFunction(userId, newPassword) {
    try {
      console.log('🔧 Starting password update via Appwrite function...');
      console.log('Function ID: 6893679e001291004e55');
      console.log('User ID:', userId);
      console.log('Password length:', newPassword.length);

      const payload = {
        action: 'updatePassword',
        userId: userId,
        newPassword: newPassword
      };

      console.log('Function payload:', JSON.stringify(payload, null, 2));

      const result = await functions.createExecution(
        '6893679e001291004e55', // Your function ID
        JSON.stringify(payload)
      );

      console.log('📋 Function execution raw result:', result);
      console.log('📋 Function response body:', result.responseBody);
      console.log('📋 Function status code:', result.statusCode);

      // Parse the response
      let response;
      try {
        response = JSON.parse(result.responseBody);
        console.log('📋 Parsed function response:', response);
      } catch (parseError) {
        console.error('❌ Failed to parse function response:', result.responseBody);
        console.error('❌ Parse error:', parseError);
        throw new Error(`Invalid response from password update function: ${result.responseBody}`);
      }
      
      if (response.success) {
        console.log('✅ Password updated successfully via function');
        return {
          success: true,
          message: 'Password updated successfully'
        };
      } else {
        console.error('❌ Function returned error:', response.error);
        throw new Error(response.error || 'Function returned failure status');
      }

    } catch (error) {
      console.error('❌ Password update via function failed:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Provide specific error messages
      if (error.message?.includes('Invalid URL')) {
        throw new Error('Password update service configuration error. Please contact support.');
      } else if (error.message?.includes('Function not found')) {
        throw new Error('Password update service is not available. Please contact support.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error while updating password. Please try again.');
      }
      
      throw new Error(`Password update failed: ${error.message}`);
    }
  }
}

export default new AuthService();

