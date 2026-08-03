import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/providers/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/AuthContext';

export function App() {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
export default App;
