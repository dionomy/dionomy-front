import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type RetentionSignal = {
  type: 'DORMANT' | 'PASS_EXPIRING_SOON' | 'FREQUENT_CHANGES' | 'MAKEUP_ACCUMULATED' | 'NEW_SETTLING';
  label: string;
  reason: string;
};

export type RiskStudent = {
  studentId: string;
  studentName: string;
  signals: RetentionSignal[];
};

export type CareRecordStatus = 'PENDING' | 'CONTACTED' | 'RENEWED' | 'DROPPED';

export type CareRecord = {
  id: string;
  studentId: string;
  memo: string;
  status: CareRecordStatus;
  createdAt: string;
};

export function listRiskStudents() {
  return apiRequest<RiskStudent[]>('/api/crm/risk-students');
}

export function listCareRecords(studentId: string) {
  return apiRequest<CareRecord[]>(`/api/crm/students/${studentId}/care-records`);
}

export function createCareRecord(request: { studentId: string; memo: string; status: CareRecordStatus }) {
  return apiRequest<CareRecord>(`/api/crm/students/${request.studentId}/care-records`, {
    method: 'POST',
    body: JSON.stringify({
      memo: request.memo,
      status: request.status,
    }),
  });
}

export function useRiskStudents() {
  return useQuery({
    queryKey: queryKeys.riskStudents,
    queryFn: listRiskStudents,
  });
}

export function useCareRecords(studentId?: string) {
  return useQuery({
    queryKey: queryKeys.careRecords(studentId),
    queryFn: () => listCareRecords(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useCreateCareRecord(studentId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCareRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.careRecords(studentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.riskStudents });
    },
  });
}
