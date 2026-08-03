import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <SonnerToaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #e2e8f0',
            borderRadius: '1rem',
            color: '#191b23',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </>
  );
};
