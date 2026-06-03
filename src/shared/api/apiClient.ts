const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const tenantIdByAcademyNumber = new Map<number, string>();

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
  const tenantId = init.headers instanceof Headers
    ? init.headers.get('X-Tenant-Id') ?? await resolveTenantId()
    : typeof init.headers === 'object' && init.headers !== null && 'X-Tenant-Id' in init.headers
      ? String(init.headers['X-Tenant-Id' as keyof typeof init.headers])
      : await resolveTenantId();
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenantId,
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

async function resolveTenantId() {
  const envTenantId = import.meta.env.VITE_DIONOMY_TENANT_ID;

  if (envTenantId) {
    return envTenantId;
  }

  const academyNumber = getAcademyNumberFromPath();
  if (!academyNumber) {
    return DEFAULT_TENANT_ID;
  }

  const cachedTenantId = tenantIdByAcademyNumber.get(academyNumber);
  if (cachedTenantId) {
    return cachedTenantId;
  }

  const response = await fetch(`/api/tenant/by-academy-number/${academyNumber}`);
  if (!response.ok) {
    throw new ApiError(`학원 ${academyNumber}번을 찾을 수 없습니다.`, response.status);
  }

  const tenant = await response.json() as { id: string };
  tenantIdByAcademyNumber.set(academyNumber, tenant.id);

  return tenant.id;
}

function getAcademyNumberFromPath() {
  const match = window.location.pathname.match(/^\/academy\/(\d+)(?:\/|$)/);

  return match ? Number(match[1]) : null;
}
