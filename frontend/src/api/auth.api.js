import { apiFetch } from '@/services/api';

const AUTH_ROUTES = {
  login: '/auth/v1/login',
  signup: '/auth/v1/signup',
  validate: '/auth/v1/validate',
  refreshToken: '/auth/v1/refreshToken',
};

export const login = (payload) => {
  return apiFetch(AUTH_ROUTES.login, {
    method: 'POST',
    body: payload,
  });
};

export const signup = (payload) => {
  return apiFetch(AUTH_ROUTES.signup, {
    method: 'POST',
    body: payload,
  });
};

export const validateToken = (accessToken) => {
  return apiFetch(AUTH_ROUTES.validate, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const refreshToken = (token) => {
  return apiFetch(AUTH_ROUTES.refreshToken, {
    method: 'POST',
    body: { token },
  });
};

export const authApi = {
  login,
  signup,
  validateToken,
  refreshToken,
};
