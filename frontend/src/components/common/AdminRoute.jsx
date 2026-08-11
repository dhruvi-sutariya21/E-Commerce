import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-[#E91E63] rounded-full animate-spin"></div>
        <p className="text-xs text-gray-500 font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl text-center space-y-4 border border-rose-100">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">Access Restricted</h2>
        <p className="text-xs text-gray-500">
          Only authorized administrators can access the AURA management portal.
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return children;
};

export default AdminRoute;
