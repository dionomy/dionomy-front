import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useSchedules, type ClassSession } from '../../features/schedule/api/scheduleApi';

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

type ScheduleEvent = {
  id: string;
  dayIndex: number;
  startHour: number;
  duration: number;
  title: string;
  meta: string;
  tone: ScheduleTone;
  width?: 'half' | 'compact';
  offset?: 'left' | 'right' | 'third';
  overflowCount?: number;
};

export function OwnerSchedulePage() {
  const schedulesQuery = useSchedules('2026-05-25', '2026-05-31');
  const sessions = schedulesQuery.data?.map(toScheduleEvent) ?? [];

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

      {schedulesQuery.isPending && <LoadingState message="주간 일정을 불러오는 중입니다." />}
      {schedulesQuery.isError && <ErrorState message="주간 일정을 불러오지 못했습니다." />}
      {schedulesQuery.isSuccess && schedulesQuery.data.length === 0 && <EmptyState message="등록된 주간 수업이 없습니다." />}

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

function toScheduleEvent(session: ClassSession): ScheduleEvent {
  const startsAt = new Date(session.startsAt);
  const endsAt = new Date(session.endsAt);
  const dayIndex = startsAt.getDay() === 0 ? 6 : startsAt.getDay() - 1;
  const startHour = startsAt.getHours() + startsAt.getMinutes() / 60;
  const duration = (endsAt.getTime() - startsAt.getTime()) / 1000 / 60 / 60;

  return {
    id: session.id,
    dayIndex,
    startHour,
    duration,
    title: session.title,
    meta: `${session.type === 'GROUP' ? '그룹' : '1:1'} · ${session.currentCapacity}/${session.maximumCapacity}명`,
    tone: session.type === 'GROUP' ? 'brand' : 'success',
  };
}

function formatHour(hour: number) {
  const whole = Math.floor(hour);
  const minutes = hour % 1 === 0 ? '00' : '30';
  return `${whole.toString().padStart(2, '0')}:${minutes}`;
}
