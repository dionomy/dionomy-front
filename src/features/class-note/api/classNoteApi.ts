import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type ClassNote = {
  id: string;
  sessionId: string;
  teacherId: string;
  progress: string;
  feedback: string;
  nextAssignment: string;
  createdAt: string;
};

export type CreateClassNoteRequest = {
  sessionId: string;
  teacherId: string;
  progress: string;
  feedback: string;
  nextAssignment: string;
};

export function listClassNotes(sessionId?: string) {
  const query = sessionId ? `?sessionId=${sessionId}` : '';
  return apiRequest<ClassNote[]>(`/api/class-notes${query}`);
}

export function createClassNote(request: CreateClassNoteRequest) {
  return apiRequest<ClassNote>('/api/class-notes', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useClassNotes(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.classNotes(sessionId),
    queryFn: () => listClassNotes(sessionId),
  });
}

export function useCreateClassNote(sessionId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClassNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classNotes(sessionId) });
    },
  });
}
