const sessions = [
  { time: '16:00', name: '중2 영어 심화반', room: 'A강의실 · 12명', status: '시작 30분 전' },
  { time: '18:00', name: '고1 수학 정규반', room: 'B강의실 · 16명', status: '예정' },
  { time: '20:30', name: '중3 영어 회화반', room: 'A강의실 · 10명', status: '예정' },
];

export function WeeklySchedulePreview() {
  return (
    <article className="panel today-panel">
      <div className="panel-heading">
        <h2>오늘의 수업</h2>
        <button type="button">전체 보기 →</button>
      </div>
      <div className="session-list">
        {sessions.map((session) => (
          <div className="session-row" key={`${session.time}-${session.name}`}>
            <span className="session-time">{session.time}</span>
            <div>
              <strong>{session.name}</strong>
              <small>{session.room}</small>
            </div>
            <em className={session.status.includes('30분') ? 'status-pill warning' : 'status-pill'}>{session.status}</em>
          </div>
        ))}
      </div>
    </article>
  );
}
