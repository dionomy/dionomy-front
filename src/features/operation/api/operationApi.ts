import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type Instructor = {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
};

export type Place = {
  id: string;
  tenantId: string;
  name: string;
  memo: string | null;
};

export type CreateInstructorRequest = {
  name: string;
  phone: string | null;
};

export type CreatePlaceRequest = {
  name: string;
  memo: string | null;
};

export function listInstructors() {
  return apiRequest<Instructor[]>('/api/operation/instructors');
}

export function createInstructor(request: CreateInstructorRequest) {
  return apiRequest<Instructor>('/api/operation/instructors', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function listPlaces() {
  return apiRequest<Place[]>('/api/operation/places');
}

export function createPlace(request: CreatePlaceRequest) {
  return apiRequest<Place>('/api/operation/places', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function useInstructors() {
  return useQuery({
    queryKey: queryKeys.instructors,
    queryFn: listInstructors,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.instructors });
    },
  });
}

export function usePlaces() {
  return useQuery({
    queryKey: queryKeys.places,
    queryFn: listPlaces,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.places });
    },
  });
}
