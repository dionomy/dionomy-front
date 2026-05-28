import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export type AttendanceRecord = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  checkedByTeacherId: string;
  checkedAt: string;
};

export type RecordAttendanceRequest = {
  sessionId: string;
  studentId: string;
  teacherId: string;
  status: AttendanceStatus;
};

export function listAttendance(sessionId: string) {
  return apiRequest<AttendanceRecord[]>(`/api/attendance/sessions/${sessionId}`);
}

export function recordAttendance(request: RecordAttendanceRequest) {
  return apiRequest<AttendanceRecord>(`/api/attendance/sessions/${request.sessionId}`, {
    method: 'POST',
    body: JSON.stringify({
      studentId: request.studentId,
      teacherId: request.teacherId,
      status: request.status,
    }),
  });
}

export function useAttendance(sessionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attendance(sessionId),
    queryFn: () => listAttendance(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance(record.sessionId) });
    },
  });
}
