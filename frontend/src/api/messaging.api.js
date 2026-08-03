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

export const getConversations = () => {
  return apiFetch('/api/v1/conversations', {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const getConversationMessages = (conversationId, page = 0, size = 20) => {
  return apiFetch(`/api/v1/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
    method: 'GET',
    headers: getHeaders(),
  });
};

export const markAsRead = (conversationId, lastReadMessageId) => {
  return apiFetch(`/api/v1/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: { lastReadMessageId },
  });
};

export const messagingApi = {
  getConversations,
  getConversationMessages,
  markAsRead,
};
