const attendance = [
  { day: '월', total: '41명', present: 76, absent: 8, late: 2 },
  { day: '화', total: '45명', present: 84, absent: 2, late: 4 },
  { day: '수', total: '44명', present: 80, absent: 6, late: 2, active: true },
  { day: '목', total: '—', present: 0, absent: 0, late: 0 },
  { day: '금', total: '—', present: 0, absent: 0, late: 0 },
  { day: '토', total: '—', present: 0, absent: 0, late: 0 },
  { day: '일', total: '—', present: 0, absent: 0, late: 0 },
];

export function TodoCards() {
  return (
    <article className="panel attendance-panel">
      <div className="panel-heading">
        <div>
          <h2>이번 주 출석 현황</h2>
          <p>5월 25일 - 31일 · 일별 출석/결석/지각</p>
        </div>
        <div className="chart-legend">
          <span><i className="present" />출석</span>
          <span><i className="absent" />결석</span>
          <span><i className="late" />지각</span>
        </div>
      </div>
      <div className="attendance-chart">
        {attendance.map((item) => (
          <div className="chart-column" key={item.day}>
            <div className="bar-stack">
              {item.present > 0 ? (
                <>
                  <div className="bar late" style={{ height: item.late * 6 }} />
                  <div className="bar absent" style={{ height: item.absent * 6 }} />
                  <div className="bar present" style={{ height: item.present * 2.8 }} />
                </>
              ) : (
                <div className="bar empty" />
              )}
            </div>
            <strong className={item.active ? 'active' : undefined}>{item.day}</strong>
            <span>{item.total}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
