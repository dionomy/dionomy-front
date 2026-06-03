import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';
import type { AcademySettings } from '../model/settingsTypes';

export function getAcademySettings(tenantId?: string) {
  return apiRequest<AcademySettings>('/api/academy/settings', tenantId ? { headers: { 'X-Tenant-Id': tenantId } } : undefined);
}

export function updateAcademySettings(settings: AcademySettings, tenantId?: string) {
  return apiRequest<AcademySettings>('/api/academy/settings', {
    method: 'PUT',
    headers: tenantId ? { 'X-Tenant-Id': tenantId } : undefined,
    body: JSON.stringify(settings),
  });
}

export function useAcademySettings(tenantId?: string) {
  return useQuery({
    queryKey: queryKeys.academySettings(tenantId),
    queryFn: () => getAcademySettings(tenantId),
  });
}

export function useUpdateAcademySettings(tenantId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AcademySettings) => updateAcademySettings(settings, tenantId),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.academySettings(tenantId), settings);
    },
  });
}
