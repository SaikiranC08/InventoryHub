const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getErrorMessage = (errorBody) => {
  if (!errorBody) return 'Something went wrong.';
  if (typeof errorBody === 'string') return errorBody;

  const message = errorBody.message || errorBody.error || errorBody.detail;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');

  return 'Something went wrong.';
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
};

export const apiFetch = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body:
        options.body && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new Error('Something went wrong.');
  }

  const body = response.status === 204 ? null : await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(body);
    const error = new Error(message);
    error.status = response.status;
    error.isForbidden = response.status === 403;
    throw error;
  }

  return body;
};
