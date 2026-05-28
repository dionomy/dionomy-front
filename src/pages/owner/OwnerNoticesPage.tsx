import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useNotices } from '../../features/notice/api/noticeApi';

export function OwnerNoticesPage() {
  const noticesQuery = useNotices();
  const notices = noticesQuery.data ?? [];

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
        <section className="panel notice-editor">
          <div className="panel-heading">
            <div>
              <h2>새 공지</h2>
              <p>제목, 본문, 이미지, 발송 대상을 설정</p>
            </div>
          </div>
          <label>
            <span>제목</span>
            <input defaultValue="6월 정규반 일정 안내" />
          </label>
          <label>
            <span>본문</span>
            <textarea defaultValue="6월 정규반 일정과 보강 가능 시간을 안내드립니다." />
          </label>
          <div className="notice-options">
            <button className="active" type="button">전체</button>
            <button type="button">특정 클래스</button>
          </div>
          <button className="primary-button" type="button">발송</button>
        </section>

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
