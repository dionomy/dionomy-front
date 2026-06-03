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
  | { kind: 'owner'; page: OwnerPage; path: string; academyNumber?: number }
  | { kind: 'teacher'; path: string; academyNumber?: number }
  | { kind: 'student'; path: string; academyNumber?: number; studentId?: string }
  | { kind: 'admin'; path: string };

function ownerPath(page: OwnerPage, academyNumber?: number) {
  const prefix = academyNumber ? `/academy/${academyNumber}` : '';
  const paths: Record<OwnerPage, string> = {
    dashboard: `${prefix}/owner/dashboard`,
    schedule: `${prefix}/owner/schedule`,
    students: `${prefix}/owner/students`,
    notices: `${prefix}/owner/notices`,
    settings: `${prefix}/owner/settings`,
  };

  return paths[page];
}

function defaultPathByRole(role: UserRole, academyNumber?: number) {
  const prefix = academyNumber ? `/academy/${academyNumber}` : '';
  const paths: Record<UserRole, string> = {
    OWNER: ownerPath('dashboard', academyNumber),
    TEACHER: `${prefix}/teacher`,
    STUDENT: `${prefix}/student`,
    DIONOMY_ADMIN: '/admin',
  };

  return paths[role];
}

function routeFromPath(pathname: string): AppRoute {
  const academyMatch = pathname.match(/^\/academy\/(\d+)(\/.*)?$/);
  const academyNumber = academyMatch ? Number(academyMatch[1]) : undefined;
  const appPath = academyMatch ? academyMatch[2] || '/owner/dashboard' : pathname;
  const prefix = academyNumber ? `/academy/${academyNumber}` : '';

  switch (appPath) {
    case '/':
    case '/company':
      return { kind: 'company', path: '/company' };
    case '/owner':
    case '/owner/dashboard':
      return { kind: 'owner', page: 'dashboard', path: ownerPath('dashboard', academyNumber), academyNumber };
    case '/owner/schedule':
      return { kind: 'owner', page: 'schedule', path: ownerPath('schedule', academyNumber), academyNumber };
    case '/owner/students':
      return { kind: 'owner', page: 'students', path: ownerPath('students', academyNumber), academyNumber };
    case '/owner/notices':
      return { kind: 'owner', page: 'notices', path: ownerPath('notices', academyNumber), academyNumber };
    case '/owner/settings':
      return { kind: 'owner', page: 'settings', path: ownerPath('settings', academyNumber), academyNumber };
    case '/teacher':
      return { kind: 'teacher', path: `${prefix}/teacher`, academyNumber };
    case '/student':
      return { kind: 'student', path: `${prefix}/student`, academyNumber };
    case '/admin':
      return { kind: 'admin', path: '/admin' };
    default: {
      const studentMatch = appPath.match(/^\/student\/([^/]+)$/);
      if (studentMatch) {
        return { kind: 'student', path: `${prefix}/student/${studentMatch[1]}`, academyNumber, studentId: studentMatch[1] };
      }

      return { kind: 'owner', page: 'dashboard', path: ownerPath('dashboard', academyNumber), academyNumber };
    }
  }
}

function roleFromRoute(route: AppRoute): UserRole {
  if (route.kind === 'company') {
    return 'OWNER';
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
  const [route, setRoute] = useState<AppRoute>(() => routeFromPath(window.location.pathname));

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

  if (route.kind === 'admin') {
    return <AdminHomePage />;
  }

  if (route.kind === 'company') {
    return <CompanyHomePage />;
  }

  return <AcademyAppRoute navigate={navigate} route={route} />;
}

function AcademyAppRoute({
  navigate,
  route,
}: {
  navigate: (path: string, replace?: boolean) => void;
  route: Exclude<AppRoute, { kind: 'admin' | 'company' }>;
}) {
  const role = useAuthStore((state) => state.session.user.role);
  const switchRole = useAuthStore((state) => state.switchRole);
  const { brand, settingsQuery } = useAcademyBrand();
  const featureSettings = settingsQuery.data;

  useEffect(() => {
    const routeRole = roleFromRoute(route);

    if (role !== routeRole) {
      switchRole(routeRole);
    }
  }, [role, route, switchRole]);

  if (route.kind === 'student') {
    return <StudentHomePage brand={brand} featureSettings={featureSettings} studentId={route.studentId} />;
  }

  return (
    <MainShell
      activePage={route.kind === 'owner' ? route.page : 'dashboard'}
      onNavigate={(page) => navigate(ownerPath(page, 'academyNumber' in route ? route.academyNumber : undefined))}
      onRoleNavigate={(nextRole) => navigate(defaultPathByRole(nextRole, 'academyNumber' in route ? route.academyNumber : undefined))}
      brand={brand}
      featureSettings={featureSettings}
      pageTitleOverride={
        route.kind === 'teacher' && featureSettings?.teacherModeEnabled === false ? '사용 안 함' : route.kind === 'teacher' ? '강사 홈' : undefined
      }
    >
      {route.kind === 'owner' && route.page === 'dashboard' && <OwnerDashboardPage />}
      {route.kind === 'owner' && route.page === 'schedule' && <OwnerSchedulePage />}
      {route.kind === 'owner' && route.page === 'students' && <OwnerStudentsPage />}
      {route.kind === 'owner' && route.page === 'notices' && <OwnerNoticesPage />}
      {route.kind === 'owner' && route.page === 'settings' && <OwnerSettingsPage />}
      {route.kind === 'teacher' && featureSettings?.teacherModeEnabled === false && (
        <section className="page-stack">
          <div className="panel">
            <h2>강사 모드가 비활성화되어 있습니다.</h2>
            <p>학원 설정에서 강사 모드를 켜면 다시 사용할 수 있습니다.</p>
          </div>
        </section>
      )}
      {route.kind === 'teacher' && featureSettings?.teacherModeEnabled !== false && <TeacherHomePage />}
    </MainShell>
  );
}
