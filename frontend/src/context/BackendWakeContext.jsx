import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const BackendWakeContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Ping backend reachability endpoint (e.g., Auth service validate route via Kong)
const checkBackendReachability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/auth/v1/validate`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If HTTP status is < 500 (e.g. 401 Unauthorized or 200 OK), backend is up & running!
    return response.status < 500;
  } catch {
    return false;
  }
};

// Module-level singleton variables to guard against React StrictMode duplicate calls
let activeWakePromise = null;
let isWakeCompleted = false;

export const BackendWakeProvider = ({ children }) => {
  const [status, setStatus] = useState('starting'); // 'starting' | 'ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const executeWakeProcedure = useCallback(async (isRetry = false) => {
    if (isWakeCompleted && !isRetry) {
      setStatus('ready');
      return;
    }

    setStatus('starting');
    setErrorMessage('');

    // 1. FAST PATH: Check if backend is already running before triggering Azure Function
    const alreadyUp = await checkBackendReachability();
    if (alreadyUp) {
      isWakeCompleted = true;
      setStatus('ready');
      return;
    }

    // 2. Trigger Azure Function via Vercel Serverless Endpoint
    try {
      await fetch('/api/wake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('Vercel serverless /api/wake request warning:', err);
      // Continue to polling in case VM is already waking or started
    }

    // 3. Poll backend until reachable or timeout (180 seconds total: 60 attempts * 3 seconds)
    const MAX_ATTEMPTS = 60;
    const POLL_INTERVAL_MS = 3000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const isUp = await checkBackendReachability();
      if (isUp) {
        isWakeCompleted = true;
        setStatus('ready');
        return;
      }
    }

    // If polling timed out
    setStatus('error');
    setErrorMessage('Backend could not be started. Please try again.');
  }, []);

  const triggerWake = useCallback((isRetry = false) => {
    if (isRetry) {
      activeWakePromise = null;
      isWakeCompleted = false;
    }

    if (activeWakePromise) {
      return activeWakePromise;
    }

    activeWakePromise = executeWakeProcedure(isRetry).finally(() => {
      if (!isWakeCompleted) {
        activeWakePromise = null;
      }
    });

    return activeWakePromise;
  }, [executeWakeProcedure]);

  const retry = useCallback(() => {
    triggerWake(true);
  }, [triggerWake]);

  useEffect(() => {
    triggerWake(false);
  }, [triggerWake]);

  const value = useMemo(
    () => ({
      status,
      isStarting: status === 'starting',
      isBackendReady: status === 'ready',
      isError: status === 'error',
      errorMessage,
      retry,
    }),
    [status, errorMessage, retry]
  );

  return (
    <BackendWakeContext.Provider value={value}>
      {children}
    </BackendWakeContext.Provider>
  );
};
