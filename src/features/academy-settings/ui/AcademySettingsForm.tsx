import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, LoadingState } from '../../../shared/ui/AsyncState';
import { useAcademySettings, useUpdateAcademySettings } from '../api/settingsApi';
import { createAcademyBrand } from '../model/academyBrand';
import type { AcademySettings } from '../model/settingsTypes';

const fallbackSettings: AcademySettings = {
  name: '',
  contact: '',
  address: '',
  logoUrl: null,
  mainColor: '#635bff',
  extensionAllowed: true,
  refundAllowed: false,
  makeupEnabled: true,
  makeupExpiresInDays: 30,
  makeupMaxCount: 2,
  ownerScheduleEnabled: true,
  ownerStudentsEnabled: true,
  ownerNoticesEnabled: true,
  teacherModeEnabled: true,
  studentPassEnabled: true,
  studentClassNotesEnabled: true,
  studentAbsenceRequestEnabled: true,
  crmEnabled: true,
};

export function AcademySettingsForm() {
  const settingsQuery = useAcademySettings();
  const updateSettings = useUpdateAcademySettings();
  const [settings, setSettings] = useState<AcademySettings>(fallbackSettings);
  const previewBrand = createAcademyBrand(settings);

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings.mutate(settings);
  };
  const updateToggle = (key: keyof AcademySettings) => setSettings((value) => ({ ...value, [key]: !value[key] }));

  if (settingsQuery.isPending) {
    return <LoadingState message="학원 설정을 불러오는 중입니다." />;
  }

  if (settingsQuery.isError) {
    return <ErrorState message="학원 설정을 불러오지 못했습니다." />;
  }

  return (
    <form className="settings-layout" onSubmit={handleSubmit} style={previewBrand.style}>
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
            <div className="settings-logo">
              {previewBrand.logoUrl ? <img alt="" src={previewBrand.logoUrl} /> : previewBrand.initials}
            </div>
            <div>
              <strong>로고</strong>
              <p>이미지 URL을 저장하면 운영 웹과 수강생 앱에 반영됩니다.</p>
              <input
                aria-label="로고 URL"
                placeholder="https://..."
                value={settings.logoUrl ?? ''}
                onChange={(event) => setSettings({ ...settings, logoUrl: event.target.value || null })}
              />
              <button className="text-danger" type="button" onClick={() => setSettings({ ...settings, logoUrl: null })}>삭제</button>
            </div>
          </div>
          <div className="form-grid">
            <label>
              학원 이름 <b>*</b>
              <input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
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
              <input value={settings.contact} onChange={(event) => setSettings({ ...settings, contact: event.target.value })} />
            </label>
            <label className="full">
              주소 <b>*</b>
              <input value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
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
          <header>
            <h2>기능 설정</h2>
            <p>학원별로 운영 웹, 강사 모드, 수강생 앱의 메뉴 노출을 제어합니다.</p>
          </header>
          {[
            ['시간표', '원장 운영 웹의 시간표 메뉴와 수업 관리 기능', 'ownerScheduleEnabled'],
            ['수강생 관리', '수강생 목록, 수강권, CRM 케어 영역', 'ownerStudentsEnabled'],
            ['공지사항', '원장 공지 작성과 수강생 공지 목록', 'ownerNoticesEnabled'],
            ['강사 모드', '강사 홈, 출석 체크, 클래스노트 작성', 'teacherModeEnabled'],
            ['수강생 수강권', '수강생 앱의 수강권 정보와 사용 이력', 'studentPassEnabled'],
            ['수강생 클래스노트', '수강생 앱의 클래스노트 읽기 화면', 'studentClassNotesEnabled'],
            ['수강생 결석 신청', '수강생 앱의 결석 신청 폼과 신청 상태', 'studentAbsenceRequestEnabled'],
            ['이탈 케어', '위험 수강생, 신호 배지, 케어 기록', 'crmEnabled'],
          ].map(([title, body, key]) => {
            const settingKey = key as keyof AcademySettings;
            const enabled = Boolean(settings[settingKey]);

            return (
              <div className="toggle-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </div>
                <button
                  aria-label={`${title} ${enabled ? '끄기' : '켜기'}`}
                  className={enabled ? 'switch on' : 'switch'}
                  type="button"
                  onClick={() => updateToggle(settingKey)}
                />
              </div>
            );
          })}
        </article>
        <article className="panel settings-card">
          <header className="brand-card-heading">
            <div>
              <h2>브랜드 <em>화이트라벨</em></h2>
              <p>저장한 색상은 운영 웹과 수강생 앱의 주요 액션 색상으로 적용됩니다.</p>
            </div>
            <button className="brand-preview-button" type="button" style={{ backgroundColor: settings.mainColor }}>● 미리보기</button>
          </header>
          <div className="color-swatches">
            {[
              ['Iris (기본)', '#635bff'],
              ['Grass', '#16a34a'],
              ['Amber', '#d97706'],
              ['Tomato', '#dc2626'],
              ['Blue', '#2563eb'],
              ['Indigo', '#4f46e5'],
            ].map(([name, color]) => (
              <button
                className={settings.mainColor === color ? 'swatch active' : 'swatch'}
                key={name}
                type="button"
                onClick={() => setSettings({ ...settings, mainColor: color })}
              >
                <span style={{ backgroundColor: color }}>{settings.mainColor === color ? '✓' : ''}</span>
                {name}
              </button>
            ))}
          </div>
        </article>
        <footer className="save-bar">
          <span>{updateSettings.isSuccess ? '저장됨' : '변경 사항 저장 가능'}</span>
          <div>
            <button type="button">취소</button>
            <button className="primary-button compact" type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? '저장 중' : '▣ 저장'}
            </button>
          </div>
        </footer>
      </div>
    </form>
  );
}
