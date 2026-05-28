import type { AcademySettings } from '../model/settingsTypes';

const settings: AcademySettings = {
  name: '숭실 코딩학원',
  contact: '02-1234-5678',
  address: '서울특별시 동작구 상도로 369 숭실관 3층',
  logoUrl: null,
  mainColor: 'var(--color-brand-9)',
  extensionAllowed: true,
  refundAllowed: false,
  makeupEnabled: true,
  makeupExpiresInDays: 30,
  makeupMaxCount: 2,
};

export function AcademySettingsForm() {
  return (
    <div className="settings-layout">
      <aside className="settings-nav">
        {['학원 정보', '알림', '결제', '브랜드', '계정 · 권한', '보안', '통합'].map((item, index) => (
          <button className={index === 0 ? 'settings-nav-item active' : 'settings-nav-item'} key={item} type="button">
            <span>{['⌂', '♢', '▭', '★', '♧', '▣', '⌘'][index]}</span>
            {item}
          </button>
        ))}
      </aside>
      <div className="settings-content">
        <article className="panel settings-card">
          <header>
            <h2>학원 정보</h2>
            <p>대시보드와 영수증에 표시되는 기본 정보입니다.</p>
          </header>
          <div className="logo-row">
            <div className="settings-logo">D</div>
            <div>
              <strong>로고</strong>
              <p>PNG · SVG 권장 · 최대 2MB</p>
              <button type="button">업로드</button>
              <button className="text-danger" type="button">삭제</button>
            </div>
          </div>
          <div className="form-grid">
            <label>
              학원 이름 <b>*</b>
              <input defaultValue={settings.name} />
            </label>
            <label>
              대표자 <b>*</b>
              <input defaultValue="이수광" />
            </label>
            <label>
              사업자등록번호 <b>*</b>
              <input defaultValue="123-45-67890" />
            </label>
            <label>
              전화번호 <b>*</b>
              <input defaultValue={settings.contact} />
            </label>
            <label className="full">
              주소 <b>*</b>
              <input defaultValue={settings.address} />
            </label>
          </div>
        </article>
        <article className="panel settings-card">
          <header>
            <h2>알림</h2>
            <p>학부모 · 강사에게 자동 발송되는 알림을 관리합니다.</p>
          </header>
          {[
            ['결석 알림', '학생이 결석하면 학부모에게 즉시 알림 발송', true],
            ['주간 진도 리포트', '매주 일요일 학부모에게 주간 진도 리포트 발송', true],
            ['만료 임박 안내', '수강권 만료 3일 전 학부모에게 안내 알림 발송', true],
            ['강사 일정 변경', '수업 시간 변경 시 강사에게 즉시 알림', false],
          ].map(([title, body, enabled]) => (
            <div className="toggle-row" key={title as string}>
              <div>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
              <i className={enabled ? 'switch on' : 'switch'} />
            </div>
          ))}
        </article>
        <article className="panel settings-card">
          <header className="brand-card-heading">
            <div>
              <h2>브랜드 <em>PRO 플랜</em></h2>
              <p>학원 브랜드 컬러로 화이트라벨 적용</p>
            </div>
            <button type="button">● 미리보기</button>
          </header>
          <div className="color-swatches">
            {[
              ['Iris (기본)', settings.mainColor, true],
              ['Grass', 'var(--color-success-9)', false],
              ['Amber', 'var(--color-warning-10)', false],
              ['Tomato', 'var(--color-danger-9)', false],
              ['Blue', 'var(--color-brand-7)', false],
              ['Indigo', 'var(--color-brand-8)', false],
            ].map(([name, color, active]) => (
              <button className={active ? 'swatch active' : 'swatch'} key={name as string} type="button">
                <span style={{ backgroundColor: color as string }}>{active ? '✓' : ''}</span>
                {name}
              </button>
            ))}
          </div>
        </article>
        <footer className="save-bar">
          <span>변경 사항 3개</span>
          <div>
            <button type="button">취소</button>
            <button className="primary-button compact" type="button">▣ 저장</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
