import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ErrorBoundary } from '@/providers/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import { AuthProvider } from '@/context/AuthContext';
import { BackendWakeProvider } from '@/context/BackendWakeContext';

export function App() {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <BackendWakeProvider>
                <AuthProvider>
                  <AppRoutes />
                </AuthProvider>
              </BackendWakeProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}
export default App;
