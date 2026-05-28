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
  recurrence: {
    frequency: 'WEEKLY';
    daysOfWeek: string[];
    until: string;
  } | null;
};

export type AssignStudentsRequest = {
  sessionId: string;
  studentIds: string[];
};

export type MoveScheduleRequest = {
  sessionId: string;
  startsAt: string;
  endsAt: string;
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

export function assignStudentsToSchedule(request: AssignStudentsRequest) {
  return apiRequest<ClassSession>(`/api/schedules/${request.sessionId}/students`, {
    method: 'PATCH',
    body: JSON.stringify({ studentIds: request.studentIds }),
  });
}

export function moveSchedule(request: MoveScheduleRequest) {
  return apiRequest<ClassSession>(`/api/schedules/${request.sessionId}/time`, {
    method: 'PATCH',
    body: JSON.stringify({
      startsAt: request.startsAt,
      endsAt: request.endsAt,
    }),
  });
}

export function cancelSchedule(sessionId: string) {
  return apiRequest<void>(`/api/schedules/${sessionId}`, {
    method: 'DELETE',
  });
}

export function useSchedules(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.schedules(from, to),
    queryFn: () => listSchedules(from, to),
  });
}

function invalidateScheduleRange(queryClient: ReturnType<typeof useQueryClient>, from: string, to: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.schedules(from, to) });
}

export function useCreateSchedule(from: string, to: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      invalidateScheduleRange(queryClient, from, to);
    },
  });
}

export function useAssignStudentsToSchedule(from: string, to: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignStudentsToSchedule,
    onSuccess: () => {
      invalidateScheduleRange(queryClient, from, to);
    },
  });
}

export function useMoveSchedule(from: string, to: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveSchedule,
    onSuccess: () => {
      invalidateScheduleRange(queryClient, from, to);
    },
  });
}

export function useCancelSchedule(from: string, to: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSchedule,
    onSuccess: () => {
      invalidateScheduleRange(queryClient, from, to);
    },
  });
}
