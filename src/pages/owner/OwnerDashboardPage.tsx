import { DashboardSummary } from '../../features/dashboard/ui/DashboardSummary';
import { TodoCards } from '../../features/dashboard/ui/TodoCards';
import { WeeklySchedulePreview } from '../../features/schedule/ui/WeeklySchedulePreview';

export function OwnerDashboardPage() {
  return (
    <section className="page-stack dashboard-page">
      <header className="page-hero">
        <div>
          <h2>안녕하세요, 김도윤 원장님</h2>
          <p>2026년 5월 27일 수요일</p>
        </div>
        <button className="primary-button" type="button">＋ 새 수업 추가</button>
      </header>
      <DashboardSummary />
      <div className="dashboard-grid">
        <TodoCards />
        <WeeklySchedulePreview />
      </div>
    </section>
  );
}
