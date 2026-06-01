import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type Student = {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  memo: string | null;
  tags: string[];
  createdAt: string;
};

export type RegisterStudentRequest = {
  name: string;
  phone: string;
  memo: string | null;
  tags: string[];
};

export type StudentPassSummary = {
  studentId: string;
  activePassId: string | null;
  remainingCount: number | null;
  totalCount: number | null;
  expiresOn: string | null;
  lifecycleStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'USED_UP' | null;
  expirationReason: 'PERIOD_EXPIRED' | 'COUNT_EXHAUSTED' | 'PERIOD_EXPIRING_SOON' | 'COUNT_LOW' | null;
  expiringSoon: boolean;
  lowRemaining: boolean;
};

export type StudentOperationSummary = {
  totalStudents: number;
  passExpiringSoonCount: number;
  passLowRemainingCount: number;
  students: StudentPassSummary[];
};

export function listStudents() {
  return apiRequest<Student[]>('/api/students');
}

export function getStudentOperationSummary() {
  return apiRequest<StudentOperationSummary>('/api/students/operation-summary');
}

export function registerStudent(request: RegisterStudentRequest) {
  return apiRequest<Student>('/api/students', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: listStudents,
  });
}

export function useStudentOperationSummary() {
  return useQuery({
    queryKey: queryKeys.studentOperationSummary,
    queryFn: getStudentOperationSummary,
  });
}

export function useRegisterStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    },
  });
}
