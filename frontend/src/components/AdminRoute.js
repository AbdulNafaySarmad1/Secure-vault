import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!user || !hasRole('admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
