import { useState } from 'react';
import type { FormEvent } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/AsyncState';
import { useCreateCsTicket, useCreateDemoRequest, useCsTickets, useDemoRequests } from '../../features/company/api/companyApi';
import { useTenantSetups, useUpdateTenantSetupStatus } from '../../features/tenant-onboarding/api/tenantSetupApi';
import { TenantOnboardingPanel } from '../../features/tenant-onboarding/ui/TenantOnboardingPanel';

export function AdminHomePage() {
  const demoRequestsQuery = useDemoRequests();
  const csTicketsQuery = useCsTickets();
  const tenantSetupsQuery = useTenantSetups();
  const updateTenantSetupStatus = useUpdateTenantSetupStatus();
  const createDemoRequest = useCreateDemoRequest();
  const createCsTicket = useCreateCsTicket();
  const [demoForm, setDemoForm] = useState({
    academyName: '',
    businessType: '',
    academySize: '',
    contact: '',
  });
  const [ticketForm, setTicketForm] = useState({
    title: '',
    body: '',
    contact: '',
  });

  const handleCreateDemoRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createDemoRequest.mutate(demoForm, {
      onSuccess: () => setDemoForm({ academyName: '', businessType: '', academySize: '', contact: '' }),
    });
  };

  const handleCreateCsTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createCsTicket.mutate(ticketForm, {
      onSuccess: () => setTicketForm({ title: '', body: '', contact: '' }),
    });
  };

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
          <ul>
            <li>운영 일정과 수강권</li>
            <li>강사/수강생 앱 경험</li>
            <li>CRM 위험 신호</li>
          </ul>
        </div>
        <form onSubmit={handleCreateDemoRequest}>
          <input aria-label="학원명" placeholder="학원명" required value={demoForm.academyName} onChange={(event) => setDemoForm({ ...demoForm, academyName: event.target.value })} />
          <input aria-label="업종" placeholder="업종" value={demoForm.businessType} onChange={(event) => setDemoForm({ ...demoForm, businessType: event.target.value })} />
          <input aria-label="규모" placeholder="수강생 규모" value={demoForm.academySize} onChange={(event) => setDemoForm({ ...demoForm, academySize: event.target.value })} />
          <input aria-label="연락처" placeholder="연락처" required value={demoForm.contact} onChange={(event) => setDemoForm({ ...demoForm, contact: event.target.value })} />
          <button className="primary-button" type="submit" disabled={createDemoRequest.isPending}>
            {createDemoRequest.isPending ? '신청 중' : '데모 신청'}
          </button>
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
                <p>FAQ/문의/데모 신청 통합 처리</p>
              </div>
            </div>
            <form className="ticket-form" onSubmit={handleCreateCsTicket}>
              <input placeholder="제목" required value={ticketForm.title} onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })} />
              <input placeholder="연락처" required value={ticketForm.contact} onChange={(event) => setTicketForm({ ...ticketForm, contact: event.target.value })} />
              <textarea placeholder="문의 내용" required value={ticketForm.body} onChange={(event) => setTicketForm({ ...ticketForm, body: event.target.value })} />
              <button className="primary-button compact" type="submit" disabled={createCsTicket.isPending}>
                {createCsTicket.isPending ? '등록 중' : '문의 등록'}
              </button>
            </form>
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
