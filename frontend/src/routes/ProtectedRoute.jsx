import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stitch-surface p-4">
    <div className="space-y-4 max-w-md w-full">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-10 w-3/4 rounded-xl mx-auto" />
    </div>
  </div>
);

export const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};
