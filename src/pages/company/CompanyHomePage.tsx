import { useState } from 'react';
import type { FormEvent } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/AsyncState';
import { useCreateCsTicket, useCreateDemoRequest, useCsTickets } from '../../features/company/api/companyApi';

const faqs = [
  ['앱을 원장이 직접 만드는 서비스인가요?', '아닙니다. Dionomy 운영팀이 학원별 정책과 화면 구성을 세팅하고, 원장·강사·수강생은 운영 기능을 사용합니다.'],
  ['MVP에서 결제도 지원하나요?', '결제 처리는 MVP 범위에서 제외하고, 수강권 상품/발급/사용 이력 관리에 집중합니다.'],
  ['화이트라벨 앱은 어떻게 제공되나요?', '학원별 로고, 메인 컬러, 정책을 반영한 웹/PWA 기반 운영 앱으로 먼저 제공합니다.'],
];

export function CompanyHomePage() {
  const createDemoRequest = useCreateDemoRequest();
  const createCsTicket = useCreateCsTicket();
  const csTicketsQuery = useCsTickets();
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
    <main className="company-page">
      <section className="company-landing-preview">
        <div>
          <strong>Dionomy</strong>
          <h1>성인 취미 학원을 위한 운영 앱 세팅 서비스</h1>
          <p>일정, 수강권, 출석, 클래스노트, 이탈 신호를 학원별 정책에 맞춰 운영 가능한 형태로 세팅합니다.</p>
          <ul>
            <li>원장 운영 CRM</li>
            <li>강사 수업 운영</li>
            <li>수강생 화이트라벨 앱</li>
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

      <section className="company-section">
        <div className="panel-heading">
          <div>
            <h2>가격 안내</h2>
            <p>MVP 기준 운영 세팅형 플랜</p>
          </div>
        </div>
        <div className="student-summary-grid">
          <article className="metric-card">
            <span>Starter</span>
            <strong>월 99,000원</strong>
            <em className="trend-pill success">소규모 학원</em>
          </article>
          <article className="metric-card">
            <span>Growth</span>
            <strong>월 199,000원</strong>
            <em className="trend-pill warning">다지점 준비</em>
          </article>
          <article className="metric-card">
            <span>Custom</span>
            <strong>문의</strong>
            <em className="trend-pill danger">화이트라벨 세팅</em>
          </article>
        </div>
      </section>

      <section className="company-section">
        <div className="panel-heading">
          <div>
            <h2>FAQ</h2>
            <p>도입 전 자주 묻는 질문</p>
          </div>
        </div>
        <div className="pass-product-list">
          {faqs.map(([question, answer]) => (
            <article key={question}>
              <strong>{question}</strong>
              <span>{answer}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="company-section admin-grid">
        <form className="panel ticket-form" onSubmit={handleCreateCsTicket}>
          <div className="panel-heading">
            <div>
              <h2>문의 등록</h2>
              <p>도입, 견적, 기능 문의를 남깁니다.</p>
            </div>
          </div>
          <input placeholder="제목" required value={ticketForm.title} onChange={(event) => setTicketForm({ ...ticketForm, title: event.target.value })} />
          <input placeholder="연락처" required value={ticketForm.contact} onChange={(event) => setTicketForm({ ...ticketForm, contact: event.target.value })} />
          <textarea placeholder="문의 내용" required value={ticketForm.body} onChange={(event) => setTicketForm({ ...ticketForm, body: event.target.value })} />
          <button className="primary-button compact" type="submit" disabled={createCsTicket.isPending}>
            {createCsTicket.isPending ? '등록 중' : '문의 등록'}
          </button>
        </form>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>내 문의 내역</h2>
              <p>연락처 기준 상세 필터는 인증 이후 확장합니다.</p>
            </div>
          </div>
          <div className="ticket-list">
            {csTicketsQuery.isPending && <LoadingState message="문의 내역을 불러오는 중입니다." />}
            {csTicketsQuery.isError && <ErrorState message="문의 내역을 불러오지 못했습니다." />}
            {csTicketsQuery.isSuccess && csTicketsQuery.data.length === 0 && <EmptyState message="등록된 문의가 없습니다." />}
            {csTicketsQuery.data?.map((ticket) => (
              <article key={ticket.id}>
                <span>문의</span>
                <strong>{ticket.title}</strong>
                <em>{ticket.status}</em>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
