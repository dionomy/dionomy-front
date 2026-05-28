const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': import.meta.env.VITE_DIONOMY_TENANT_ID ?? DEFAULT_TENANT_ID,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || 'API 요청에 실패했습니다.', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
