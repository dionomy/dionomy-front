const items = [
  { label: '전체 학생 수', value: '142명', trend: '+8 이번 달', tone: 'success' },
  { label: '이번 주 출석률', value: '92%', trend: '+3% vs 지난주', tone: 'success' },
  { label: '이번 달 매출', value: '₩18.4M', trend: '+12% vs 지난달', tone: 'success' },
  { label: '수강권 만료 임박', value: '7명', trend: '이번 주 +2', tone: 'danger' },
];

export function DashboardSummary() {
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
