import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please log in to access this page');
    }
  }, [loading, isAuthenticated]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-scribly-black flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email is verified (optional - you can remove this if you want)
  if (!user.emailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  // User is authenticated and verified, render the protected component
  return children;
};

export default ProtectedRoute;
