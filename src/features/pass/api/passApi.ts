import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type PassProduct = {
  id: string;
  tenantId: string;
  name: string;
  totalCount: number;
  validDays: number;
  price: number;
  createdAt: string;
};

export type StudentPass = {
  id: string;
  tenantId: string;
  productId: string;
  studentId: string;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  issuedOn: string;
  expiresOn: string;
  expired: boolean;
};

export type CreatePassProductRequest = {
  name: string;
  totalCount: number;
  validDays: number;
  price: number;
};

export type IssueStudentPassRequest = {
  studentId: string;
  productId: string;
  issuedOn: string | null;
};

export function listPassProducts() {
  return apiRequest<PassProduct[]>('/api/pass-products');
}

export function createPassProduct(request: CreatePassProductRequest) {
  return apiRequest<PassProduct>('/api/pass-products', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function listStudentPasses(studentId: string) {
  return apiRequest<StudentPass[]>(`/api/students/${studentId}/passes`);
}

export function issueStudentPass(request: IssueStudentPassRequest) {
  return apiRequest<StudentPass>(`/api/students/${request.studentId}/passes`, {
    method: 'POST',
    body: JSON.stringify({
      productId: request.productId,
      issuedOn: request.issuedOn,
    }),
  });
}

export function usePassProducts() {
  return useQuery({
    queryKey: queryKeys.passProducts,
    queryFn: listPassProducts,
  });
}

export function useCreatePassProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPassProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.passProducts });
    },
  });
}

export function useStudentPasses(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.studentPasses(studentId),
    queryFn: () => listStudentPasses(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useIssueStudentPass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issueStudentPass,
    onSuccess: (studentPass) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPasses(studentPass.studentId) });
    },
  });
}
