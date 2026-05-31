import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/AsyncState';
import { useCsTickets, useDemoRequests } from '../../features/company/api/companyApi';
import { useTenantSetups, useUpdateTenantSetupStatus } from '../../features/tenant-onboarding/api/tenantSetupApi';
import { TenantOnboardingPanel } from '../../features/tenant-onboarding/ui/TenantOnboardingPanel';

export function AdminHomePage() {
  const demoRequestsQuery = useDemoRequests();
  const csTicketsQuery = useCsTickets();
  const tenantSetupsQuery = useTenantSetups();
  const updateTenantSetupStatus = useUpdateTenantSetupStatus();

  return (
    <section className="page-stack admin-page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Dionomy 관리자</p>
          <h2>학원 세팅 대기열</h2>
          <p>데모 유입, CS, 화이트라벨 빌드 상태를 처리합니다.</p>
        </div>
        <button className="primary-button" type="button">신규 학원 온보딩</button>
      </header>

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
    </section>
  );
}
