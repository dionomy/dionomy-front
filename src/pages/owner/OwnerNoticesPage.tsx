const notices = [
  { title: '6월 휴원 안내', target: '전체', body: '현충일 당일은 전체 수업을 휴강합니다.', date: '2026.05.28' },
  { title: '보컬 그룹 A 보강 공지', target: '특정 클래스', body: '5월 30일 14:00 보강 세션이 열립니다.', date: '2026.05.27' },
] as const;

export function OwnerNoticesPage() {
  return (
    <section className="page-stack notices-page">
      <header className="page-hero">
        <div>
          <h2>공지사항</h2>
          <p>전체 또는 특정 클래스 수강생에게 발송할 공지를 작성합니다.</p>
        </div>
        <button className="primary-button" type="button">＋ 공지 작성</button>
      </header>

      <div className="notices-layout">
        <section className="panel notice-editor">
          <div className="panel-heading">
            <div>
              <h2>새 공지</h2>
              <p>제목, 본문, 이미지, 발송 대상을 설정</p>
            </div>
          </div>
          <label>
            <span>제목</span>
            <input defaultValue="6월 정규반 일정 안내" />
          </label>
          <label>
            <span>본문</span>
            <textarea defaultValue="6월 정규반 일정과 보강 가능 시간을 안내드립니다." />
          </label>
          <div className="notice-options">
            <button className="active" type="button">전체</button>
            <button type="button">특정 클래스</button>
          </div>
          <button className="primary-button" type="button">발송</button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>발송 내역</h2>
              <p>앱 공지 목록에 노출</p>
            </div>
          </div>
          <div className="notice-list">
            {notices.map((notice) => (
              <article key={notice.title}>
                <div>
                  <strong>{notice.title}</strong>
                  <span>{notice.target} · {notice.date}</span>
                </div>
                <p>{notice.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
