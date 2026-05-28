const classRoster = [
  { name: '정서윤', pass: '3/12', status: '참석' },
  { name: '김태오', pass: '7/8', status: '지각' },
  { name: '이하린', pass: '1/4', status: '결석' },
] as const;

const absenceQueue = [
  { student: '박민재', request: '다른 세션 이동', reason: '출장 일정', status: '승인 대기' },
  { student: '이하린', request: '보강', reason: '병원 방문', status: '승인 대기' },
] as const;

export function TeacherHomePage() {
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
              <h2>16:00 보컬 그룹 A</h2>
              <p>그룹 · 3/5명 · B룸</p>
            </div>
            <button type="button">수업 상세</button>
          </div>
          <div className="attendance-check-list">
            {classRoster.map((student) => (
              <article key={student.name}>
                <div>
                  <strong>{student.name}</strong>
                  <span>잔여 {student.pass}</span>
                </div>
                <div className="attendance-actions">
                  {['참석', '지각', '결석'].map((status) => (
                    <button className={student.status === status ? 'active' : undefined} key={status} type="button">
                      {status}
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
                <h2>결석 신청 승인 큐</h2>
                <p>수강생 요청 결과까지 확인</p>
              </div>
            </div>
            <div className="absence-queue">
              {absenceQueue.map((item) => (
                <article key={item.student}>
                  <strong>{item.student}</strong>
                  <span>{item.request} · {item.reason}</span>
                  <div>
                    <button className="primary-button compact" type="button">승인</button>
                    <button className="secondary-button compact" type="button">거절</button>
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
              {classRoster.map((student) => (
                <article key={student.name}>
                  <strong>{student.name}</strong>
                  <span>최근 수업 5월 26일 · 잔여 {student.pass}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
