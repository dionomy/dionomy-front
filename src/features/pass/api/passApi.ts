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

export type PassUsageType = 'CONSUME' | 'RESTORE';

export type PassUsageLog = {
  id: string;
  passId: string;
  studentId: string;
  type: PassUsageType;
  count: number;
  reason: string;
  createdAt: string;
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

export type RecordPassUsageRequest = {
  passId: string;
  count: number;
  reason: string;
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

export function consumeStudentPass(request: RecordPassUsageRequest) {
  return apiRequest<PassUsageLog>(`/api/student-passes/${request.passId}/consume`, {
    method: 'POST',
    body: JSON.stringify({
      count: request.count,
      reason: request.reason,
    }),
  });
}

export function restoreStudentPass(request: RecordPassUsageRequest) {
  return apiRequest<PassUsageLog>(`/api/student-passes/${request.passId}/restore`, {
    method: 'POST',
    body: JSON.stringify({
      count: request.count,
      reason: request.reason,
    }),
  });
}

export function listPassUsageLogs(passId: string) {
  return apiRequest<PassUsageLog[]>(`/api/student-passes/${passId}/usage-logs`);
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

export function usePassUsageLogs(passId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.passUsageLogs(passId),
    queryFn: () => listPassUsageLogs(passId as string),
    enabled: Boolean(passId),
  });
}

export function useRecordPassUsage(studentId: string | undefined, passId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, request }: { type: PassUsageType; request: RecordPassUsageRequest }) =>
      type === 'CONSUME' ? consumeStudentPass(request) : restoreStudentPass(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentPasses(studentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.passUsageLogs(passId) });
    },
  });
}
