const items = [
  { label: '오늘 수업', value: '8' },
  { label: '이번 주 매출', value: '1,240,000원' },
  { label: '등록 수강생', value: '126' },
];

export function DashboardSummary() {
  return (
    <div className="summary-grid">
      {items.map((item) => (
        <article className="metric-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
