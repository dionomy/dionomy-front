import { EmptyState, ErrorState, LoadingState } from '../../../shared/ui/AsyncState';
import { useRefreshRetentionSignals, useRiskStudents } from '../../crm/api/crmApi';
import { useStudentOperationSummary } from '../../student/api/studentApi';

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
  const riskStudentsQuery = useRiskStudents();
  const studentOperationSummaryQuery = useStudentOperationSummary();
  const refreshRetentionSignals = useRefreshRetentionSignals();

  return (
    <div className="dashboard-side-stack">
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
      <article className="panel risk-panel">
        <div className="panel-heading">
          <div>
            <h2>위험 수강생</h2>
            <p>저장된 룰 기반 이탈 신호</p>
          </div>
          <button
            className="secondary-button compact"
            type="button"
            disabled={refreshRetentionSignals.isPending}
            onClick={() => refreshRetentionSignals.mutate()}
          >
            {refreshRetentionSignals.isPending ? '갱신 중' : '신호 갱신'}
          </button>
        </div>
        <div className="risk-list">
          {riskStudentsQuery.isPending && <LoadingState message="위험 신호를 불러오는 중입니다." />}
          {riskStudentsQuery.isError && <ErrorState message="위험 신호를 불러오지 못했습니다." />}
          {riskStudentsQuery.isSuccess && riskStudentsQuery.data.length === 0 && <EmptyState message="표시할 위험 신호가 없습니다." />}
          {riskStudentsQuery.data?.slice(0, 4).map((student) => (
            <article key={student.studentId}>
              <strong>{student.studentName}</strong>
              <span>{student.signals.map((signal) => signal.label).join(', ')}</span>
            </article>
          ))}
        </div>
      </article>
      <article className="panel risk-panel">
        <div className="panel-heading">
          <div>
            <h2>수강권 To-do</h2>
            <p>만료/소진 임박 수강생</p>
          </div>
        </div>
        <div className="risk-list">
          {studentOperationSummaryQuery.isPending && <LoadingState message="수강권 상태를 불러오는 중입니다." />}
          {studentOperationSummaryQuery.isError && <ErrorState message="수강권 상태를 불러오지 못했습니다." />}
          {studentOperationSummaryQuery.data?.students
            .filter((student) => student.expiringSoon || student.lowRemaining)
            .slice(0, 4)
            .map((student) => (
              <article key={student.studentId}>
                <strong>{student.lowRemaining ? '회차 소진 임박' : '만료 임박'}</strong>
                <span>{student.remainingCount ?? 0}/{student.totalCount ?? 0}회 · {student.expiresOn ? formatDate(student.expiresOn) : '만료일 없음'}</span>
              </article>
            ))}
          {studentOperationSummaryQuery.isSuccess && studentOperationSummaryQuery.data.students.every((student) => !student.expiringSoon && !student.lowRemaining) && (
            <EmptyState message="처리할 수강권 To-do가 없습니다." />
          )}
        </div>
      </article>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
