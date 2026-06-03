import { useEffect, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/AsyncState';
import { useAcademySettings, useUpdateAcademySettings } from '../../features/academy-settings/api/settingsApi';
import type { AcademySettings } from '../../features/academy-settings/model/settingsTypes';
import { useCsTickets, useDemoRequests } from '../../features/company/api/companyApi';
import { useTenantSetups, useUpdateTenantSetupStatus } from '../../features/tenant-onboarding/api/tenantSetupApi';
import { TenantOnboardingPanel } from '../../features/tenant-onboarding/ui/TenantOnboardingPanel';

const sampleAcademies = [
  { number: 1, tenantId: '00000000-0000-0000-0000-000000000001', name: '샘플 아카데미', description: '전체 기능 켜짐' },
  { number: 2, tenantId: '00000000-0000-0000-0000-000000000002', name: '리듬앤무브 댄스스튜디오', description: '공지/클래스노트/CRM 꺼짐' },
  { number: 3, tenantId: '00000000-0000-0000-0000-000000000003', name: '어반드로잉 클래스', description: '강사/수강권/결석 신청 꺼짐' },
];

export function AdminHomePage() {
  const demoRequestsQuery = useDemoRequests();
  const csTicketsQuery = useCsTickets();
  const tenantSetupsQuery = useTenantSetups();
  const updateTenantSetupStatus = useUpdateTenantSetupStatus();
  const [selectedAcademyNumber, setSelectedAcademyNumber] = useState(1);
  const selectedAcademy = sampleAcademies.find((academy) => academy.number === selectedAcademyNumber) ?? sampleAcademies[0];
  const academySettingsQuery = useAcademySettings(selectedAcademy.tenantId);
  const updateAcademySettings = useUpdateAcademySettings(selectedAcademy.tenantId);
  const [settingsDraft, setSettingsDraft] = useState<AcademySettings | null>(null);

  useEffect(() => {
    if (academySettingsQuery.data) {
      setSettingsDraft(academySettingsQuery.data);
    }
  }, [academySettingsQuery.data]);

  const toggleSetting = (key: keyof AcademySettings) => {
    setSettingsDraft((settings) => settings ? { ...settings, [key]: !settings[key] } : settings);
  };

  const updateField = (key: keyof AcademySettings, value: string | boolean | number | null) => {
    setSettingsDraft((settings) => settings ? { ...settings, [key]: value } : settings);
  };

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>Dionomy</strong>
          <span>운영팀 관리자</span>
        </div>
        <nav>
          <a className="active" href="/admin">학원</a>
          <a href="/company">회사 웹</a>
        </nav>
      </aside>
      <main className="admin-main">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Dionomy 관리자</p>
          <h1>학원 세팅 대기열</h1>
          <p>데모 유입, CS, 화이트라벨 빌드 상태를 처리합니다.</p>
        </div>
        <button className="primary-button" type="button">신규 학원 온보딩</button>
      </header>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>개발 샘플 학원 바로가기</h2>
            <p>임시 academy number 라우팅 확인용</p>
          </div>
        </div>
        <div className="academy-link-grid">
            {sampleAcademies.map((academy) => (
            <article key={academy.number}>
              <div>
                <strong>{academy.name}</strong>
                <span>{academy.description}</span>
              </div>
              <button type="button" onClick={() => setSelectedAcademyNumber(academy.number)}>세팅</button>
              <a href={`/academy/${academy.number}/owner/dashboard`}>원장 화면</a>
              <a href={`/academy/${academy.number}/student`}>수강생 앱</a>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{selectedAcademy.name} 세팅</h2>
            <p>운영팀이 학원별 브랜딩, 정책, 기능 노출을 직접 조정합니다.</p>
          </div>
          <button
            className="primary-button compact"
            type="button"
            disabled={!settingsDraft || updateAcademySettings.isPending}
            onClick={() => settingsDraft && updateAcademySettings.mutate(settingsDraft)}
          >
            {updateAcademySettings.isPending ? '저장 중' : '저장'}
          </button>
        </div>
        {academySettingsQuery.isPending && <LoadingState message="학원 설정을 불러오는 중입니다." />}
        {academySettingsQuery.isError && <ErrorState message="학원 설정을 불러오지 못했습니다." />}
        {settingsDraft && (
          <div className="admin-settings-grid">
            <label>
              학원명
              <input value={settingsDraft.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label>
              연락처
              <input value={settingsDraft.contact} onChange={(event) => updateField('contact', event.target.value)} />
            </label>
            <label>
              주소
              <input value={settingsDraft.address} onChange={(event) => updateField('address', event.target.value)} />
            </label>
            <label>
              메인 컬러
              <input value={settingsDraft.mainColor} onChange={(event) => updateField('mainColor', event.target.value)} />
            </label>
            {[
              ['시간표', 'ownerScheduleEnabled'],
              ['수강생 관리', 'ownerStudentsEnabled'],
              ['공지', 'ownerNoticesEnabled'],
              ['강사 모드', 'teacherModeEnabled'],
              ['수강생 수강권', 'studentPassEnabled'],
              ['클래스노트', 'studentClassNotesEnabled'],
              ['결석 신청', 'studentAbsenceRequestEnabled'],
              ['이탈 케어', 'crmEnabled'],
            ].map(([label, key]) => {
              const settingKey = key as keyof AcademySettings;
              const enabled = Boolean(settingsDraft[settingKey]);

              return (
                <button className={enabled ? 'admin-feature-toggle on' : 'admin-feature-toggle'} key={key} type="button" onClick={() => toggleSetting(settingKey)}>
                  <strong>{label}</strong>
                  <span>{enabled ? '사용' : '미사용'}</span>
                </button>
              );
            })}
          </div>
        )}
        {updateAcademySettings.isSuccess && <p className="admin-save-status">저장됨</p>}
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
            {demoRequestsQuery.isPending && <LoadingState message="데모 신청을 불러오는 중입니다." />}
            {demoRequestsQuery.isError && <ErrorState message="데모 신청을 불러오지 못했습니다." />}
            {demoRequestsQuery.isSuccess && demoRequestsQuery.data.length === 0 && <EmptyState message="데모 신청이 없습니다." />}
            {demoRequestsQuery.data?.map((request) => (
              <article key={request.id}>
                <strong>{request.academyName}</strong>
                <span>{request.businessType || '업종 미입력'}</span>
                <span>{request.academySize || '규모 미입력'}</span>
                <time>{request.contact}</time>
              </article>
            ))}
          </div>
          <div className="tenant-table">
            {tenantSetupsQuery.isPending && <LoadingState message="테넌트 세팅을 불러오는 중입니다." />}
            {tenantSetupsQuery.data?.map((tenant) => (
              <article key={tenant.id}>
                <strong>{tenant.academyName}</strong>
                <select
                  value={tenant.tenantStatus}
                  onChange={(event) => updateTenantSetupStatus.mutate({ setupId: tenant.id, status: event.target.value as typeof tenant.tenantStatus })}
                >
                  <option value="ACTIVE">활성</option>
                  <option value="SUSPENDED">정지</option>
                  <option value="CANCELED">해지</option>
                </select>
                <span>{tenant.buildStatus}</span>
                <time>{tenant.ownerContact}</time>
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
                <p>회사 웹 문의 응대</p>
              </div>
            </div>
            <div className="ticket-list">
              {csTicketsQuery.data?.map((ticket) => (
                <article key={ticket.id}>
                  <span>CS</span>
                  <strong>{ticket.title}</strong>
                  <em>{ticket.status}</em>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
      </main>
    </section>
  );
}
