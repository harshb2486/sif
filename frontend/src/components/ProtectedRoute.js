// Protected Route Component
// Routes that require authentication

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireVerification = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
      ? [requiredRole]
      : [];

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Block unverified sales users from accessing protected areas,
  // allowing only the waiting-approval page.
  if (
    user?.role === 'sales' &&
    !user?.is_verified &&
    location.pathname !== '/waiting-approval'
  ) {
    return <Navigate to="/waiting-approval" replace />;
  }

  if (requireVerification && !user?.is_verified) {
    return <Navigate to="/waiting-approval" replace />;
  }

  return children;
};
