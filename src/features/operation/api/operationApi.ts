import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/api/apiClient';
import { queryKeys } from '../../../shared/api/queryKeys';

export type Instructor = {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
};

export type InstructorAvailability = {
  id: string;
  tenantId: string;
  instructorId: string;
  startsAt: string;
  endsAt: string;
  memo: string | null;
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

export type CreateInstructorAvailabilityRequest = {
  instructorId: string;
  startsAt: string;
  endsAt: string;
  memo: string | null;
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

export function listInstructorAvailabilities(instructorId?: string) {
  const query = instructorId ? `?instructorId=${instructorId}` : '';

  return apiRequest<InstructorAvailability[]>(`/api/operation/instructor-availabilities${query}`);
}

export function createInstructorAvailability(request: CreateInstructorAvailabilityRequest) {
  return apiRequest<InstructorAvailability>('/api/operation/instructor-availabilities', {
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

export function useInstructorAvailabilities(instructorId?: string) {
  return useQuery({
    queryKey: queryKeys.instructorAvailabilities(instructorId),
    queryFn: () => listInstructorAvailabilities(instructorId),
  });
}

export function useCreateInstructorAvailability(instructorId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInstructorAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.instructorAvailabilities(instructorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructorAvailabilities() });
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
