import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAbsenceRequests, useCreateAbsenceRequest, type AbsenceDesiredResult } from '../../features/absence/api/absenceApi';
import { useClassNotes } from '../../features/class-note/api/classNoteApi';
import { useNotices } from '../../features/notice/api/noticeApi';
import { usePassUsageLogs, useStudentPasses } from '../../features/pass/api/passApi';
import { getPassLifecycleDisplay, selectPrimaryPass } from '../../features/pass/model/passLifecycle';
import { useSchedules } from '../../features/schedule/api/scheduleApi';
import { useStudents } from '../../features/student/api/studentApi';
import type { AcademyBrand } from '../../features/academy-settings/model/academyBrand';
import type { AcademySettings } from '../../features/academy-settings/model/settingsTypes';

type StudentAppTab = 'home' | 'schedule' | 'pass' | 'notes' | 'profile';

export function StudentHomePage({ brand, featureSettings }: { brand: AcademyBrand; featureSettings?: AcademySettings }) {
  const today = new Date();
  const schedulesQuery = useSchedules(formatDateInput(today), formatDateInput(addDays(today, 6)));
  const studentsQuery = useStudents();
  const student = studentsQuery.data?.[0];
  const assignedSessions = (schedulesQuery.data ?? []).filter((session) => !student || session.assignedStudentIds.includes(student.id));
  const nextSession = assignedSessions[0];
  const studentPassesQuery = useStudentPasses(student?.id);
  const activePass = selectPrimaryPass(studentPassesQuery.data);
  const activePassDisplay = getPassLifecycleDisplay(activePass?.lifecycleStatus, activePass?.expirationReason);
  const passUsageLogsQuery = usePassUsageLogs(activePass?.id);
  const classNotesQuery = useClassNotes();
  const noticesQuery = useNotices();
  const absenceRequestsQuery = useAbsenceRequests(student?.id);
  const createAbsenceRequest = useCreateAbsenceRequest(student?.id);
  const [activeTab, setActiveTab] = useState<StudentAppTab>('home');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [desiredResult, setDesiredResult] = useState<AbsenceDesiredResult>('MAKEUP');
  const selectedSession = assignedSessions.find((session) => session.id === selectedSessionId) ?? nextSession;
  const passEnabled = featureSettings?.studentPassEnabled !== false;
  const notesEnabled = featureSettings?.studentClassNotesEnabled !== false;
  const absenceEnabled = featureSettings?.studentAbsenceRequestEnabled !== false;
  const noticeEnabled = featureSettings?.ownerNoticesEnabled !== false;
  const tabs: Array<[string, string, StudentAppTab]> = [
    ['⌂', '홈', 'home'],
    ['□', '일정', 'schedule'],
    ...(passEnabled ? [['▣', '수강권', 'pass'] as [string, string, StudentAppTab]] : []),
    ['♙', '내 정보', 'profile'],
  ];

  useEffect(() => {
    if ((activeTab === 'pass' && !passEnabled) || (activeTab === 'notes' && !notesEnabled)) {
      setActiveTab('home');
    }
  }, [activeTab, notesEnabled, passEnabled]);

  const handleAbsenceRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!student || !selectedSession) {
      return;
    }

    createAbsenceRequest.mutate(
      {
        studentId: student.id,
        sessionId: selectedSession.id,
        reason,
        desiredResult,
      },
      {
        onSuccess: () => setReason(''),
      },
    );
  };

  return (
    <section className="mobile-page" style={brand.style}>
      <div className="status-bar">
        <strong>9:41</strong>
        <span>♢ 100%</span>
      </div>
      <header className="mobile-header">
        <div className="mobile-brand">
          <span>{brand.logoUrl ? <img alt="" src={brand.logoUrl} /> : brand.initials}</span>
          <strong>{brand.name}</strong>
        </div>
        <div className="mobile-actions">
          <button aria-label="알림" type="button">♢</button>
          <i>김</i>
        </div>
      </header>
      <main className="mobile-content">
        {activeTab === 'home' && (
          <>
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
                ['□', '내 일정', 'brand', 'schedule'],
                ...(absenceEnabled ? [['!', '결석 신청', 'warning', 'schedule']] : []),
                ...(passEnabled ? [['▭', '수강권', 'success', 'pass']] : []),
                ...(notesEnabled ? [['✎', '노트', 'danger', 'notes']] : []),
              ].map(([icon, label, tone, tab]) => (
                <button key={label} type="button" onClick={() => setActiveTab(tab as StudentAppTab)}>
                  <span className={tone}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <section className="mobile-alerts">
              <h2>확인할 것</h2>
              {passEnabled && (
                <article className="mobile-card alert-row">
                  <span className="success">▭</span>
                  <div>
                    <strong>{activePass ? `잔여 ${activePass.remainingCount}회` : '수강권 미발급'}</strong>
                    <p>{activePass ? `${activePassDisplay.label} · ${formatDate(activePass.expiresOn)} 만료` : '원장이 수강권을 발급하면 표시됩니다.'}</p>
                  </div>
                  <button aria-label="상세 보기" type="button" onClick={() => setActiveTab('pass')}>›</button>
                </article>
              )}
              {absenceEnabled && absenceRequestsQuery.data?.slice(0, 2).map((request) => (
                <article className="mobile-card alert-row" key={request.id}>
                  <span className="danger">!</span>
                  <div>
                    <strong>결석 신청 {formatAbsenceStatus(request.status)}</strong>
                    <p>{request.desiredResult === 'MAKEUP' ? '보강' : '다른 세션 이동'} · {request.reason}</p>
                  </div>
                  <button aria-label="상세 보기" type="button" onClick={() => setActiveTab('schedule')}>›</button>
                </article>
              ))}
            </section>
            {noticeEnabled && <section className="mobile-alerts">
              <h2>공지사항</h2>
              {noticesQuery.data?.slice(0, 3).map((notice) => (
                <article className="mobile-card note-preview" key={notice.id}>
                  <strong>{notice.title}</strong>
                  <p>{notice.body}</p>
                  <span>{formatDate(notice.createdAt)}</span>
                </article>
              ))}
            </section>}
          </>
        )}

        {activeTab === 'schedule' && (
          <>
            <article className="mobile-card today-classes">
              <header>
                <div>
                  <h1>내 일정</h1>
                  <p>배정된 수업과 결석 신청 상태</p>
                </div>
              </header>
              {assignedSessions.map((session, index) => (
                <button
                  className="mobile-class-row"
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <strong>{formatShortDate(session.startsAt)}</strong>
                  <i className={selectedSession?.id === session.id || (!selectedSessionId && index === 0) ? 'live' : undefined} />
                  <span>{formatTime(session.startsAt)} {session.title}</span>
                  <em className={index === 0 ? 'live' : undefined}>{index === 0 ? '예정' : '대기'}</em>
                </button>
              ))}
            </article>
            {selectedSession && (
              <article className="mobile-card note-preview">
                <strong>{selectedSession.title}</strong>
                <p>{formatDate(selectedSession.startsAt)} {formatTime(selectedSession.startsAt)} - {formatTime(selectedSession.endsAt)}</p>
                <span>{selectedSession.type === 'GROUP' ? '그룹' : '1:1'} · {selectedSession.currentCapacity}/{selectedSession.maximumCapacity}명</span>
              </article>
            )}
            {absenceEnabled && (
              <>
                <form className="mobile-card absence-request-form" onSubmit={handleAbsenceRequest}>
                  <h2>결석 신청</h2>
                  <input
                    required
                    placeholder="사유"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    disabled={!student || !selectedSession}
                  />
                  <select value={desiredResult} onChange={(event) => setDesiredResult(event.target.value as AbsenceDesiredResult)}>
                    <option value="MAKEUP">보강</option>
                    <option value="MOVE_TO_OTHER_SESSION">다른 세션 이동</option>
                  </select>
                  <button type="submit" disabled={!student || !selectedSession || createAbsenceRequest.isPending}>
                    {createAbsenceRequest.isPending ? '신청 중' : '신청'}
                  </button>
                </form>
                <section className="mobile-alerts">
                  <h2>신청 상태</h2>
                  {absenceRequestsQuery.data?.map((request) => (
                    <article className="mobile-card alert-row" key={request.id}>
                      <span className="danger">!</span>
                      <div>
                        <strong>결석 신청 {formatAbsenceStatus(request.status)}</strong>
                        <p>{request.desiredResult === 'MAKEUP' ? '보강' : '다른 세션 이동'} · {request.reason}</p>
                      </div>
                    </article>
                  ))}
                </section>
              </>
            )}
          </>
        )}

        {activeTab === 'pass' && passEnabled && (
          <section className="mobile-alerts">
            <h2>내 수강권</h2>
            <article className="mobile-card alert-row">
              <span className="success">▭</span>
              <div>
                <strong>{activePass ? `잔여 ${activePass.remainingCount}/${activePass.totalCount}회` : '수강권 미발급'}</strong>
                <p>{activePass ? `${activePassDisplay.label} · ${activePassDisplay.reasonLabel} · ${formatDate(activePass.issuedOn)} 발급 · ${formatDate(activePass.expiresOn)} 만료` : '원장이 수강권을 발급하면 표시됩니다.'}</p>
              </div>
            </article>
            {passUsageLogsQuery.data?.map((log) => (
              <article className="mobile-card note-preview" key={log.id}>
                <strong>{log.type === 'CONSUME' ? '차감' : '복구'} {log.count}회</strong>
                <p>{log.reason}</p>
                <span>{formatDate(log.createdAt)}</span>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'notes' && notesEnabled && (
          <section className="mobile-alerts">
            <h2>클래스노트</h2>
            {classNotesQuery.data?.map((note) => (
              <article className="mobile-card note-preview" key={note.id}>
                <strong>{formatDate(note.createdAt)}</strong>
                <p>{note.feedback}</p>
                <span>다음 과제: {note.nextAssignment || '없음'}</span>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="mobile-alerts">
            <h2>내 정보</h2>
            <article className="mobile-card note-preview">
              <strong>{student?.name ?? '수강생'}</strong>
              <p>{student?.phone ?? '연락처 미등록'}</p>
              <span>{student?.tags.join(', ') || '태그 없음'}</span>
            </article>
          </section>
        )}
      </main>
      <nav className="bottom-tabs">
        {tabs.map(([icon, label, tab]) => (
          <button className={activeTab === tab ? 'active' : undefined} key={label} type="button" onClick={() => setActiveTab(tab as StudentAppTab)}>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function formatAbsenceStatus(status: string) {
  if (status === 'APPROVED') return '승인';
  if (status === 'REJECTED') return '거절';
  return '승인 대기';
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);

  return date;
}

function formatDateInput(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
