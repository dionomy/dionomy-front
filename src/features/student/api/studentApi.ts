import { useQuery } from '@tanstack/react-query';
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

export function listStudents() {
  return apiRequest<Student[]>('/api/students');
}

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: listStudents,
  });
}
