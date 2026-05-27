import { DashboardSummary } from '../../features/dashboard/ui/DashboardSummary';
import { TodoCards } from '../../features/dashboard/ui/TodoCards';
import { WeeklySchedulePreview } from '../../features/schedule/ui/WeeklySchedulePreview';

export function OwnerDashboardPage() {
  return (
    <section className="page-stack">
      <header>
        <p className="eyebrow">원장 운영 웹</p>
        <h1>오늘 운영 현황</h1>
      </header>
      <DashboardSummary />
      <div className="dashboard-grid">
        <WeeklySchedulePreview />
        <TodoCards />
      </div>
    </section>
  );
}
