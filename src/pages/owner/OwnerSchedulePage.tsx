import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useInstructors, usePlaces } from '../../features/operation/api/operationApi';
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

const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
const defaultLessonStartHour = 18;

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
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTeacherId, setSelectedTeacherId] = useState('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState('all');
  const weekRange = useMemo(
    () => ({
      from: formatDateInput(weekStart),
      to: formatDateInput(addDays(weekStart, 6)),
    }),
    [weekStart],
  );
  const days = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const schedulesQuery = useSchedules(weekRange.from, weekRange.to);
  const createSchedule = useCreateSchedule(weekRange.from, weekRange.to);
  const assignStudents = useAssignStudentsToSchedule(weekRange.from, weekRange.to);
  const moveSchedule = useMoveSchedule(weekRange.from, weekRange.to);
  const cancelSchedule = useCancelSchedule(weekRange.from, weekRange.to);
  const studentsQuery = useStudents();
  const instructorsQuery = useInstructors();
  const placesQuery = usePlaces();
  const filteredSchedules = (schedulesQuery.data ?? []).filter((session) => {
    const teacherMatched = selectedTeacherId === 'all' || session.teacherId === selectedTeacherId;
    const placeMatched = selectedPlaceId === 'all' || session.placeId === selectedPlaceId;

    return teacherMatched && placeMatched;
  });
  const sessions = filteredSchedules.map(toScheduleEvent);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const selectedSession = filteredSchedules.find((session) => session.id === selectedSessionId) ?? filteredSchedules[0];
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    type: 'GROUP' as ClassType,
    teacherId: '',
    placeId: '',
    startsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour)),
    endsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour + 1)),
    maximumCapacity: 8,
    repeatsWeekly: false,
    recurrenceUntil: formatDateInput(addDays(weekStart, 35)),
  });
  const [moveForm, setMoveForm] = useState({
    startsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour)),
    endsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour + 1)),
  });

  useEffect(() => {
    if (!scheduleForm.teacherId && instructorsQuery.data?.[0]) {
      setScheduleForm((value) => ({ ...value, teacherId: instructorsQuery.data[0].id }));
    }
  }, [instructorsQuery.data, scheduleForm.teacherId]);

  const handleCreateSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createSchedule.mutate(
      {
        title: scheduleForm.title,
        type: scheduleForm.type,
        teacherId: scheduleForm.teacherId,
        placeId: scheduleForm.placeId || null,
        startsAt: scheduleForm.startsAt,
        endsAt: scheduleForm.endsAt,
        currentCapacity: 0,
        maximumCapacity: scheduleForm.maximumCapacity,
        assignedStudentIds: [],
        recurrence: scheduleForm.repeatsWeekly
          ? {
              frequency: 'WEEKLY',
              daysOfWeek: [toDayOfWeek(scheduleForm.startsAt)],
              until: scheduleForm.recurrenceUntil,
            }
          : null,
      },
      {
        onSuccess: () => {
          setScheduleForm({
            title: '',
            type: 'GROUP',
            teacherId: scheduleForm.teacherId,
            placeId: scheduleForm.placeId,
            startsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour)),
            endsAt: toDatetimeLocal(setHour(addDays(weekStart, 3), defaultLessonStartHour + 1)),
            maximumCapacity: 8,
            repeatsWeekly: false,
            recurrenceUntil: formatDateInput(addDays(weekStart, 35)),
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
              <h2>{formatKoreanDate(weekStart)} - {formatKoreanDate(addDays(weekStart, 6))}</h2>
              <p>{viewMode === 'month' ? '월간' : viewMode === 'day' ? '일간' : '주간'}</p>
            </div>
            <div className="calendar-nav">
            <button aria-label="이전 주" type="button" onClick={() => setWeekStart((value) => addDays(value, -7))}>‹</button>
            <button aria-label="다음 주" type="button" onClick={() => setWeekStart((value) => addDays(value, 7))}>›</button>
            </div>
          </div>
          <div className="schedule-actions">
            <div className="segmented-control" aria-label="보기 방식">
            <button className={viewMode === 'day' ? 'active' : undefined} type="button" onClick={() => setViewMode('day')}>일간</button>
            <button className={viewMode === 'week' ? 'active' : undefined} type="button" onClick={() => setViewMode('week')}>주간</button>
            <button className={viewMode === 'month' ? 'active' : undefined} type="button" onClick={() => setViewMode('month')}>월간</button>
          </div>
          <select aria-label="강사 필터" value={selectedTeacherId} onChange={(event) => setSelectedTeacherId(event.target.value)}>
            <option value="all">전체 강사</option>
            {instructorsQuery.data?.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
            ))}
          </select>
          <select aria-label="장소 필터" value={selectedPlaceId} onChange={(event) => setSelectedPlaceId(event.target.value)}>
            <option value="all">전체 장소</option>
            {placesQuery.data?.map((place) => (
              <option key={place.id} value={place.id}>{place.name}</option>
            ))}
          </select>
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
              강사 <b>*</b>
              <select
                required
                value={scheduleForm.teacherId}
                onChange={(event) => setScheduleForm({ ...scheduleForm, teacherId: event.target.value })}
              >
                <option value="">선택</option>
                {instructorsQuery.data?.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                ))}
              </select>
            </label>
            <label>
              장소
              <select
                value={scheduleForm.placeId}
                onChange={(event) => setScheduleForm({ ...scheduleForm, placeId: event.target.value })}
              >
                <option value="">미지정</option>
                {placesQuery.data?.map((place) => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
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
            <label>
              반복
              <select
                value={scheduleForm.repeatsWeekly ? 'WEEKLY' : 'NONE'}
                onChange={(event) => setScheduleForm({ ...scheduleForm, repeatsWeekly: event.target.value === 'WEEKLY' })}
              >
                <option value="NONE">없음</option>
                <option value="WEEKLY">매주</option>
              </select>
            </label>
            {scheduleForm.repeatsWeekly && (
              <label>
                반복 종료
                <input
                  type="date"
                  value={scheduleForm.recurrenceUntil}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, recurrenceUntil: event.target.value })}
                />
              </label>
            )}
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

function toDatetimeLocal(value: string | Date) {
  if (typeof value === 'string') {
    return value.slice(0, 16);
  }

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  const hour = `${value.getHours()}`.padStart(2, '0');
  const minute = `${value.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toDayOfWeek(value: string) {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[new Date(value).getDay()];
}

function formatTimeRangeFromIso(startsAt: string, endsAt: string) {
  return `${toDatetimeLocal(startsAt).replace('T', ' ')} - ${toDatetimeLocal(endsAt).split('T')[1]}`;
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay() === 0 ? 7 : date.getDay();

  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);

  return date;
}

function setHour(value: Date, hour: number) {
  const date = new Date(value);
  date.setHours(hour, 0, 0, 0);

  return date;
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatKoreanDate(value: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value);
}

function buildWeekDays(weekStart: Date) {
  const today = formatDateInput(new Date());
  const weekDayLabels = ['월', '화', '수', '목', '금', '토', '일'];

  return weekDayLabels.map((day, index) => {
    const date = addDays(weekStart, index);

    return {
      day,
      date: date.getDate(),
      active: formatDateInput(date) === today,
      muted: index >= 5,
    };
  });
}
