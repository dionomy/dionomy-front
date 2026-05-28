import { useStudents } from '../../student/api/studentApi';
import { useSchedules } from '../../schedule/api/scheduleApi';

const weekRange = {
  from: '2026-05-25',
  to: '2026-05-31',
};

export function DashboardSummary() {
  const studentsQuery = useStudents();
  const schedulesQuery = useSchedules(weekRange.from, weekRange.to);

  const items = [
    {
      label: '전체 학생 수',
      value: `${studentsQuery.data?.length ?? 0}명`,
      trend: studentsQuery.isPending ? '불러오는 중' : '실시간',
      tone: 'success',
    },
    {
      label: '이번 주 수업',
      value: `${schedulesQuery.data?.length ?? 0}개`,
      trend: schedulesQuery.isPending ? '불러오는 중' : '캘린더 연동',
      tone: 'success',
    },
    { label: '이번 달 매출', value: 'MVP 제외', trend: '결제 v2', tone: 'success' },
    { label: '수강권 만료 임박', value: '준비중', trend: '수강권 집계 예정', tone: 'danger' },
  ];

  return (
    <div className="summary-grid">
      {items.map((item) => (
        <article className="metric-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em className={`trend-pill ${item.tone}`}>↗ {item.trend}</em>
        </article>
      ))}
    </div>
  );
}
