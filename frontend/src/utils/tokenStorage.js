const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USERNAME_KEY = 'username';
const USER_ID_KEY = 'userId';
const BUSINESS_ID_KEY = 'businessId';

export const saveAccessToken = (token) => {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const saveRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const saveUser = ({ username, userId }) => {
  if (username) localStorage.setItem(USERNAME_KEY, username);
  if (userId !== undefined && userId !== null) {
    localStorage.setItem(USER_ID_KEY, String(userId));
  }
};

export const getUser = () => {
  const username = localStorage.getItem(USERNAME_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);

  if (!username || !userId) return null;

  return {
    username,
    userId: Number(userId),
  };
};

export const saveBusinessId = (businessId) => {
  if (businessId !== undefined && businessId !== null) {
    localStorage.setItem(BUSINESS_ID_KEY, String(businessId));
  }
};

export const getBusinessId = () => {
  const id = localStorage.getItem(BUSINESS_ID_KEY);
  return id ? Number(id) : null;
};

export const clearBusinessId = () => {
  localStorage.removeItem(BUSINESS_ID_KEY);
};

export const clearAll = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(BUSINESS_ID_KEY);
};

