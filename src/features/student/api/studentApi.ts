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

export function listStudents() {
  return apiRequest<Student[]>('/api/students');
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

export function useRegisterStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
    },
  });
}
