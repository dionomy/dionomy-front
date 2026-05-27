export function StudentHomePage() {
  return (
    <section className="mobile-page">
      <header className="mobile-header">
        <strong>Logo</strong>
        <button type="button">알림</button>
      </header>
      <main className="mobile-content">
        <article className="panel">
          <h1>다음 수업</h1>
          <p>오늘 19:00 · 성인 취미반 · 2강의실</p>
        </article>
        <article className="panel">
          <h2>내 수강권</h2>
          <p>잔여 7회 · 2026-06-30 만료</p>
        </article>
      </main>
      <nav className="bottom-tabs">
        <button type="button">홈</button>
        <button type="button">일정</button>
        <button type="button">노트</button>
        <button type="button">더보기</button>
      </nav>
    </section>
  );
}
