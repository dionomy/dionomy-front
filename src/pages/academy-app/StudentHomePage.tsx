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
          <p>오늘 출석률</p>
          <div>
            <strong>92</strong>
            <span>%</span>
            <em>↗ +2.3%</em>
          </div>
          <p>어제보다 2.3% 올랐어요</p>
        </article>
        <div className="quick-actions">
          {[
            ['✓', '출결 입력', 'brand'],
            ['✎', '노트 작성', 'success'],
            ['♧+', '학생 추가', 'warning'],
            ['▭', '결제 관리', 'danger'],
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
              <h1>오늘 수업 5개</h1>
              <p>진행 1 · 예정 4</p>
            </div>
            <button aria-label="전체 보기" type="button">›</button>
          </header>
          {[
            ['16:00', '중2 영어 심화반', 'LIVE'],
            ['18:00', '고1 수학 정규반', '2시간 후'],
            ['20:30', '중3 영어 회화반', '저녁'],
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
            ['⚠', '출결 미입력 2건', '오전 수업 출결을 기록해주세요', 'warning'],
            ['▭', '만료 임박 3명', '곧 만료되는 수강권이 있어요', 'danger'],
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
          ['□', '클래스'],
          ['▣', '시간표'],
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
