import { apiFetch } from './api';

const createMethod = (method) => async (path, body, options = {}) => {
  const data = await apiFetch(path, {
    ...options,
    method,
    body,
  });

  return { data };
};

export const apiClient = {
  get: async (path, options = {}) => {
    const data = await apiFetch(path, {
      ...options,
      method: 'GET',
    });

    return { data };
  },
  post: createMethod('POST'),
  put: createMethod('PUT'),
  patch: createMethod('PATCH'),
  delete: createMethod('DELETE'),
};
