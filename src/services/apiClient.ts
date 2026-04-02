const env = (import.meta as any).env ?? {};

const RAW_PRIMARY_BASE_URL = env.VITE_API_BASE_URL || 'https://localhost:51692';
const RAW_FALLBACK_BASE_URLS = env.VITE_API_BASE_URLS || '';

const DEFAULT_FALLBACKS = [
  'https://localhost:51692',
  'http://localhost:51692',
  'https://localhost:5001',
  'http://localhost:5000',
  'https://localhost:7001',
  'http://localhost:7000',
];

function normalizeBaseUrl(url: string) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function uniqueBaseUrls(urls: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    const url = normalizeBaseUrl(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    result.push(url);
  }

  return result;
}

function buildBaseUrlCandidates() {
  const envList = String(RAW_FALLBACK_BASE_URLS)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  return uniqueBaseUrls([RAW_PRIMARY_BASE_URL, ...envList, ...DEFAULT_FALLBACKS]);
}

const API_BASE_URL_CANDIDATES = buildBaseUrlCandidates();

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function fetchWithFallback(path: string, options: RequestInit) {
  let lastError: unknown;

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      return response;
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError ?? new Error('Failed to fetch API endpoint');
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

  const response = await fetchWithFallback(path, {
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
