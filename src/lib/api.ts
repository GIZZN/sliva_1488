import { ApiResponse } from '@/types';

/**
 * Generic API fetch wrapper with error handling
 */
export async function fetchApi<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST request helper
 */
export async function postApi<T = unknown>(
  url: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * GET request helper
 */
export async function getApi<T = unknown>(url: string): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'GET',
  });
}
