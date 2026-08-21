import { useContext } from 'react';
import { BackendWakeContext } from '@/context/BackendWakeContext';

export const useBackendWake = () => {
  const context = useContext(BackendWakeContext);
  if (!context) {
    throw new Error('useBackendWake must be used within a BackendWakeProvider');
  }
  return context;
};
