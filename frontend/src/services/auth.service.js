import { authApi } from '@/api/auth.api';
import {
  clearAll,
  getAccessToken,
  getRefreshToken,
  getUser,
  saveAccessToken,
  saveRefreshToken,
  saveUser,
} from '@/utils/tokenStorage';

const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-state-changed'));
};

const storeTokens = (response) => {
  saveAccessToken(response?.accessToken);
  saveRefreshToken(response?.token);
};

export const validateCurrentToken = async () => {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('Something went wrong.');
  }

  const user = await authApi.validateToken(accessToken);
  saveUser(user);
  return user;
};

export const refreshAccessToken = async () => {
  const token = getRefreshToken();

  if (!token) {
    throw new Error('Something went wrong.');
  }

  const response = await authApi.refreshToken(token);
  storeTokens(response);
  return response;
};

export const login = async ({ username, password }) => {
  const response = await authApi.login({ username, password });
  storeTokens(response);

  const user = await validateCurrentToken();
  notifyAuthChange();
  return user;
};

export const signup = async ({ userName, email, phoneNumber, password }) => {
  const response = await authApi.signup({
    user_name: userName,
    email,
    phone_number: phoneNumber,
    password,
  });
  storeTokens(response);

  const user = await validateCurrentToken();
  notifyAuthChange();
  return user;
};

export const initializeAuth = async () => {
  if (!getAccessToken()) {
    return null;
  }

  try {
    return await validateCurrentToken();
  } catch {
    if (!getRefreshToken()) {
      clearAll();
      return null;
    }

    try {
      await refreshAccessToken();
      return await validateCurrentToken();
    } catch {
      clearAll();
      return null;
    }
  }
};

export const logout = () => {
  clearAll();
  notifyAuthChange();
};

export const isAuthenticated = () => Boolean(getUser() && getAccessToken());

export const authService = {
  login,
  signup,
  logout,
  initializeAuth,
  validateCurrentToken,
  refreshAccessToken,
  isAuthenticated,
};
