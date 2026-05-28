import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type Notice = {
  id: string;
  title: string;
  body: string;
  target: 'ALL' | 'CLASS';
  classId: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export type CreateNoticeRequest = {
  title: string;
  body: string;
  imageUrl: string | null;
  target: Notice['target'];
  classId: string | null;
};

export function listNotices() {
  return apiRequest<Notice[]>('/api/notices');
}

export function createNotice(request: CreateNoticeRequest) {
  return apiRequest<Notice>('/api/notices', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useNotices() {
  return useQuery({
    queryKey: queryKeys.notices,
    queryFn: listNotices,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices });
    },
  });
}
