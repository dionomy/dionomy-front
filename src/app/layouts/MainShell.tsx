import type { ReactNode } from 'react';
import { RoleSwitcher } from '../../features/auth/ui/RoleSwitcher';
import type { UserRole } from '../../features/auth/model/authTypes';
import type { AcademyBrand } from '../../features/academy-settings/model/academyBrand';
import type { AcademySettings } from '../../features/academy-settings/model/settingsTypes';

export type OwnerPage = 'dashboard' | 'schedule' | 'students' | 'notices' | 'settings';

const mainNavigation: Array<{ key: OwnerPage; label: string; icon: string; setting?: keyof AcademySettings }> = [
  { key: 'dashboard', label: '대시보드', icon: '⌂' },
  { key: 'schedule', label: '시간표', icon: '□', setting: 'ownerScheduleEnabled' },
];

const operationNavigation: Array<{ key?: OwnerPage; label: string; icon: string; count?: string; setting?: keyof AcademySettings }> = [
  { key: 'schedule', label: '클래스', icon: '▣', count: '8', setting: 'ownerScheduleEnabled' },
  { key: 'students', label: '학생', icon: '◇', count: '142', setting: 'ownerStudentsEnabled' },
  { label: '강사', icon: '♧', count: '6' },
  { key: 'notices', label: '공지', icon: '!', setting: 'ownerNoticesEnabled' },
  { label: '결제 · 수강증', icon: '▭' },
];

export function MainShell({
  activePage = 'dashboard',
  children,
  onNavigate,
  onRoleNavigate,
  pageTitleOverride,
  brand,
  featureSettings,
}: {
  activePage?: OwnerPage;
  children: ReactNode;
  onNavigate?: (page: OwnerPage) => void;
  onRoleNavigate?: (role: UserRole) => void;
  pageTitleOverride?: string;
  brand?: AcademyBrand;
  featureSettings?: AcademySettings;
}) {
  const isEnabled = (setting?: keyof AcademySettings) => !setting || featureSettings?.[setting] !== false;
  const defaultPageTitle =
    activePage === 'settings'
      ? '설정'
      : activePage === 'schedule'
        ? '시간표'
        : activePage === 'students'
          ? '학생'
          : activePage === 'notices'
            ? '공지'
            : '대시보드';
  const pageTitle = pageTitleOverride ?? defaultPageTitle;
  const searchPlaceholder =
    activePage === 'settings'
      ? '수업명, 강사, 학생 검색'
      : activePage === 'schedule'
        ? '수업명, 강사명 검색'
        : activePage === 'students'
          ? '수강생명, 연락처, 태그 검색'
          : activePage === 'notices'
            ? '공지 제목, 클래스 검색'
          : '학생, 강사, 클래스 검색';

  return (
    <div className="app-shell" style={brand?.style}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">
            {brand?.logoUrl ? <img alt="" src={brand.logoUrl} /> : (brand?.initials ?? 'D')}
          </div>
          <div>
            <strong>{brand?.name ?? 'Dionomy'}</strong>
            <span>화이트라벨 운영 앱</span>
          </div>
        </div>
        <RoleSwitcher onRoleChange={onRoleNavigate} />
        <nav className="nav-list">
          <p className="nav-section">MAIN</p>
          {mainNavigation.filter((item) => isEnabled(item.setting)).map((item) => (
            <button
              className={item.key === activePage ? 'nav-item active' : 'nav-item'}
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              type="button"
            >
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
          <p className="nav-section">OPERATION</p>
          {operationNavigation.filter((item) => isEnabled(item.setting)).map((item) => (
            <button
              className={'key' in item && item.key === activePage ? 'nav-item active' : 'nav-item'}
              key={item.label}
              onClick={() => {
                if (item.key) {
                  onNavigate?.(item.key);
                }
              }}
              type="button"
            >
              <span>{item.icon}</span>
              <strong>{item.label}</strong>
              {item.count && <em>{item.count}</em>}
            </button>
          ))}
          <div className="nav-spacer" />
          <button
            className={activePage === 'settings' ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate?.('settings')}
            type="button"
          >
            <span>⚙</span>
            <strong>설정</strong>
          </button>
        </nav>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <h1>{pageTitle}</h1>
          <div className="topbar-spacer" />
          <label className="search-box">
            <span>⌕</span>
            <input aria-label="검색" placeholder={searchPlaceholder} />
          </label>
          <button aria-label="알림" className="icon-button" type="button">
            ♢
          </button>
          <div className="avatar">김도</div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
