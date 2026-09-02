/**
 * Central HTTP API client for Sqbe HRMS Frontend
 * Handles automatic JWT bearer token headers, credentials, error unwrapping, and typed responses.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiClientError extends Error {
  public code: string;
  public details?: any;
  public statusCode?: number;

  constructor(message: string, code: string = 'API_ERROR', details?: any, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

const BASE_URL = '/api/v1';

class ApiClient {
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    const token = localStorage.getItem('sqbe_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(options.headers as Record<string, string>),
      credentials: 'include', // Includes HTTP-only refresh token cookies
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json().catch(() => ({
        success: false,
        data: null as any,
        error: { code: 'INVALID_JSON', message: `Server returned status ${response.status}` },
      }));

      if (!response.ok || !data.success) {
        throw new ApiClientError(
          data.error?.message || `Request failed with status ${response.status}`,
          data.error?.code || `HTTP_${response.status}`,
          data.error?.details,
          response.status
        );
      }

      return data.data;
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(err.message || 'Network communication error', 'NETWORK_ERROR');
    }
  }

  public get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
