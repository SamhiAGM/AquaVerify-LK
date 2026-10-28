import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const getRoleHomePath = (role?: Role): string => {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'OFFICER':
      return '/dashboard/officer';
    case 'LAB_TECHNICIAN':
      return '/dashboard/laboratory';
    case 'CITIZEN':
    default:
      return '/dashboard/citizen';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 font-medium">Verifying AquaVerify Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their assigned role dashboard
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <>{children}</>;
};
