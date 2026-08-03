import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/auth.service';
import { getUser, getBusinessId, saveBusinessId, clearBusinessId } from '@/utils/tokenStorage';
import { businessService } from '@/services/business.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: null,
    userId: null,
  });
  const [selectedBusinessId, setSelectedBusinessId] = useState(() => getBusinessId());

  const setUserState = useCallback((user) => {
    setAuthState({
      isAuthenticated: Boolean(user),
      username: user?.username || null,
      userId: user?.userId || null,
    });
  }, []);

  const selectBusiness = useCallback((businessId) => {
    saveBusinessId(businessId);
    setSelectedBusinessId(businessId);
  }, []);

  const clearBusiness = useCallback(() => {
    clearBusinessId();
    setSelectedBusinessId(null);
  }, []);

  const initializeUserBusiness = useCallback(async () => {
    try {
      const { businessId, route } = await businessService.initializeBusiness();
      if (businessId) {
        selectBusiness(businessId);
      } else {
        clearBusiness();
      }
      return route;
    } catch (err) {
      console.error('Failed to initialize business:', err);
      clearBusiness();
      return ROUTES.BUSINESS_CREATE;
    }
  }, [selectBusiness, clearBusiness]);

  useEffect(() => {
    let active = true;

    const loadAuth = async () => {
      setLoading(true);
      const user = await authService.initializeAuth();

      if (active) {
        setUserState(user);
        if (user) {
          const storedBusinessId = getBusinessId();
          if (storedBusinessId) {
            setSelectedBusinessId(storedBusinessId);
          } else {
            try {
              const businesses = await businessService.loadBusinesses();
              if (businesses.length === 1) {
                const id = businesses[0].businessId;
                saveBusinessId(id);
                setSelectedBusinessId(id);
              }
            } catch (err) {
              console.error('Failed to auto-select business on load:', err);
            }
          }
        }
        setLoading(false);
      }
    };

    loadAuth();

    return () => {
      active = false;
    };
  }, [setUserState]);

  useEffect(() => {
    const syncAuthState = () => {
      setUserState(getUser());
      setSelectedBusinessId(getBusinessId());
    };

    window.addEventListener('auth-state-changed', syncAuthState);
    return () => window.removeEventListener('auth-state-changed', syncAuthState);
  }, [setUserState]);

  const login = useCallback(
    async (credentials) => {
      const user = await authService.login(credentials);
      setUserState(user);
      return user;
    },
    [setUserState]
  );

  const logout = useCallback(() => {
    authService.logout();
    clearBusiness();
    setUserState(null);
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate, setUserState, clearBusiness]);

  const value = useMemo(
    () => ({
      loading,
      isAuthenticated: authState.isAuthenticated,
      username: authState.username,
      userId: authState.userId,
      selectedBusinessId,
      selectBusiness,
      clearBusiness,
      initializeUserBusiness,
      login,
      logout,
    }),
    [
      authState.isAuthenticated,
      authState.userId,
      authState.username,
      loading,
      selectedBusinessId,
      selectBusiness,
      clearBusiness,
      initializeUserBusiness,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

