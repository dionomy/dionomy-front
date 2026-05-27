import { create } from 'zustand';
import type { AuthSession, UserRole } from './authTypes';

type AuthState = {
  session: AuthSession;
  switchRole: (role: UserRole) => void;
};

const createMockSession = (role: UserRole): AuthSession => ({
  token: `mock-${role.toLowerCase()}`,
  user: {
    id: role.toLowerCase(),
    tenantId: role === 'DIONOMY_ADMIN' ? null : '00000000-0000-0000-0000-000000000001',
    name: roleName[role],
    role,
  },
});

const roleName: Record<UserRole, string> = {
  DIONOMY_ADMIN: 'Dionomy 관리자',
  OWNER: '원장',
  TEACHER: '강사',
  STUDENT: '수강생',
};

export const useAuthStore = create<AuthState>((set) => ({
  session: createMockSession('OWNER'),
  switchRole: (role) => set({ session: createMockSession(role) }),
}));
