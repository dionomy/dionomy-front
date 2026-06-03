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
  | { kind: 'admin'; path: string }
  | { kind: 'not-found'; path: string };

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

  if (!academyMatch && !['/', '/company', '/admin'].includes(pathname)) {
    return { kind: 'not-found', path: pathname };
  }

  switch (appPath) {
    case '/':
    case '/company':
      return { kind: 'company', path: '/company' };
    case '/owner':
    case '/owner/dashboard':
      return academyMatch ? { kind: 'owner', page: 'dashboard', path: ownerPath('dashboard', academyNumber), academyNumber } : { kind: 'company', path: '/company' };
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

      return { kind: 'not-found', path: pathname };
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

  if (route.kind === 'not-found') {
    return (
      <UnavailableScreen
        title="지원하지 않는 경로입니다"
        message="학원 앱은 /academy/:academyNumber/... 형식으로 접근해야 합니다."
      />
    );
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

  if (settingsQuery.isError) {
    return (
      <UnavailableScreen
        title="학원을 찾을 수 없습니다"
        message="관리자에서 학원 번호와 상태를 확인하세요."
      />
    );
  }

  if (route.kind === 'student') {
    return <StudentHomePage brand={brand} featureSettings={featureSettings} studentId={route.studentId} />;
  }

  const blockedOwnerPage =
    route.kind === 'owner' &&
    featureSettings &&
    (
      (route.page === 'schedule' && featureSettings.ownerScheduleEnabled === false) ||
      (route.page === 'students' && featureSettings.ownerStudentsEnabled === false) ||
      (route.page === 'notices' && featureSettings.ownerNoticesEnabled === false)
    );

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
      {blockedOwnerPage && (
        <UnavailableScreen title="비활성화된 기능입니다" message="관리자 세팅에서 이 학원의 기능을 켜면 사용할 수 있습니다." />
      )}
      {!blockedOwnerPage && route.kind === 'owner' && route.page === 'dashboard' && <OwnerDashboardPage />}
      {!blockedOwnerPage && route.kind === 'owner' && route.page === 'schedule' && <OwnerSchedulePage />}
      {!blockedOwnerPage && route.kind === 'owner' && route.page === 'students' && <OwnerStudentsPage />}
      {!blockedOwnerPage && route.kind === 'owner' && route.page === 'notices' && <OwnerNoticesPage />}
      {!blockedOwnerPage && route.kind === 'owner' && route.page === 'settings' && <OwnerSettingsPage />}
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

function UnavailableScreen({ title, message }: { title: string; message: string }) {
  return (
    <section className="page-stack">
      <div className="panel">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </section>
  );
}
