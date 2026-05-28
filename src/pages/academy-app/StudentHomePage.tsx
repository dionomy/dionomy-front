import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAbsenceRequests, useCreateAbsenceRequest, type AbsenceDesiredResult } from '../../features/absence/api/absenceApi';
import { useSchedules } from '../../features/schedule/api/scheduleApi';
import { useStudents } from '../../features/student/api/studentApi';

const today = '2026-05-28';

export function StudentHomePage() {
  const schedulesQuery = useSchedules(today, '2026-06-03');
  const studentsQuery = useStudents();
  const student = studentsQuery.data?.[0];
  const nextSession = schedulesQuery.data?.[0];
  const absenceRequestsQuery = useAbsenceRequests(student?.id);
  const createAbsenceRequest = useCreateAbsenceRequest(student?.id);
  const [reason, setReason] = useState('');
  const [desiredResult, setDesiredResult] = useState<AbsenceDesiredResult>('MAKEUP');

  const handleAbsenceRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!student || !nextSession) {
      return;
    }

    createAbsenceRequest.mutate(
      {
        studentId: student.id,
        sessionId: nextSession.id,
        reason,
        desiredResult,
      },
      {
        onSuccess: () => setReason(''),
      },
    );
  };

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
          <p>다음 수업</p>
          <div>
            <strong>{nextSession ? formatTime(nextSession.startsAt) : '--:--'}</strong>
            <span>{nextSession ? '예정' : '없음'}</span>
            <em>{nextSession?.title ?? '배정된 수업 없음'}</em>
          </div>
          <p>{nextSession ? `${nextSession.type === 'GROUP' ? '그룹' : '1:1'} · ${nextSession.currentCapacity}/${nextSession.maximumCapacity}명` : '원장이 수업을 배정하면 표시됩니다.'}</p>
        </article>
        <div className="quick-actions">
          {[
            ['□', '내 일정', 'brand'],
            ['!', '결석 신청', 'warning'],
            ['▭', '수강권', 'success'],
            ['✎', '노트', 'danger'],
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
              <h1>내 일정</h1>
              <p>배정된 수업과 결석 신청 상태</p>
            </div>
            <button aria-label="전체 보기" type="button">›</button>
          </header>
          {schedulesQuery.data?.map((session, index) => (
            <div className="mobile-class-row" key={session.id}>
              <strong>{formatShortDate(session.startsAt)}</strong>
              <i className={index === 0 ? 'live' : undefined} />
              <span>{formatTime(session.startsAt)} {session.title}</span>
              <em className={index === 0 ? 'live' : undefined}>{index === 0 ? '예정' : '대기'}</em>
            </div>
          ))}
        </article>
        <form className="mobile-card absence-request-form" onSubmit={handleAbsenceRequest}>
          <h2>결석 신청</h2>
          <input
            required
            placeholder="사유"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={!student || !nextSession}
          />
          <select value={desiredResult} onChange={(event) => setDesiredResult(event.target.value as AbsenceDesiredResult)}>
            <option value="MAKEUP">보강</option>
            <option value="MOVE_TO_OTHER_SESSION">다른 세션 이동</option>
          </select>
          <button type="submit" disabled={!student || !nextSession || createAbsenceRequest.isPending}>
            {createAbsenceRequest.isPending ? '신청 중' : '신청'}
          </button>
        </form>
        <section className="mobile-alerts">
          <h2>확인할 것</h2>
          {absenceRequestsQuery.data?.map((request) => (
            <article className="mobile-card alert-row" key={request.id}>
              <span className="danger">!</span>
              <div>
                <strong>결석 신청 {formatAbsenceStatus(request.status)}</strong>
                <p>{request.desiredResult === 'MAKEUP' ? '보강' : '다른 세션 이동'} · {request.reason}</p>
              </div>
              <button aria-label="상세 보기" type="button">›</button>
            </article>
          ))}
        </section>
        <section className="mobile-alerts">
          <h2>클래스노트</h2>
          <article className="mobile-card note-preview">
            <strong>5월 26일 보컬 그룹 A</strong>
            <p>호흡 유지와 8마디 프레이징을 반복 연습했습니다.</p>
            <span>다음 과제: 템포 72로 2절까지 녹음해오기</span>
          </article>
        </section>
        <section className="mobile-alerts">
          <h2>공지사항</h2>
          <article className="mobile-card note-preview">
            <strong>6월 휴원 안내</strong>
            <p>현충일 당일은 전체 수업을 휴강합니다.</p>
            <span>2026.05.28</span>
          </article>
        </section>
      </main>
      <nav className="bottom-tabs">
        {[
          ['⌂', '홈'],
          ['□', '일정'],
          ['▣', '수강권'],
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatAbsenceStatus(status: string) {
  if (status === 'APPROVED') return '승인';
  if (status === 'REJECTED') return '거절';
  return '승인 대기';
}
