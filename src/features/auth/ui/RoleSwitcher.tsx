import { useAuthStore } from '../model/authStore';
import type { UserRole } from '../model/authTypes';

const roles: Array<{ label: string; value: UserRole }> = [
  { label: '원장', value: 'OWNER' },
  { label: '강사', value: 'TEACHER' },
  { label: '수강생', value: 'STUDENT' },
  { label: '관리자', value: 'DIONOMY_ADMIN' },
];

export function RoleSwitcher({ onRoleChange }: { onRoleChange?: (role: UserRole) => void }) {
  const session = useAuthStore((state) => state.session);
  const switchRole = useAuthStore((state) => state.switchRole);

  return (
    <div className="role-switcher" aria-label="역할 전환">
      {roles.map((role) => (
        <button
          className={session.user.role === role.value ? 'role-chip active' : 'role-chip'}
          key={role.value}
          onClick={() => {
            switchRole(role.value);
            onRoleChange?.(role.value);
          }}
          type="button"
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
