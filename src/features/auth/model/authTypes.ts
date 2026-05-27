export type UserRole = 'DIONOMY_ADMIN' | 'OWNER' | 'TEACHER' | 'STUDENT';

export type AuthUser = {
  id: string;
  tenantId: string | null;
  name: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
