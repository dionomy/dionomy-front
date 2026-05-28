import { TenantOnboardingPanel } from '../../features/tenant-onboarding/ui/TenantOnboardingPanel';

const tenants = [
  { name: '숭실 코딩학원', status: '활성', build: '완료', lastActive: '오늘 09:20' },
  { name: '리듬 보컬 스튜디오', status: '활성', build: '빌드중', lastActive: '어제 22:10' },
  { name: '모던 드로잉 클래스', status: '정지', build: '실패', lastActive: '5월 21일' },
] as const;

const tickets = [
  { title: '데모 신청: 리듬 보컬 스튜디오', type: '데모', state: '대기' },
  { title: '화이트라벨 컬러 변경 문의', type: 'CS', state: '응대중' },
  { title: '빌드 실패 재시도 요청', type: 'CS', state: '대기' },
] as const;

export function AdminHomePage() {
  return (
    <section className="page-stack admin-page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Dionomy 관리자</p>
          <h2>학원 세팅 대기열</h2>
          <p>회사 웹 유입, CS, 화이트라벨 빌드 상태를 처리합니다.</p>
        </div>
        <button className="primary-button" type="button">신규 학원 온보딩</button>
      </header>

      <section className="company-landing-preview">
        <div>
          <strong>Dionomy</strong>
          <h2>성인 취미 학원을 위한 운영 앱 세팅 서비스</h2>
          <p>일정, 수강권, 출석, 클래스노트, 이탈 신호를 학원별 정책에 맞춰 세팅합니다.</p>
        </div>
        <form>
          <input aria-label="학원명" placeholder="학원명" />
          <input aria-label="업종" placeholder="업종" />
          <input aria-label="규모" placeholder="수강생 규모" />
          <input aria-label="연락처" placeholder="연락처" />
          <button className="primary-button" type="button">데모 신청</button>
        </form>
      </section>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>학원 목록</h2>
              <p>활성/정지/해지와 마지막 활동일</p>
            </div>
          </div>
          <div className="tenant-table">
            {tenants.map((tenant) => (
              <article key={tenant.name}>
                <strong>{tenant.name}</strong>
                <span>{tenant.status}</span>
                <span>{tenant.build}</span>
                <time>{tenant.lastActive}</time>
              </article>
            ))}
          </div>
        </section>

        <aside className="admin-side">
          <TenantOnboardingPanel />
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>CS 티켓 큐</h2>
                <p>FAQ/문의/데모 신청 통합 처리</p>
              </div>
            </div>
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <article key={ticket.title}>
                  <span>{ticket.type}</span>
                  <strong>{ticket.title}</strong>
                  <em>{ticket.state}</em>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
