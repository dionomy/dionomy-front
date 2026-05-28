import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useCreateNotice, useNotices, type Notice } from '../../features/notice/api/noticeApi';

export function OwnerNoticesPage() {
  const noticesQuery = useNotices();
  const createNotice = useCreateNotice();
  const notices = noticesQuery.data ?? [];
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    body: '',
    target: 'ALL' as Notice['target'],
  });

  const handleCreateNotice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createNotice.mutate(
      {
        title: noticeForm.title,
        body: noticeForm.body,
        imageUrl: null,
        target: noticeForm.target,
        classId: null,
      },
      {
        onSuccess: () => {
          setNoticeForm({ title: '', body: '', target: 'ALL' });
        },
      },
    );
  };

  return (
    <section className="page-stack notices-page">
      <header className="page-hero">
        <div>
          <h2>공지사항</h2>
          <p>전체 또는 특정 클래스 수강생에게 발송할 공지를 작성합니다.</p>
        </div>
        <button className="primary-button" type="button">＋ 공지 작성</button>
      </header>

      <div className="notices-layout">
        <form className="panel notice-editor" onSubmit={handleCreateNotice}>
          <div className="panel-heading">
            <div>
              <h2>새 공지</h2>
              <p>제목, 본문, 이미지, 발송 대상을 설정</p>
            </div>
          </div>
          <label>
            <span>제목</span>
            <input
              required
              value={noticeForm.title}
              onChange={(event) => setNoticeForm({ ...noticeForm, title: event.target.value })}
            />
          </label>
          <label>
            <span>본문</span>
            <textarea
              required
              value={noticeForm.body}
              onChange={(event) => setNoticeForm({ ...noticeForm, body: event.target.value })}
            />
          </label>
          <div className="notice-options">
            <button
              className={noticeForm.target === 'ALL' ? 'active' : undefined}
              type="button"
              onClick={() => setNoticeForm({ ...noticeForm, target: 'ALL' })}
            >
              전체
            </button>
            <button
              className={noticeForm.target === 'CLASS' ? 'active' : undefined}
              type="button"
              onClick={() => setNoticeForm({ ...noticeForm, target: 'CLASS' })}
              disabled
            >
              특정 클래스
            </button>
          </div>
          {createNotice.isError && <ErrorState message="공지 발송에 실패했습니다." />}
          <button className="primary-button" type="submit" disabled={createNotice.isPending}>
            {createNotice.isPending ? '발송 중' : '발송'}
          </button>
        </form>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>발송 내역</h2>
              <p>앱 공지 목록에 노출</p>
            </div>
          </div>
          <div className="notice-list">
            {noticesQuery.isPending && <LoadingState message="공지사항을 불러오는 중입니다." />}
            {noticesQuery.isError && <ErrorState message="공지사항을 불러오지 못했습니다." />}
            {noticesQuery.isSuccess && notices.length === 0 && <EmptyState message="등록된 공지사항이 없습니다." />}
            {notices.map((notice) => (
              <article key={notice.id}>
                <div>
                  <strong>{notice.title}</strong>
                  <span>{notice.target === 'ALL' ? '전체' : '특정 클래스'} · {formatDate(notice.createdAt)}</span>
                </div>
                <p>{notice.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
