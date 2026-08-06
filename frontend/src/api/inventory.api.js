import { apiFetch } from '@/services/api';
import { getAccessToken, getBusinessId } from '@/utils/tokenStorage';

const getHeaders = () => {
  const token = getAccessToken();
  const businessId = getBusinessId();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (businessId) {
    headers['X-Business-Id'] = businessId;
  }
  return headers;
};

export const getInventory = () => {
  return apiFetch('/api/v1/inventory', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const purchaseStock = (payload) => {
  return apiFetch('/api/v1/inventory/external-supplier', {
    method: 'POST',
    headers: getHeaders(),
    body: payload,
  });
};

export const sellStock = (payload) => {
  return apiFetch('/api/v1/inventory/external-buyer', {
    method: 'POST',
    headers: getHeaders(),
    body: payload,
  });
};

export const transferStock = (payload) => {
  return apiFetch('/api/v1/inventory/stock-transfer', {
    method: 'POST',
    headers: getHeaders(),
    body: payload,
  });
};

export const searchMarketplace = (query) => {
  return apiFetch(`/api/v1/inventory/search?query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const createStockRequest = (payload) => {
  return apiFetch('/api/v1/inventory/stock-requests', {
    method: 'POST',
    headers: getHeaders(),
    body: payload,
  });
};

export const getStockRequests = () => {
  return apiFetch('/api/v1/inventory/stock-requests', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const updateStockRequest = (requestId, status) => {
  return apiFetch(`/api/v1/inventory/stock-requests/${requestId}?status=${status}`, {
    method: 'PUT',
    headers: getHeaders(),
  });
};

export const counterStockRequest = (requestId, counterUnitPrice, counterQuantity) => {
  const params = new URLSearchParams();
  if (counterUnitPrice !== undefined && counterUnitPrice !== null) params.append('counterUnitPrice', counterUnitPrice);
  if (counterQuantity !== undefined && counterQuantity !== null) params.append('counterQuantity', counterQuantity);

  return apiFetch(`/api/v1/inventory/stock-requests/${requestId}/counter?${params.toString()}`, {
    method: 'POST',
    headers: getHeaders(),
  });
};

export const getStockMovements = () => {
  return apiFetch('/api/v1/inventory/movements', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getSalesOrders = () => {
  return apiFetch('/api/v1/inventory/sales-orders', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getPurchaseOrders = () => {
  return apiFetch('/api/v1/inventory/purchase-orders', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const inventoryApi = {
  getInventory,
  purchaseStock,
  sellStock,
  transferStock,
  searchMarketplace,
  createStockRequest,
  getStockRequests,
  updateStockRequest,
  counterStockRequest,
  getStockMovements,
  getSalesOrders,
  getPurchaseOrders,
};
