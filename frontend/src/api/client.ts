const BASE_URL = '/api';

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Array<{ field: string; message: string }>;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('jmz_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw {
      message: 'Network connection error. Please check if the server is running.',
      status: 0,
    } as ApiError;
  }

  // Handle 401 and attempt refresh token
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    const refreshToken = localStorage.getItem('jmz_refresh_token');

    if (!refreshToken) {
      localStorage.removeItem('jmz_access_token');
      localStorage.removeItem('jmz_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw { message: 'Session expired', status: 401 } as ApiError;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiFetch<T>(endpoint, options));
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.data?.accessToken;
      const newRefreshToken = refreshData.data?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('jmz_access_token', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('jmz_refresh_token', newRefreshToken);
      }

      processQueue(null);
      isRefreshing = false;

      // Retry original request with new token
      return apiFetch<T>(endpoint, options);
    } catch (refreshErr) {
      processQueue(refreshErr as Error);
      isRefreshing = false;
      localStorage.removeItem('jmz_access_token');
      localStorage.removeItem('jmz_refresh_token');
      localStorage.removeItem('jmz_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw { message: 'Session expired. Please log in again.', status: 401 } as ApiError;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      message: data.message || `Request failed with status ${response.status}`,
      code: data.code,
      status: response.status,
      errors: data.errors,
    } as ApiError;
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};
