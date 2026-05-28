import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type DemoRequest = {
  id: string;
  academyName: string;
  businessType: string;
  academySize: string;
  contact: string;
  createdAt: string;
};

export type CsTicket = {
  id: string;
  title: string;
  body: string;
  contact: string;
  status: string;
  createdAt: string;
};

export function listDemoRequests() {
  return apiRequest<DemoRequest[]>('/api/company/demo-requests');
}

export function createDemoRequest(request: Omit<DemoRequest, 'id' | 'createdAt'>) {
  return apiRequest<DemoRequest>('/api/company/demo-requests', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function listCsTickets() {
  return apiRequest<CsTicket[]>('/api/company/cs-tickets');
}

export function createCsTicket(request: Pick<CsTicket, 'title' | 'body' | 'contact'>) {
  return apiRequest<CsTicket>('/api/company/cs-tickets', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useDemoRequests() {
  return useQuery({
    queryKey: queryKeys.demoRequests,
    queryFn: listDemoRequests,
  });
}

export function useCreateDemoRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDemoRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demoRequests });
    },
  });
}

export function useCsTickets() {
  return useQuery({
    queryKey: queryKeys.csTickets,
    queryFn: listCsTickets,
  });
}

export function useCreateCsTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCsTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.csTickets });
    },
  });
}
