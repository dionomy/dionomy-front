export function TeacherHomePage() {
  return (
    <section className="page-stack">
      <header>
        <p className="eyebrow">강사 모드</p>
        <h1>오늘 수업</h1>
      </header>
      <article className="panel">
        <h2>출석 체크 대기</h2>
        <p>10:00 바이올린 그룹 A · 수강생 3명</p>
      </article>
      <article className="panel">
        <h2>결석 신청 승인 큐</h2>
        <p>처리 대기 2건</p>
      </article>
    </section>
  );
}
