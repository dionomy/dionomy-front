import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useAbsenceRequests, useResolveAbsenceRequest } from '../../features/absence/api/absenceApi';
import { useAttendance, useRecordAttendance, type AttendanceStatus } from '../../features/attendance/api/attendanceApi';
import { useSchedules } from '../../features/schedule/api/scheduleApi';
import { useStudents } from '../../features/student/api/studentApi';

const today = '2026-05-28';
const defaultTeacherId = '00000000-0000-0000-0000-000000000101';
const attendanceOptions: Array<{ label: string; value: AttendanceStatus }> = [
  { label: '참석', value: 'PRESENT' },
  { label: '지각', value: 'LATE' },
  { label: '결석', value: 'ABSENT' },
];

export function TeacherHomePage() {
  const schedulesQuery = useSchedules(today, today);
  const studentsQuery = useStudents();
  const session = schedulesQuery.data?.[0];
  const attendanceQuery = useAttendance(session?.id);
  const recordAttendance = useRecordAttendance();
  const absenceRequestsQuery = useAbsenceRequests();
  const resolveAbsenceRequest = useResolveAbsenceRequest();
  const students = studentsQuery.data ?? [];
  const attendanceByStudent = new Map(attendanceQuery.data?.map((record) => [record.studentId, record.status]));
  const pendingAbsenceRequests = absenceRequestsQuery.data?.filter((request) => request.status === 'PENDING') ?? [];

  return (
    <section className="page-stack teacher-page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">강사 모드</p>
          <h2>오늘 수업</h2>
          <p>출석 체크, 결석 승인, 담당 수강생 상태를 처리합니다.</p>
        </div>
        <button className="primary-button" type="button">클래스노트 작성</button>
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
            {session && students.length === 0 && <EmptyState message="등록된 수강생이 없습니다." />}
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
            <div className="class-note-box">
              <strong>오늘 진도</strong>
              <p>호흡 유지와 8마디 프레이징을 반복 연습했습니다.</p>
              <strong>다음 과제</strong>
              <p>템포 72로 2절까지 녹음해오기</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>결석 신청 승인 큐</h2>
                <p>수강생 요청 결과까지 확인</p>
              </div>
            </div>
            <div className="absence-queue">
              {absenceRequestsQuery.isPending && <LoadingState message="결석 신청을 불러오는 중입니다." />}
              {absenceRequestsQuery.isError && <ErrorState message="결석 신청을 불러오지 못했습니다." />}
              {absenceRequestsQuery.isSuccess && pendingAbsenceRequests.length === 0 && <EmptyState message="승인 대기 중인 결석 신청이 없습니다." />}
              {pendingAbsenceRequests.map((item) => (
                <article key={item.id}>
                  <strong>{students.find((student) => student.id === item.studentId)?.name ?? '수강생'}</strong>
                  <span>{item.desiredResult === 'MAKEUP' ? '보강' : '다른 세션 이동'} · {item.reason}</span>
                  <div>
                    <button
                      className="primary-button compact"
                      type="button"
                      disabled={resolveAbsenceRequest.isPending}
                      onClick={() => resolveAbsenceRequest.mutate({ requestId: item.id, action: 'approve' })}
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
