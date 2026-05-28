import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type ClassType = 'GROUP' | 'ONE_ON_ONE';

export type ClassSession = {
  id: string;
  tenantId: string;
  title: string;
  type: ClassType;
  teacherId: string;
  placeId: string | null;
  startsAt: string;
  endsAt: string;
  currentCapacity: number;
  maximumCapacity: number;
  assignedStudentIds: string[];
  recurrence: {
    frequency: string;
    daysOfWeek: string[];
    until: string;
  } | null;
};

export type CreateClassSessionRequest = {
  title: string;
  type: ClassType;
  teacherId: string;
  placeId: string | null;
  startsAt: string;
  endsAt: string;
  currentCapacity: number;
  maximumCapacity: number;
  assignedStudentIds: string[];
  recurrence: null;
};

export function listSchedules(from: string, to: string) {
  return apiRequest<ClassSession[]>(`/api/schedules?from=${from}&to=${to}`);
}

export function createSchedule(request: CreateClassSessionRequest) {
  return apiRequest<ClassSession>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useSchedules(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.schedules(from, to),
    queryFn: () => listSchedules(from, to),
  });
}

export function useCreateSchedule(from: string, to: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules(from, to) });
    },
  });
}
