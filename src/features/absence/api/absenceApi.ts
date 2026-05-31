import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type AbsenceDesiredResult = 'MOVE_TO_OTHER_SESSION' | 'MAKEUP';
export type AbsenceRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AbsenceRequest = {
  id: string;
  studentId: string;
  sessionId: string;
  reason: string;
  desiredResult: AbsenceDesiredResult;
  status: AbsenceRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedTargetSessionId: string | null;
  resolvedTargetAvailabilityId: string | null;
};

export type CreateAbsenceRequest = {
  studentId: string;
  sessionId: string;
  reason: string;
  desiredResult: AbsenceDesiredResult;
};

export function listAbsenceRequests(studentId?: string) {
  const query = studentId ? `?studentId=${studentId}` : '';
  return apiRequest<AbsenceRequest[]>(`/api/absence-requests${query}`);
}

export function createAbsenceRequest(request: CreateAbsenceRequest) {
  return apiRequest<AbsenceRequest>('/api/absence-requests', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function approveAbsenceRequest(request: { requestId: string; targetSessionId?: string | null; targetAvailabilityId?: string | null }) {
  return apiRequest<AbsenceRequest>(`/api/absence-requests/${request.requestId}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      targetSessionId: request.targetSessionId ?? null,
      targetAvailabilityId: request.targetAvailabilityId ?? null,
    }),
  });
}

export function rejectAbsenceRequest(requestId: string) {
  return apiRequest<AbsenceRequest>(`/api/absence-requests/${requestId}/reject`, {
    method: 'POST',
  });
}

export function useAbsenceRequests(studentId?: string) {
  return useQuery({
    queryKey: queryKeys.absenceRequests(studentId),
    queryFn: () => listAbsenceRequests(studentId),
  });
}

export function useCreateAbsenceRequest(studentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAbsenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.absenceRequests(studentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.absenceRequests() });
    },
  });
}

export function useResolveAbsenceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action, targetSessionId, targetAvailabilityId }: { requestId: string; action: 'approve' | 'reject'; targetSessionId?: string | null; targetAvailabilityId?: string | null }) =>
      action === 'approve' ? approveAbsenceRequest({ requestId, targetSessionId, targetAvailabilityId }) : rejectAbsenceRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.absenceRequests() });
    },
  });
}
