const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'https://localhost:51692';

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const incoming = options.headers as any;
    if (incoming instanceof Headers) {
      incoming.forEach((value: string, key: string) => {
        headers[key] = value;
      });
    } else if (Array.isArray(incoming)) {
      for (const [key, value] of incoming as [string, string][]) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, incoming);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!response.ok) {
    const message =
      (data as any)?.message ||
      (data as any)?.title ||
      `HTTP ${response.status}`;
    const error: any = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
