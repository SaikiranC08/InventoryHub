import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy-loaded pages
const LandingPage = lazy(() =>
  import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const BusinessSelectPage = lazy(() =>
  import('@/features/business/BusinessSelectPage').then((m) => ({ default: m.BusinessSelectPage }))
);
const BusinessCreatePage = lazy(() =>
  import('@/features/business/BusinessCreatePage').then((m) => ({ default: m.BusinessCreatePage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const InventoryPage = lazy(() =>
  import('@/features/inventory/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const StockHistoryPage = lazy(() =>
  import('@/features/stock-history/StockHistoryPage').then((m) => ({ default: m.StockHistoryPage }))
);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stitch-surface p-4">
    <div className="space-y-4 max-w-md w-full">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-10 w-3/4 rounded-xl mx-auto" />
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-stitch-surface p-4 text-center">
    <h1 className="text-6xl font-extrabold font-mono text-stitch-primary">404</h1>
    <p className="text-xl font-bold text-slate-900 mt-2">Page Not Found</p>
    <p className="text-sm text-slate-500 mt-1 max-w-sm">
      The page you are looking for does not exist or has been moved.
    </p>
    <a
      href="/"
      className="mt-6 inline-flex items-center justify-center h-10 px-6 font-semibold text-white bg-stitch-primary rounded-xl shadow-md hover:bg-stitch-primary-dark transition-all"
    >
      Return Home
    </a>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          <Route path={ROUTES.STOCK_HISTORY} element={<StockHistoryPage />} />
          <Route path={ROUTES.BUSINESS_SELECT} element={<BusinessSelectPage />} />
          <Route path={ROUTES.BUSINESS_CREATE} element={<BusinessCreatePage />} />
        </Route>
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};
