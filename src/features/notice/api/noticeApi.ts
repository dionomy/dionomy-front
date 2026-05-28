import { useQuery } from '@tanstack/react-query';
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

export function listNotices() {
  return apiRequest<Notice[]>('/api/notices');
}

export function useNotices() {
  return useQuery({
    queryKey: queryKeys.notices,
    queryFn: listNotices,
  });
}
