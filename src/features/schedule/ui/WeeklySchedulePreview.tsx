const sessions = [
  { time: '10:00', name: '바이올린 그룹 A', capacity: '3/5' },
  { time: '14:00', name: '1:1 레슨', capacity: '김민지' },
  { time: '19:00', name: '성인 취미반', capacity: '5/6' },
];

export function WeeklySchedulePreview() {
  return (
    <article className="panel">
      <h2>오늘 수업</h2>
      <div className="session-list">
        {sessions.map((session) => (
          <div className="session-row" key={`${session.time}-${session.name}`}>
            <span>{session.time}</span>
            <strong>{session.name}</strong>
            <em>{session.capacity}</em>
          </div>
        ))}
      </div>
    </article>
  );
}
