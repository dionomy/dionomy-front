import type { ReactNode } from 'react';
import { RoleSwitcher } from '../../features/auth/ui/RoleSwitcher';

const navigation = [
  '대시보드',
  '통합일정',
  '수강생',
  '강사',
  '공지사항',
  'CRM',
  '설정',
];

export function MainShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Dionomy</div>
        <RoleSwitcher />
        <nav className="nav-list">
          {navigation.map((item) => (
            <button className="nav-item" key={item} type="button">
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
