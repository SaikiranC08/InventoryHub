import React from 'react';
import { Outlet } from 'react-router-dom';

export const ApplicationLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-stitch-surface text-stitch-text font-sans antialiased">
      <main className="w-full min-h-screen">
        {children || <Outlet />}
      </main>
    </div>
  );
};
