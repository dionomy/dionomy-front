import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';
import type { AcademySettings } from '../model/settingsTypes';

export function getAcademySettings() {
  return apiRequest<AcademySettings>('/api/academy/settings');
}

export function updateAcademySettings(settings: AcademySettings) {
  return apiRequest<AcademySettings>('/api/academy/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function useAcademySettings() {
  return useQuery({
    queryKey: queryKeys.academySettings,
    queryFn: getAcademySettings,
  });
}

export function useUpdateAcademySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAcademySettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.academySettings, settings);
    },
  });
}
