import { authService } from '@/services/auth.service';
import { clearAll, getAccessToken, getRefreshToken, getUser } from '@/utils/tokenStorage';

export const AuthService = {
  getAccessToken() {
    return getAccessToken();
  },

  getRefreshToken() {
    return getRefreshToken();
  },

  getUser() {
    return getUser();
  },

  setAuth(tokens, user) {
    return { tokens, user };
  },

  clearAuth() {
    clearAll();
  },

  isAuthenticated() {
    return authService.isAuthenticated();
  },

  logout(navigate) {
    authService.logout();
    if (navigate) navigate('/login');
  },
};
