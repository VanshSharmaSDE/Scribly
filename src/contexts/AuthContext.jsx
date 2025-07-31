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
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);

        // Get user document from database
        const userDocument = await authService.getUserDocument(currentUser.$id);
        setUserDoc(userDocument);
      }
    } catch (error) {

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

      // If verification was successful and user is logged in, refresh user data
      if (result.verified && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        
        const userDocument = await authService.getUserDocument(result.user.$id);
        setUserDoc(userDocument);
        
        return { 
          success: true, 
          message: result.message,
          user: result.user
        };
      } else {
        // Verification successful but user needs to login
        return { 
          success: true, 
          message: result.message,
          needsLogin: true
        };
      }
    } catch (error) {

      throw error;
    }
  };

  const sendPasswordRecovery = async (email) => {
    try {
      await authService.sendPasswordRecovery(email);
      return { success: true };
    } catch (error) {

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

