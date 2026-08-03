import { apiFetch } from '@/services/api';
import { getAccessToken, getBusinessId } from '@/utils/tokenStorage';

const getHeaders = () => {
  const token = getAccessToken();
  const businessId = getBusinessId();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (businessId) headers['X-Business-Id'] = businessId;
  return headers;
};

export const getDashboardSummary = () =>
  apiFetch('/api/v1/dashboard/summary', { method: 'GET', headers: getHeaders() });

export const getTopSellingProducts = () =>
  apiFetch('/api/v1/dashboard/top-selling-products', { method: 'GET', headers: getHeaders() });

export const getSalesChart = (range = 'MONTH') =>
  apiFetch(`/api/v1/dashboard/sales-chart?range=${range}`, { method: 'GET', headers: getHeaders() });

export const dashboardApi = {
  getDashboardSummary,
  getTopSellingProducts,
  getSalesChart,
};
