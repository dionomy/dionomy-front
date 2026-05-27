import type { AcademySettings } from '../model/settingsTypes';

const settings: AcademySettings = {
  name: '샘플 아카데미',
  contact: '02-000-0000',
  address: '서울시 강남구',
  logoUrl: null,
  mainColor: '#4F46E5',
  extensionAllowed: true,
  refundAllowed: false,
  makeupEnabled: true,
  makeupExpiresInDays: 30,
  makeupMaxCount: 2,
};

export function AcademySettingsForm() {
  return (
    <article className="panel settings-form">
      <h2>학원 기본 정보</h2>
      <label>
        학원명
        <input defaultValue={settings.name} />
      </label>
      <label>
        연락처
        <input defaultValue={settings.contact} />
      </label>
      <label>
        주소
        <input defaultValue={settings.address} />
      </label>
      <label>
        메인 컬러
        <input defaultValue={settings.mainColor} />
      </label>
      <div className="toggle-row">
        <span>수강권 연장 가능</span>
        <strong>{settings.extensionAllowed ? '가능' : '불가'}</strong>
      </div>
      <div className="toggle-row">
        <span>보강 정책</span>
        <strong>
          {settings.makeupEnabled ? `${settings.makeupExpiresInDays}일 · ${settings.makeupMaxCount}회` : '불가'}
        </strong>
      </div>
    </article>
  );
}
