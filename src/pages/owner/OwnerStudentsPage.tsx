import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useStudents } from '../../features/student/api/studentApi';

const products = [
  { name: '4회 체험권', count: 4, period: '30일', price: '120,000원' },
  { name: '8회 정규권', count: 8, period: '60일', price: '220,000원' },
  { name: '12회 집중권', count: 12, period: '90일', price: '318,000원' },
] as const;

const usageLogs = [
  { student: '정서윤', type: '차감', count: 1, reason: '5월 26일 출석', time: '2026.05.26 20:12' },
  { student: '이하린', type: '복구', count: 1, reason: '강사 승인 보강 처리', time: '2026.05.25 15:30' },
  { student: '박민재', type: '차감', count: 1, reason: '5월 25일 출석', time: '2026.05.25 21:02' },
] as const;

export function OwnerStudentsPage() {
  const studentsQuery = useStudents();
  const students = studentsQuery.data ?? [];
  const selectedStudent = students[0];

  return (
    <section className="page-stack students-page">
      <header className="page-hero">
        <div>
          <h2>수강생 관리</h2>
          <p>등록, 수강권 발급, 차감/복구 이력을 한 화면에서 확인합니다.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" type="button">수강권 상품</button>
          <button className="primary-button" type="button">＋ 수강생 등록</button>
        </div>
      </header>

      <div className="student-summary-grid">
        <article className="metric-card">
          <span>등록 수강생</span>
          <strong>{students.length}</strong>
          <em className="trend-pill success">실시간</em>
        </article>
        <article className="metric-card">
          <span>만료 임박</span>
          <strong>준비중</strong>
          <em className="trend-pill warning">수강권 연동 예정</em>
        </article>
        <article className="metric-card">
          <span>회차 소진 임박</span>
          <strong>준비중</strong>
          <em className="trend-pill danger">수강권 연동 예정</em>
        </article>
      </div>

      <div className="students-layout">
        <section className="panel student-list-panel">
          <div className="panel-heading">
            <div>
              <h2>수강생 목록</h2>
              <p>검색과 태그 필터 대상</p>
            </div>
            <button type="button">전체 보기</button>
          </div>
          <div className="student-table">
            {studentsQuery.isPending && <LoadingState message="수강생을 불러오는 중입니다." />}
            {studentsQuery.isError && <ErrorState message="수강생을 불러오지 못했습니다." />}
            {studentsQuery.isSuccess && students.length === 0 && <EmptyState message="등록된 수강생이 없습니다." />}
            {students.map((student) => (
              <article className="student-row-card" key={student.id}>
                <div>
                  <strong>{student.name}</strong>
                  <span>{student.phone}</span>
                </div>
                <div className="student-tags">
                  {student.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </div>
                <div>
                  <strong>수강권 미발급</strong>
                  <span>{formatDate(student.createdAt)} 등록</span>
                </div>
                <span className="status-pill">정상</span>
              </article>
            ))}
          </div>
        </section>

        <aside className="student-detail-panel">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{selectedStudent ? `${selectedStudent.name} 상세` : '수강생 상세'}</h2>
                <p>수강권, 최근 수업, 메모</p>
              </div>
            </div>
            <div className="student-detail-stack">
              <div className="pass-progress">
                <div>
                  <span>수강권 잔여</span>
                  <strong>준비중</strong>
                </div>
                <progress value="0" max="1" />
                <small>수강권 발급 API 연동 예정</small>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>최근 수업</dt>
                  <dd>일정 배정 API 연동 예정</dd>
                </div>
                <div>
                  <dt>메모</dt>
                  <dd>{selectedStudent?.memo ?? '메모 없음'}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>수강권 상품</h2>
                <p>회차 + 유효기간 + 가격</p>
              </div>
            </div>
            <div className="pass-product-list">
              {products.map((product) => (
                <article key={product.name}>
                  <strong>{product.name}</strong>
                  <span>{product.count}회 · {product.period}</span>
                  <b>{product.price}</b>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>수강권 사용 이력</h2>
            <p>출석 차감과 결석/보강 복구 로그</p>
          </div>
        </div>
        <div className="usage-log-list">
          {usageLogs.map((log) => (
            <article key={`${log.student}-${log.time}`}>
              <span className={log.type === '차감' ? 'log-badge consume' : 'log-badge restore'}>{log.type}</span>
              <strong>{log.student}</strong>
              <span>{log.count}회 · {log.reason}</span>
              <time>{log.time}</time>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
