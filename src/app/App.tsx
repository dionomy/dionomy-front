import { useState } from 'react';
import { MainShell } from './layouts/MainShell';
import { useAuthStore } from '../features/auth/model/authStore';
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage';
import { OwnerSchedulePage } from '../pages/owner/OwnerSchedulePage';
import { OwnerSettingsPage } from '../pages/owner/OwnerSettingsPage';
import { OwnerStudentsPage } from '../pages/owner/OwnerStudentsPage';
import { AdminHomePage } from '../pages/admin/AdminHomePage';
import { StudentHomePage } from '../pages/academy-app/StudentHomePage';
import { TeacherHomePage } from '../pages/teacher/TeacherHomePage';

export function App() {
  const role = useAuthStore((state) => state.session.user.role);
  const [ownerPage, setOwnerPage] = useState<'dashboard' | 'schedule' | 'students' | 'settings'>('dashboard');

  if (role === 'STUDENT') {
    return <StudentHomePage />;
  }

  return (
    <MainShell activePage={ownerPage} onNavigate={setOwnerPage}>
      {role === 'DIONOMY_ADMIN' && <AdminHomePage />}
      {role === 'OWNER' && ownerPage === 'dashboard' && <OwnerDashboardPage />}
      {role === 'OWNER' && ownerPage === 'schedule' && <OwnerSchedulePage />}
      {role === 'OWNER' && ownerPage === 'students' && <OwnerStudentsPage />}
      {role === 'OWNER' && ownerPage === 'settings' && <OwnerSettingsPage />}
      {role === 'TEACHER' && <TeacherHomePage />}
    </MainShell>
  );
}
