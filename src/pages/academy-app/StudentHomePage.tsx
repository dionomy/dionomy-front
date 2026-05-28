export function StudentHomePage() {
  return (
    <section className="mobile-page">
      <div className="status-bar">
        <strong>9:41</strong>
        <span>♢ 100%</span>
      </div>
      <header className="mobile-header">
        <div className="mobile-brand">
          <span>D</span>
          <strong>Dionomy</strong>
        </div>
        <div className="mobile-actions">
          <button aria-label="알림" type="button">♢</button>
          <i>김</i>
        </div>
      </header>
      <main className="mobile-content">
        <article className="mobile-hero">
          <p>다음 수업</p>
          <div>
            <strong>19:00</strong>
            <span>오늘</span>
            <em>보컬 그룹 A</em>
          </div>
          <p>김하늘 강사 · B룸</p>
        </article>
        <div className="quick-actions">
          {[
            ['□', '내 일정', 'brand'],
            ['!', '결석 신청', 'warning'],
            ['▭', '수강권', 'success'],
            ['✎', '노트', 'danger'],
          ].map(([icon, label, tone]) => (
            <button key={label} type="button">
              <span className={tone}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <article className="mobile-card today-classes">
          <header>
            <div>
              <h1>내 일정</h1>
              <p>배정된 수업과 결석 신청 상태</p>
            </div>
            <button aria-label="전체 보기" type="button">›</button>
          </header>
          {[
            ['오늘', '19:00 보컬 그룹 A', '예정'],
            ['5.30', '14:00 발성 클리닉', '보강'],
            ['6.03', '19:00 보컬 그룹 A', '대기'],
          ].map(([time, title, state], index) => (
            <div className="mobile-class-row" key={time}>
              <strong>{time}</strong>
              <i className={index === 0 ? 'live' : undefined} />
              <span>{title}</span>
              <em className={index === 0 ? 'live' : undefined}>{state}</em>
            </div>
          ))}
        </article>
        <section className="mobile-alerts">
          <h2>확인할 것</h2>
          {[
            ['▭', '잔여 3회 · 2026.06.12 만료', '기간 또는 회차 중 먼저 만료돼요', 'warning'],
            ['!', '결석 신청 승인 대기', '6월 3일 수업 보강 요청이 접수됐어요', 'danger'],
          ].map(([icon, title, body, tone]) => (
            <article className="mobile-card alert-row" key={title}>
              <span className={tone}>{icon}</span>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
              <button aria-label="상세 보기" type="button">›</button>
            </article>
          ))}
        </section>
      </main>
      <nav className="bottom-tabs">
        {[
          ['⌂', '홈'],
          ['□', '일정'],
          ['▣', '수강권'],
          ['♙', '내 정보'],
        ].map(([icon, label], index) => (
          <button className={index === 0 ? 'active' : undefined} key={label} type="button">
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </section>
  );
}
