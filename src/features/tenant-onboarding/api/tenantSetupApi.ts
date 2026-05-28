import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type TenantSetup = {
  id: string;
  academyName: string;
  ownerContact: string;
  mainColor: string;
  tenantStatus: 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
  buildStatus: 'QUEUED' | 'BUILDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
};

export function listTenantSetups() {
  return apiRequest<TenantSetup[]>('/api/admin/tenant-setups');
}

export function createTenantSetup(request: { academyName: string; ownerContact: string; mainColor: string }) {
  return apiRequest<TenantSetup>('/api/admin/tenant-setups', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateTenantSetupStatus(request: { setupId: string; status: TenantSetup['tenantStatus'] }) {
  return apiRequest<TenantSetup>(`/api/admin/tenant-setups/${request.setupId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: request.status }),
  });
}

export function useTenantSetups() {
  return useQuery({
    queryKey: queryKeys.tenantSetups,
    queryFn: listTenantSetups,
  });
}

export function useCreateTenantSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTenantSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantSetups });
    },
  });
}

export function useUpdateTenantSetupStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenantSetupStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantSetups });
    },
  });
}
