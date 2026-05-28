type ScheduleTone = 'brand' | 'success' | 'warning' | 'danger';

const days = [
  { day: '월', date: 25 },
  { day: '화', date: 26 },
  { day: '수', date: 27, active: true },
  { day: '목', date: 28 },
  { day: '금', date: 29 },
  { day: '토', date: 30, muted: true },
  { day: '일', date: 31, muted: true },
];

const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

const sessions: Array<{
  dayIndex: number;
  startHour: number;
  duration: number;
  title: string;
  meta: string;
  tone: ScheduleTone;
  width?: 'half' | 'compact';
  offset?: 'left' | 'right' | 'third';
  overflowCount?: number;
}> = [
  { dayIndex: 5, startHour: 10, duration: 2, title: '주말 보충반', meta: 'B강의실 · 김철수', tone: 'success' },
  { dayIndex: 2, startHour: 14, duration: 1.5, title: '초6 영어 기초', meta: 'A강의실 · 홍길동', tone: 'brand' },
  { dayIndex: 4, startHour: 14, duration: 1.5, title: '초6 영어 기초', meta: 'A강의실 · 홍길동', tone: 'brand' },
  { dayIndex: 5, startHour: 14, duration: 2, title: '입시 특강', meta: 'C강의실 · 이영희', tone: 'danger' },
  { dayIndex: 0, startHour: 16, duration: 1, title: '중2 영어', meta: 'A · 홍길동', tone: 'brand', width: 'half', offset: 'left' },
  { dayIndex: 0, startHour: 16, duration: 1, title: '고1 수학', meta: 'B · 김철수', tone: 'success', width: 'half', offset: 'right' },
  { dayIndex: 2, startHour: 16, duration: 1, title: '중2 영어', meta: 'A · 홍', tone: 'brand', width: 'compact', offset: 'left' },
  { dayIndex: 2, startHour: 16, duration: 1, title: '고1 수학', meta: 'B · 김', tone: 'success', width: 'compact', offset: 'right', overflowCount: 2 },
  { dayIndex: 4, startHour: 16, duration: 1, title: '중2 영어', meta: 'A · 홍길동', tone: 'brand', width: 'half', offset: 'left' },
  { dayIndex: 4, startHour: 16, duration: 1, title: '고1 수학', meta: 'B · 김철수', tone: 'success', width: 'half', offset: 'right' },
  { dayIndex: 0, startHour: 18, duration: 2, title: '고1 수학 정규반', meta: 'B강의실 · 김철수', tone: 'success' },
  { dayIndex: 1, startHour: 18, duration: 2, title: '고1 수학 정규반', meta: 'B강의실 · 김철수', tone: 'success' },
  { dayIndex: 3, startHour: 18, duration: 2, title: '고1 수학 정규반', meta: 'B강의실 · 김철수', tone: 'success' },
  { dayIndex: 2, startHour: 19, duration: 2, title: '고2 물리 심화반', meta: 'C강의실 · 이영희', tone: 'warning' },
  { dayIndex: 4, startHour: 19, duration: 2, title: '고2 물리 심화반', meta: 'C강의실 · 이영희', tone: 'warning' },
  { dayIndex: 1, startHour: 20, duration: 2, title: '중3 영어 회화반', meta: 'A강의실 · 홍길동', tone: 'brand' },
  { dayIndex: 3, startHour: 20, duration: 2, title: '중3 영어 회화반', meta: 'A강의실 · 홍길동', tone: 'brand' },
];

export function OwnerSchedulePage() {
  return (
    <section className="page-stack schedule-page">
      <header className="schedule-toolbar">
        <div className="schedule-title">
          <div>
            <h2>2026년 5월 25일 - 31일</h2>
            <p>이번 주</p>
          </div>
          <div className="calendar-nav">
            <button aria-label="이전 주" type="button">‹</button>
            <button aria-label="다음 주" type="button">›</button>
          </div>
        </div>
        <div className="schedule-actions">
          <div className="segmented-control" aria-label="보기 방식">
            <button type="button">일간</button>
            <button className="active" type="button">주간</button>
            <button type="button">월간</button>
          </div>
          <button className="secondary-button" type="button">▽ 필터</button>
          <button className="primary-button compact" type="button">＋ 수업 추가</button>
        </div>
      </header>

      <div className="schedule-board">
        <div className="schedule-week-header">
          <div className="time-gutter" />
          {days.map((item) => (
            <div className={item.active ? 'day-head active' : item.muted ? 'day-head muted' : 'day-head'} key={item.day}>
              <span>{item.day}</span>
              <strong>{item.date}</strong>
            </div>
          ))}
        </div>
        <div className="schedule-grid">
          <div className="time-column">
            {timeSlots.map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>
          <div className="week-grid">
            {days.map((day, dayIndex) => (
              <div className={day.active ? 'day-column active' : 'day-column'} key={day.day}>
                {sessions
                  .filter((session) => session.dayIndex === dayIndex)
                  .map((session) => (
                    <article
                      className={[
                        'schedule-event',
                        session.tone,
                        session.width ? `event-${session.width}` : '',
                        session.offset ? `event-${session.offset}` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={`${session.dayIndex}-${session.startHour}-${session.title}-${session.offset ?? 'full'}`}
                      style={{
                        top: `${(session.startHour - 9) * 56 + 2}px`,
                        height: `${session.duration * 56 - 4}px`,
                      }}
                    >
                      <i />
                      <div>
                        <time>{formatTimeRange(session.startHour, session.duration)}</time>
                        <strong>{session.title}</strong>
                        <span>{session.meta}</span>
                      </div>
                    </article>
                  ))}
                {sessions
                  .filter((session) => session.dayIndex === dayIndex && session.overflowCount)
                  .map((session) => (
                    <button
                      className="overflow-chip"
                      key={`overflow-${session.dayIndex}-${session.startHour}`}
                      style={{ top: `${(session.startHour - 9) * 56 + 2}px` }}
                      type="button"
                    >
                      +{session.overflowCount}
                    </button>
                  ))}
              </div>
            ))}
            <div className="current-time-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

function formatTimeRange(startHour: number, duration: number) {
  const endHour = startHour + duration;
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}

function formatHour(hour: number) {
  const whole = Math.floor(hour);
  const minutes = hour % 1 === 0 ? '00' : '30';
  return `${whole.toString().padStart(2, '0')}:${minutes}`;
}
