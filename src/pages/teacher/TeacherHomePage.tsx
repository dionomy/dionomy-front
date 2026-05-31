import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useAbsenceRequests, useResolveAbsenceRequest } from '../../features/absence/api/absenceApi';
import { useAttendance, useRecordAttendance, type AttendanceStatus } from '../../features/attendance/api/attendanceApi';
import { useClassNotes, useCreateClassNote } from '../../features/class-note/api/classNoteApi';
import { useCreateInstructorAvailability, useInstructorAvailabilities } from '../../features/operation/api/operationApi';
import { useSchedules } from '../../features/schedule/api/scheduleApi';
import { useStudents } from '../../features/student/api/studentApi';

const defaultTeacherId = '00000000-0000-0000-0000-000000000101';
const attendanceOptions: Array<{ label: string; value: AttendanceStatus }> = [
  { label: '참석', value: 'PRESENT' },
  { label: '지각', value: 'LATE' },
  { label: '결석', value: 'ABSENT' },
];

export function TeacherHomePage() {
  const today = formatDateInput(new Date());
  const schedulesQuery = useSchedules(today, today);
  const upcomingSchedulesQuery = useSchedules(today, formatDateInput(addDays(new Date(), 14)));
  const studentsQuery = useStudents();
  const teacherSessions = schedulesQuery.data?.filter((item) => item.teacherId === defaultTeacherId) ?? [];
  const session = teacherSessions[0];
  const attendanceQuery = useAttendance(session?.id);
  const recordAttendance = useRecordAttendance();
  const classNotesQuery = useClassNotes(session?.id);
  const createClassNote = useCreateClassNote(session?.id);
  const availabilitiesQuery = useInstructorAvailabilities(defaultTeacherId);
  const createAvailability = useCreateInstructorAvailability(defaultTeacherId);
  const absenceRequestsQuery = useAbsenceRequests();
  const resolveAbsenceRequest = useResolveAbsenceRequest();
  const students = (studentsQuery.data ?? []).filter((student) => session?.assignedStudentIds.includes(student.id));
  const allStudents = studentsQuery.data ?? [];
  const attendanceByStudent = new Map(attendanceQuery.data?.map((record) => [record.studentId, record.status]));
  const pendingAbsenceRequests = absenceRequestsQuery.data?.filter((request) => request.status === 'PENDING') ?? [];
  const availabilities = availabilitiesQuery.data ?? [];
  const moveTargetSessions = upcomingSchedulesQuery.data
    ?.filter((candidate) => (
      candidate.teacherId === defaultTeacherId &&
      candidate.assignedStudentIds.length < candidate.maximumCapacity &&
      availabilities.some((availability) => coversRange(availability.startsAt, availability.endsAt, candidate.startsAt, candidate.endsAt))
    )) ?? [];
  const [noteForm, setNoteForm] = useState({
    progress: '',
    feedback: '',
    nextAssignment: '',
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    startsAt: `${today}T18:00`,
    endsAt: `${today}T19:00`,
    memo: '',
  });
  const [absenceTargetSessions, setAbsenceTargetSessions] = useState<Record<string, string>>({});
  const [absenceTargetAvailabilities, setAbsenceTargetAvailabilities] = useState<Record<string, string>>({});

  const handleCreateClassNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    createClassNote.mutate(
      {
        sessionId: session.id,
        teacherId: defaultTeacherId,
        progress: noteForm.progress,
        feedback: noteForm.feedback,
        nextAssignment: noteForm.nextAssignment,
      },
      {
        onSuccess: () => setNoteForm({ progress: '', feedback: '', nextAssignment: '' }),
      },
    );
  };

  const handleCreateAvailability = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createAvailability.mutate(
      {
        instructorId: defaultTeacherId,
        startsAt: availabilityForm.startsAt,
        endsAt: availabilityForm.endsAt,
        memo: availabilityForm.memo || null,
      },
      {
        onSuccess: () => setAvailabilityForm({
          startsAt: `${today}T18:00`,
          endsAt: `${today}T19:00`,
          memo: '',
        }),
      },
    );
  };

  return (
    <section className="page-stack teacher-page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">강사 모드</p>
          <h2>오늘 수업</h2>
          <p>출석 체크, 결석 승인, 담당 수강생 상태를 처리합니다.</p>
        </div>
        <button className="primary-button" type="button">클래스노트</button>
      </header>

      <div className="teacher-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{session ? `${formatTime(session.startsAt)} ${session.title}` : '오늘 수업 없음'}</h2>
              <p>{session ? `${session.type === 'GROUP' ? '그룹' : '1:1'} · ${session.currentCapacity}/${session.maximumCapacity}명` : '등록된 수업이 없습니다.'}</p>
            </div>
            <button type="button">수업 상세</button>
          </div>
          <div className="attendance-check-list">
            {(schedulesQuery.isPending || studentsQuery.isPending) && <LoadingState message="출석 대상을 불러오는 중입니다." />}
            {(schedulesQuery.isError || studentsQuery.isError) && <ErrorState message="출석 대상을 불러오지 못했습니다." />}
              {session && students.length === 0 && <EmptyState message="이 수업에 배정된 수강생이 없습니다." />}
            {session && students.map((student) => (
              <article key={student.name}>
                <div>
                  <strong>{student.name}</strong>
                  <span>{student.phone}</span>
                </div>
                <div className="attendance-actions">
                  {attendanceOptions.map((status) => (
                    <button
                      className={attendanceByStudent.get(student.id) === status.value ? 'active' : undefined}
                      key={status.value}
                      type="button"
                      disabled={recordAttendance.isPending}
                      onClick={() => {
                        recordAttendance.mutate({
                          sessionId: session.id,
                          studentId: student.id,
                          teacherId: defaultTeacherId,
                          status: status.value,
                        });
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="teacher-side">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>클래스노트</h2>
                <p>수업 단위로 공유되는 진도와 과제</p>
              </div>
            </div>
            <form className="class-note-form" onSubmit={handleCreateClassNote}>
              <input
                required
                placeholder="진도"
                value={noteForm.progress}
                onChange={(event) => setNoteForm({ ...noteForm, progress: event.target.value })}
                disabled={!session}
              />
              <textarea
                required
                placeholder="피드백"
                value={noteForm.feedback}
                onChange={(event) => setNoteForm({ ...noteForm, feedback: event.target.value })}
                disabled={!session}
              />
              <input
                placeholder="다음 과제"
                value={noteForm.nextAssignment}
                onChange={(event) => setNoteForm({ ...noteForm, nextAssignment: event.target.value })}
                disabled={!session}
              />
              {createClassNote.isError && <ErrorState message="클래스노트 작성에 실패했습니다." />}
              <button className="primary-button compact" type="submit" disabled={!session || createClassNote.isPending}>
                {createClassNote.isPending ? '저장 중' : '저장'}
              </button>
            </form>
            <div className="class-note-box">
              {classNotesQuery.isPending && <LoadingState message="클래스노트를 불러오는 중입니다." />}
              {classNotesQuery.isSuccess && classNotesQuery.data.length === 0 && <EmptyState message="이전 클래스노트가 없습니다." />}
              {classNotesQuery.data?.map((note) => (
                <article key={note.id}>
                  <strong>{note.progress}</strong>
                  <p>{note.feedback}</p>
                  <span>{note.nextAssignment}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>결석 신청 승인 큐</h2>
                <p>가능 시간대 기준으로 이동/보강 승인</p>
              </div>
            </div>
            <div className="absence-queue">
              {absenceRequestsQuery.isPending && <LoadingState message="결석 신청을 불러오는 중입니다." />}
              {absenceRequestsQuery.isError && <ErrorState message="결석 신청을 불러오지 못했습니다." />}
              {absenceRequestsQuery.isSuccess && pendingAbsenceRequests.length === 0 && <EmptyState message="승인 대기 중인 결석 신청이 없습니다." />}
              {pendingAbsenceRequests.map((item) => (
                <article key={item.id}>
                  <strong>{allStudents.find((student) => student.id === item.studentId)?.name ?? '수강생'}</strong>
                  <span>{item.desiredResult === 'MAKEUP' ? '보강' : '다른 세션 이동'} · {item.reason}</span>
                  {item.desiredResult === 'MOVE_TO_OTHER_SESSION' && (
                    <select
                      aria-label="이동 대상 세션"
                      value={absenceTargetSessions[item.id] ?? ''}
                      onChange={(event) => setAbsenceTargetSessions((value) => ({ ...value, [item.id]: event.target.value }))}
                    >
                      <option value="">이동 대상 선택</option>
                      {moveTargetSessions
                        .filter((candidate) => candidate.id !== item.sessionId)
                        .map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {formatDateTime(candidate.startsAt)} {candidate.title}
                          </option>
                        ))}
                    </select>
                  )}
                  {item.desiredResult === 'MAKEUP' && (
                    <select
                      aria-label="보강 가능 시간"
                      value={absenceTargetAvailabilities[item.id] ?? ''}
                      onChange={(event) => setAbsenceTargetAvailabilities((value) => ({ ...value, [item.id]: event.target.value }))}
                    >
                      <option value="">보강 시간 선택</option>
                      {availabilities.map((availability) => (
                        <option key={availability.id} value={availability.id}>
                          {formatDateTime(availability.startsAt)} - {formatTime(availability.endsAt)}
                        </option>
                      ))}
                    </select>
                  )}
                  <div>
                    <button
                      className="primary-button compact"
                      type="button"
                      disabled={
                        resolveAbsenceRequest.isPending ||
                        (item.desiredResult === 'MOVE_TO_OTHER_SESSION' && !absenceTargetSessions[item.id]) ||
                        (item.desiredResult === 'MAKEUP' && !absenceTargetAvailabilities[item.id])
                      }
                      onClick={() => resolveAbsenceRequest.mutate({
                        requestId: item.id,
                        action: 'approve',
                        targetSessionId: absenceTargetSessions[item.id] ?? null,
                        targetAvailabilityId: absenceTargetAvailabilities[item.id] ?? null,
                      })}
                    >
                      승인
                    </button>
                    <button
                      className="secondary-button compact"
                      type="button"
                      disabled={resolveAbsenceRequest.isPending}
                      onClick={() => resolveAbsenceRequest.mutate({ requestId: item.id, action: 'reject' })}
                    >
                      거절
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>가능 시간대</h2>
                <p>보강과 세션 이동 승인 후보</p>
              </div>
            </div>
            <form className="availability-form" onSubmit={handleCreateAvailability}>
              <input
                aria-label="시작 시간"
                type="datetime-local"
                value={availabilityForm.startsAt}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, startsAt: event.target.value })}
              />
              <input
                aria-label="종료 시간"
                type="datetime-local"
                value={availabilityForm.endsAt}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, endsAt: event.target.value })}
              />
              <input
                placeholder="메모"
                value={availabilityForm.memo}
                onChange={(event) => setAvailabilityForm({ ...availabilityForm, memo: event.target.value })}
              />
              <button className="primary-button compact" type="submit" disabled={createAvailability.isPending}>
                {createAvailability.isPending ? '등록 중' : '등록'}
              </button>
            </form>
            <div className="availability-list">
              {availabilitiesQuery.isPending && <LoadingState message="가능 시간대를 불러오는 중입니다." />}
              {availabilitiesQuery.isSuccess && availabilities.length === 0 && <EmptyState message="등록된 가능 시간대가 없습니다." />}
              {availabilities.slice(0, 5).map((availability) => (
                <article key={availability.id}>
                  <strong>{formatDateTime(availability.startsAt)} - {formatTime(availability.endsAt)}</strong>
                  <span>{availability.memo || '메모 없음'}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>내 수강생</h2>
                <p>최근 수업일과 잔여 회차</p>
              </div>
            </div>
            <div className="teacher-student-list">
              {students.map((student) => (
                <article key={student.name}>
                  <strong>{student.name}</strong>
                  <span>{student.phone} · {student.tags.join(', ') || '태그 없음'}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function coversRange(availableStartsAt: string, availableEndsAt: string, targetStartsAt: string, targetEndsAt: string) {
  return new Date(availableStartsAt) <= new Date(targetStartsAt) && new Date(availableEndsAt) >= new Date(targetEndsAt);
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);

  return date;
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
