import { apiFetch } from '@/services/api';
import { getAccessToken } from '@/utils/tokenStorage';

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCategories = () => {
  return apiFetch('/api/v1/categories', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const getCategoryAttributes = (categoryId) => {
  return apiFetch(`/api/v1/categories/${categoryId}/attributes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const getOrCreateProduct = (payload) => {
  return apiFetch('/api/v1/products/create-or-find', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: payload,
  });
};

export const getOrCreateVariant = (payload) => {
  return apiFetch('/api/v1/products/product-variant/create-or-find', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: payload,
  });
};

export const getUnitTypes = () => {
  return apiFetch('/api/v1/products/unit-types', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const productsApi = {
  getCategories,
  getCategoryAttributes,
  getOrCreateProduct,
  getOrCreateVariant,
  getUnitTypes,
};
