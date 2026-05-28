import { ErrorState, EmptyState, LoadingState } from '../../../shared/ui/AsyncState';
import { useSchedules } from '../api/scheduleApi';

const today = '2026-05-28';

export function WeeklySchedulePreview() {
  const schedulesQuery = useSchedules(today, today);

  return (
    <article className="panel today-panel">
      <div className="panel-heading">
        <h2>오늘의 수업</h2>
        <button type="button">전체 보기 →</button>
      </div>
      <div className="session-list">
        {schedulesQuery.isPending && <LoadingState message="오늘 수업을 불러오는 중입니다." />}
        {schedulesQuery.isError && <ErrorState message="오늘 수업을 불러오지 못했습니다." />}
        {schedulesQuery.isSuccess && schedulesQuery.data.length === 0 && <EmptyState message="오늘 등록된 수업이 없습니다." />}
        {schedulesQuery.data?.map((session) => (
          <div className="session-row" key={session.id}>
            <span className="session-time">{formatTime(session.startsAt)}</span>
            <div>
              <strong>{session.title}</strong>
              <small>{session.type === 'GROUP' ? '그룹' : '1:1'} · {session.currentCapacity}/{session.maximumCapacity}명</small>
            </div>
            <em className="status-pill">예정</em>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}
