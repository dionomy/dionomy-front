import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import {
  useAssignStudentsToSchedule,
  useCancelSchedule,
  useCreateSchedule,
  useMoveSchedule,
  useSchedules,
  type ClassSession,
  type ClassType,
} from '../../features/schedule/api/scheduleApi';
import { useStudents } from '../../features/student/api/studentApi';

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
const weekRange = {
  from: '2026-05-25',
  to: '2026-05-31',
};
const defaultTeacherId = '00000000-0000-0000-0000-000000000101';

type ScheduleEvent = {
  id: string;
  dayIndex: number;
  startHour: number;
  duration: number;
  title: string;
  meta: string;
  tone: ScheduleTone;
  startsAt: string;
  endsAt: string;
  width?: 'half' | 'compact';
  offset?: 'left' | 'right' | 'third';
  overflowCount?: number;
};

export function OwnerSchedulePage() {
  const schedulesQuery = useSchedules(weekRange.from, weekRange.to);
  const createSchedule = useCreateSchedule(weekRange.from, weekRange.to);
  const assignStudents = useAssignStudentsToSchedule(weekRange.from, weekRange.to);
  const moveSchedule = useMoveSchedule(weekRange.from, weekRange.to);
  const cancelSchedule = useCancelSchedule(weekRange.from, weekRange.to);
  const studentsQuery = useStudents();
  const sessions = schedulesQuery.data?.map(toScheduleEvent) ?? [];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const selectedSession = schedulesQuery.data?.find((session) => session.id === selectedSessionId) ?? schedulesQuery.data?.[0];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    type: 'GROUP' as ClassType,
    startsAt: '2026-05-28T18:00',
    endsAt: '2026-05-28T19:00',
    maximumCapacity: 8,
  });
  const [moveForm, setMoveForm] = useState({
    startsAt: '2026-05-28T18:00',
    endsAt: '2026-05-28T19:00',
  });

  const handleCreateSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createSchedule.mutate(
      {
        title: scheduleForm.title,
        type: scheduleForm.type,
        teacherId: defaultTeacherId,
        placeId: null,
        startsAt: scheduleForm.startsAt,
        endsAt: scheduleForm.endsAt,
        currentCapacity: 0,
        maximumCapacity: scheduleForm.maximumCapacity,
        assignedStudentIds: [],
        recurrence: null,
      },
      {
        onSuccess: () => {
          setScheduleForm({
            title: '',
            type: 'GROUP',
            startsAt: '2026-05-28T18:00',
            endsAt: '2026-05-28T19:00',
            maximumCapacity: 8,
          });
          setIsCreateOpen(false);
        },
      },
    );
  };

  const handleAssignStudent = (studentId: string, checked: boolean) => {
    if (!selectedSession) {
      return;
    }

    const nextStudentIds = checked
      ? [...selectedSession.assignedStudentIds, studentId]
      : selectedSession.assignedStudentIds.filter((id) => id !== studentId);

    assignStudents.mutate({
      sessionId: selectedSession.id,
      studentIds: Array.from(new Set(nextStudentIds)),
    });
  };

  const handleMoveSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSession) {
      return;
    }

    moveSchedule.mutate({
      sessionId: selectedSession.id,
      startsAt: moveForm.startsAt,
      endsAt: moveForm.endsAt,
    });
  };

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
          <button className="primary-button compact" type="button" onClick={() => setIsCreateOpen((value) => !value)}>
            ＋ 수업 추가
          </button>
        </div>
      </header>

      {isCreateOpen && (
        <form className="panel inline-form-panel" onSubmit={handleCreateSchedule}>
          <div className="panel-heading">
            <div>
              <h2>수업 등록</h2>
              <p>타입, 시간, 정원을 입력합니다.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              수업명 <b>*</b>
              <input
                required
                value={scheduleForm.title}
                onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })}
              />
            </label>
            <label>
              타입 <b>*</b>
              <select value={scheduleForm.type} onChange={(event) => setScheduleForm({ ...scheduleForm, type: event.target.value as ClassType })}>
                <option value="GROUP">그룹</option>
                <option value="ONE_ON_ONE">1:1</option>
              </select>
            </label>
            <label>
              시작 <b>*</b>
              <input
                required
                type="datetime-local"
                value={scheduleForm.startsAt}
                onChange={(event) => setScheduleForm({ ...scheduleForm, startsAt: event.target.value })}
              />
            </label>
            <label>
              종료 <b>*</b>
              <input
                required
                type="datetime-local"
                value={scheduleForm.endsAt}
                onChange={(event) => setScheduleForm({ ...scheduleForm, endsAt: event.target.value })}
              />
            </label>
            <label>
              정원 <b>*</b>
              <input
                min="1"
                required
                type="number"
                value={scheduleForm.maximumCapacity}
                onChange={(event) => setScheduleForm({ ...scheduleForm, maximumCapacity: Number(event.target.value) })}
              />
            </label>
          </div>
          {createSchedule.isError && <ErrorState message="수업 등록에 실패했습니다." />}
          <div className="form-actions">
            <button type="button" onClick={() => setIsCreateOpen(false)}>취소</button>
            <button className="primary-button compact" type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending ? '등록 중' : '등록'}
            </button>
          </div>
        </form>
      )}

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
                      onClick={() => {
                        setSelectedSessionId(session.id);
                        setMoveForm({
                          startsAt: toDatetimeLocal(session.startsAt),
                          endsAt: toDatetimeLocal(session.endsAt),
                        });
                      }}
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

      {selectedSession && (
        <section className="panel schedule-detail-panel">
          <div className="panel-heading">
            <div>
              <h2>{selectedSession.title}</h2>
              <p>{formatTimeRangeFromIso(selectedSession.startsAt, selectedSession.endsAt)} · {selectedSession.currentCapacity}/{selectedSession.maximumCapacity}명</p>
            </div>
            <button
              className="secondary-button compact"
              type="button"
              disabled={cancelSchedule.isPending}
              onClick={() => cancelSchedule.mutate(selectedSession.id)}
            >
              취소
            </button>
          </div>
          <div className="schedule-detail-grid">
            <form className="inline-form-panel" onSubmit={handleMoveSchedule}>
              <div className="form-grid">
                <label>
                  시작
                  <input type="datetime-local" value={moveForm.startsAt} onChange={(event) => setMoveForm({ ...moveForm, startsAt: event.target.value })} />
                </label>
                <label>
                  종료
                  <input type="datetime-local" value={moveForm.endsAt} onChange={(event) => setMoveForm({ ...moveForm, endsAt: event.target.value })} />
                </label>
              </div>
              {moveSchedule.isError && <ErrorState message="일정 이동에 실패했습니다. 강사/장소 충돌 가능성이 있습니다." />}
              <div className="form-actions">
                <button className="primary-button compact" type="submit" disabled={moveSchedule.isPending}>
                  {moveSchedule.isPending ? '이동 중' : '일정 이동'}
                </button>
              </div>
            </form>
            <div className="assignment-list">
              <strong>수강생 배정</strong>
              {studentsQuery.data?.map((student) => (
                <label key={student.id}>
                  <input
                    type="checkbox"
                    checked={selectedSession.assignedStudentIds.includes(student.id)}
                    onChange={(event) => handleAssignStudent(student.id, event.target.checked)}
                  />
                  <span>{student.name}</span>
                </label>
              ))}
              {studentsQuery.isSuccess && studentsQuery.data.length === 0 && <EmptyState message="배정할 수강생이 없습니다." />}
              {assignStudents.isError && <ErrorState message="수강생 배정에 실패했습니다." />}
            </div>
          </div>
        </section>
      )}
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
    startsAt: session.startsAt,
    endsAt: session.endsAt,
  };
}

function formatHour(hour: number) {
  const whole = Math.floor(hour);
  const minutes = hour % 1 === 0 ? '00' : '30';
  return `${whole.toString().padStart(2, '0')}:${minutes}`;
}

function toDatetimeLocal(value: string) {
  return value.slice(0, 16);
}

function formatTimeRangeFromIso(startsAt: string, endsAt: string) {
  return `${toDatetimeLocal(startsAt).replace('T', ' ')} - ${toDatetimeLocal(endsAt).split('T')[1]}`;
}
