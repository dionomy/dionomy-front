const students = [
  {
    name: '정서윤',
    phone: '010-4821-1940',
    memo: '재등록 의사 높음',
    tags: ['초보', '평일 저녁'],
    pass: '12회권',
    remaining: 3,
    total: 12,
    expiresOn: '2026.06.12',
    recentClass: '5월 26일 보컬 그룹 A',
    status: '만료 임박',
  },
  {
    name: '박민재',
    phone: '010-3381-7288',
    memo: '출장 일정 변동 잦음',
    tags: ['1:1', '보강 누적'],
    pass: '8회권',
    remaining: 6,
    total: 8,
    expiresOn: '2026.07.04',
    recentClass: '5월 25일 피아노 1:1',
    status: '정상',
  },
  {
    name: '이하린',
    phone: '010-9255-0172',
    memo: '첫 달 적응 관찰',
    tags: ['신규', '기초반'],
    pass: '4회 체험권',
    remaining: 1,
    total: 4,
    expiresOn: '2026.05.31',
    recentClass: '5월 24일 드럼 입문',
    status: '회차 임박',
  },
] as const;

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
          <strong>142</strong>
          <em className="trend-pill success">이번 달 +12</em>
        </article>
        <article className="metric-card">
          <span>만료 임박</span>
          <strong>18</strong>
          <em className="trend-pill warning">7일 이내</em>
        </article>
        <article className="metric-card">
          <span>회차 소진 임박</span>
          <strong>11</strong>
          <em className="trend-pill danger">2회 이하</em>
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
            {students.map((student) => (
              <article className="student-row-card" key={student.phone}>
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
                  <strong>{student.remaining}/{student.total}</strong>
                  <span>{student.pass} · {student.expiresOn}</span>
                </div>
                <span className={student.status === '정상' ? 'status-pill' : 'status-pill warning'}>{student.status}</span>
              </article>
            ))}
          </div>
        </section>

        <aside className="student-detail-panel">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>정서윤 상세</h2>
                <p>수강권, 최근 수업, 메모</p>
              </div>
            </div>
            <div className="student-detail-stack">
              <div className="pass-progress">
                <div>
                  <span>12회권 잔여</span>
                  <strong>3회</strong>
                </div>
                <progress value="9" max="12" />
                <small>2026.06.12 만료 · 기간 또는 회차 중 먼저 만료</small>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>최근 수업</dt>
                  <dd>{students[0].recentClass}</dd>
                </div>
                <div>
                  <dt>메모</dt>
                  <dd>{students[0].memo}</dd>
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
