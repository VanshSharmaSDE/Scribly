import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔄 AuthContext: Checking authentication status...');
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log('✅ AuthContext: User found:', { 
          id: currentUser.$id, 
          email: currentUser.email, 
          emailVerification: currentUser.emailVerification 
        });
        setUser(currentUser);
        setIsAuthenticated(true);

        // Get user document from database
        const userDocument = await authService.getUserDocument(currentUser.$id);
        console.log('📄 AuthContext: User document loaded:', {
          emailVerified: userDocument.emailVerified,
          hasPreferences: !!userDocument.preferences
        });
        setUserDoc(userDocument);
      } else {
        console.log('❌ AuthContext: No authenticated user found');
      }
    } catch (error) {
      console.log('🚫 AuthContext: Auth check failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const session = await authService.login(credentials);
      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        // Get user document
        const userDocument = await authService.getUserDocument(currentUser.$id);
        setUserDoc(userDocument);

        return { success: true };
      }
    } catch (error) {

      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const result = await authService.createAccount(userData);
      if (result) {
        // User account created and verification email sent
        // User is logged out and needs to verify email first
        return { 
          success: true, 
          needsVerification: true,
          message: result.message || 'Account created! Please check your email and verify your account before logging in.'
        };
      }
    } catch (error) {

      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUserDoc(null);
      setIsAuthenticated(false);
      toast.success("You have been logged out successfully");
    } catch (error) {

      throw error;
    }
  };

  const verifyEmail = async (userId, secret) => {
    try {

      const result = await authService.confirmEmailVerification(userId, secret);

      // If verification was successful, ALWAYS refresh user data
      if (result.verified) {
        console.log('📧 Email verification successful, refreshing user context...');
        
        if (result.user) {
          // User is logged in, update context immediately
          console.log('🔄 User is logged in, updating context with verified user');
          setUser(result.user);
          setIsAuthenticated(true);
          
          // Refresh user document to get updated emailVerified status
          const userDocument = await authService.getUserDocument(result.user.$id);
          console.log('📄 Updated user document:', { 
            emailVerified: userDocument?.emailVerified,
            userId: userDocument?.$id 
          });
          setUserDoc(userDocument);
          
          return { 
            success: true, 
            message: result.message,
            user: result.user
          };
        } else {
          // User not logged in but verification successful
          console.log('🔄 User not logged in, but verification successful');
          
          // Try to refresh auth context in case there's a session
          try {
            console.log('🔍 Checking for existing session after verification...');
            await checkAuth();
            console.log('✅ Auth context refreshed after verification');
          } catch (error) {
            console.log('ℹ️ No active session to refresh');
          }
          
          return { 
            success: true, 
            message: result.message,
            needsLogin: true
          };
        }
      } else {
        return { 
          success: false, 
          message: result.message || 'Verification failed'
        };
      }
    } catch (error) {
      console.error('🚫 Email verification error in AuthContext:', error);
      throw error;
    }
  };

  const sendPasswordRecovery = async (email) => {
    try {
      console.log('AuthContext: sendPasswordRecovery called with email:', email);
      const result = await authService.sendPasswordRecovery(email);
      console.log('AuthContext: sendPasswordRecovery result:', result);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: sendPasswordRecovery error:', error);
      throw error;
    }
  };

  const resetPassword = async (userId, secret, newPassword) => {
    try {
      await authService.confirmPasswordRecovery(userId, secret, newPassword);
      return { success: true };
    } catch (error) {

      throw error;
    }
  };

  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
  };

  // Force refresh user data - useful after verification
  const refreshUserData = async () => {
    try {
      console.log('🔄 Manually refreshing user data...');
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log('✅ Current user found, updating context');
        setUser(currentUser);
        setIsAuthenticated(true);

        // Get updated user document from database
        const userDocument = await authService.getUserDocument(currentUser.$id);
        console.log('📄 Refreshed user document:', {
          emailVerified: userDocument?.emailVerified,
          userId: userDocument?.$id
        });
        setUserDoc(userDocument);
        
        return { user: currentUser, userDoc: userDocument };
      } else {
        console.log('❌ No current user found during refresh');
        setUser(null);
        setUserDoc(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      console.error('🚫 Error refreshing user data:', error);
      return null;
    }
  };

  const value = {
    user,
    userDoc,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    verifyEmail,
    sendPasswordRecovery,
    resetPassword,
    checkAuth,
    updateUserInContext,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

