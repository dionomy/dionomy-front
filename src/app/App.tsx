import { useEffect, useState } from 'react';
import { MainShell, type OwnerPage } from './layouts/MainShell';
import { useAcademyBrand } from '../features/academy-settings/api/useAcademyBrand';
import { useAuthStore } from '../features/auth/model/authStore';
import type { UserRole } from '../features/auth/model/authTypes';
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage';
import { OwnerNoticesPage } from '../pages/owner/OwnerNoticesPage';
import { OwnerSchedulePage } from '../pages/owner/OwnerSchedulePage';
import { OwnerSettingsPage } from '../pages/owner/OwnerSettingsPage';
import { OwnerStudentsPage } from '../pages/owner/OwnerStudentsPage';
import { AdminHomePage } from '../pages/admin/AdminHomePage';
import { StudentHomePage } from '../pages/academy-app/StudentHomePage';
import { CompanyHomePage } from '../pages/company/CompanyHomePage';
import { TeacherHomePage } from '../pages/teacher/TeacherHomePage';

type AppRoute =
  | { kind: 'company'; path: string }
  | { kind: 'owner'; page: OwnerPage; path: string }
  | { kind: 'teacher'; path: string }
  | { kind: 'student'; path: string }
  | { kind: 'admin'; path: string };

const ownerPaths: Record<OwnerPage, string> = {
  dashboard: '/owner/dashboard',
  schedule: '/owner/schedule',
  students: '/owner/students',
  notices: '/owner/notices',
  settings: '/owner/settings',
};

const defaultPathByRole: Record<UserRole, string> = {
  OWNER: ownerPaths.dashboard,
  TEACHER: '/teacher',
  STUDENT: '/student',
  DIONOMY_ADMIN: '/admin',
};

function routeFromPath(pathname: string): AppRoute {
  switch (pathname) {
    case '/':
    case '/company':
      return { kind: 'company', path: '/company' };
    case '/owner':
    case '/owner/dashboard':
      return { kind: 'owner', page: 'dashboard', path: ownerPaths.dashboard };
    case '/owner/schedule':
      return { kind: 'owner', page: 'schedule', path: ownerPaths.schedule };
    case '/owner/students':
      return { kind: 'owner', page: 'students', path: ownerPaths.students };
    case '/owner/notices':
      return { kind: 'owner', page: 'notices', path: ownerPaths.notices };
    case '/owner/settings':
      return { kind: 'owner', page: 'settings', path: ownerPaths.settings };
    case '/teacher':
      return { kind: 'teacher', path: '/teacher' };
    case '/student':
      return { kind: 'student', path: '/student' };
    case '/admin':
      return { kind: 'admin', path: '/admin' };
    default:
      return { kind: 'owner', page: 'dashboard', path: ownerPaths.dashboard };
  }
}

function roleFromRoute(route: AppRoute): UserRole {
  if (route.kind === 'company') {
    return 'DIONOMY_ADMIN';
  }

  if (route.kind === 'teacher') {
    return 'TEACHER';
  }

  if (route.kind === 'student') {
    return 'STUDENT';
  }

  if (route.kind === 'admin') {
    return 'DIONOMY_ADMIN';
  }

  return 'OWNER';
}

export function App() {
  const role = useAuthStore((state) => state.session.user.role);
  const switchRole = useAuthStore((state) => state.switchRole);
  const [route, setRoute] = useState<AppRoute>(() => routeFromPath(window.location.pathname));
  const { brand } = useAcademyBrand();

  function navigate(path: string, replace = false) {
    const nextRoute = routeFromPath(path);

    if (window.location.pathname !== nextRoute.path) {
      if (replace) {
        window.history.replaceState(null, '', nextRoute.path);
      } else {
        window.history.pushState(null, '', nextRoute.path);
      }
    }

    setRoute(nextRoute);
  }

  useEffect(() => {
    const handlePopState = () => setRoute(routeFromPath(window.location.pathname));

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const routeRole = roleFromRoute(route);

    if (role !== routeRole) {
      switchRole(routeRole);
    }
  }, [role, route, switchRole]);

  if (route.kind === 'student') {
    return <StudentHomePage brand={brand} />;
  }

  if (route.kind === 'company') {
    return <CompanyHomePage />;
  }

  return (
    <MainShell
      activePage={route.kind === 'owner' ? route.page : 'dashboard'}
      onNavigate={(page) => navigate(ownerPaths[page])}
      onRoleNavigate={(nextRole) => navigate(defaultPathByRole[nextRole])}
      brand={route.kind === 'admin' ? undefined : brand}
      pageTitleOverride={
        route.kind === 'teacher' ? '강사 홈' : route.kind === 'admin' ? '관리자' : undefined
      }
    >
      {route.kind === 'admin' && <AdminHomePage />}
      {route.kind === 'owner' && route.page === 'dashboard' && <OwnerDashboardPage />}
      {route.kind === 'owner' && route.page === 'schedule' && <OwnerSchedulePage />}
      {route.kind === 'owner' && route.page === 'students' && <OwnerStudentsPage />}
      {route.kind === 'owner' && route.page === 'notices' && <OwnerNoticesPage />}
      {route.kind === 'owner' && route.page === 'settings' && <OwnerSettingsPage />}
      {route.kind === 'teacher' && <TeacherHomePage />}
    </MainShell>
  );
}
