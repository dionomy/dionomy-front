import { MainShell } from './layouts/MainShell';
import { useAuthStore } from '../features/auth/model/authStore';
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage';
import { AdminHomePage } from '../pages/admin/AdminHomePage';
import { StudentHomePage } from '../pages/academy-app/StudentHomePage';
import { TeacherHomePage } from '../pages/teacher/TeacherHomePage';

export function App() {
  const role = useAuthStore((state) => state.session.user.role);

  if (role === 'STUDENT') {
    return <StudentHomePage />;
  }

  return (
    <MainShell>
      {role === 'DIONOMY_ADMIN' && <AdminHomePage />}
      {role === 'OWNER' && <OwnerDashboardPage />}
      {role === 'TEACHER' && <TeacherHomePage />}
    </MainShell>
  );
}
