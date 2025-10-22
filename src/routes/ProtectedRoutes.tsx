import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BottomNav } from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProtectedRoutes() {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('ProtectedRoutes:', { isAuthenticated, loading, hasUser: !!user });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-foreground text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

