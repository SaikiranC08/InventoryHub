import { apiFetch } from '@/services/api';
import { getAccessToken } from '@/utils/tokenStorage';

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getBusinesses = () => {
  return apiFetch('/api/v1/business', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const createBusiness = (payload) => {
  return apiFetch('/api/v1/business', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: payload,
  });
};

export const getBusinessById = (businessId) => {
  return apiFetch(`/api/v1/business/${businessId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const getAllBusinesses = () => {
  return apiFetch('/api/v1/business/all', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const businessApi = {
  getBusinesses,
  createBusiness,
  getBusinessById,
  getAllBusinesses,
};

