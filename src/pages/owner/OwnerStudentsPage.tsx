import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useRegisterStudent, useStudentOperationSummary, useStudents } from '../../features/student/api/studentApi';
import {
  useCreatePassProduct,
  useIssueStudentPass,
  usePassProducts,
  usePassUsageLogs,
  useRecordPassUsage,
  useStudentPasses,
  type PassUsageType,
} from '../../features/pass/api/passApi';
import { getPassLifecycleDisplay, selectPrimaryPass } from '../../features/pass/model/passLifecycle';
import { useCareRecords, useCreateCareRecord, useRiskStudents, type CareRecordStatus } from '../../features/crm/api/crmApi';
import { useAcademySettings } from '../../features/academy-settings/api/settingsApi';

export function OwnerStudentsPage() {
  const settingsQuery = useAcademySettings();
  const studentsQuery = useStudents();
  const studentOperationSummaryQuery = useStudentOperationSummary();
  const registerStudent = useRegisterStudent();
  const passProductsQuery = usePassProducts();
  const createPassProduct = useCreatePassProduct();
  const issueStudentPass = useIssueStudentPass();
  const students = studentsQuery.data ?? [];
  const studentPassSummaryById = useMemo(
    () => new Map(studentOperationSummaryQuery.data?.students.map((summary) => [summary.studentId, summary]) ?? []),
    [studentOperationSummaryQuery.data],
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const allTags = useMemo(
    () => Array.from(new Set(students.flatMap((student) => student.tags))).sort((left, right) => left.localeCompare(right)),
    [students],
  );
  const filteredStudents = students.filter((student) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const searchMatched = !normalizedSearch || `${student.name} ${student.phone} ${student.memo ?? ''} ${student.tags.join(' ')}`.toLowerCase().includes(normalizedSearch);
    const tagMatched = selectedTag === 'all' || student.tags.includes(selectedTag);

    return searchMatched && tagMatched;
  });
  const selectedStudent = filteredStudents.find((student) => student.id === selectedStudentId) ?? filteredStudents[0] ?? students[0];
  const selectedPassSummary = selectedStudent ? studentPassSummaryById.get(selectedStudent.id) : undefined;
  const studentPassesQuery = useStudentPasses(selectedStudent?.id);
  const activeStudentPass = selectPrimaryPass(studentPassesQuery.data);
  const activePassDisplay = getPassLifecycleDisplay(activeStudentPass?.lifecycleStatus, activeStudentPass?.expirationReason);
  const usageLogsQuery = usePassUsageLogs(activeStudentPass?.id);
  const recordPassUsage = useRecordPassUsage(selectedStudent?.id, activeStudentPass?.id);
  const riskStudentsQuery = useRiskStudents();
  const careRecordsQuery = useCareRecords(selectedStudent?.id);
  const createCareRecord = useCreateCareRecord(selectedStudent?.id);
  const crmEnabled = settingsQuery.data?.crmEnabled !== false;
  const selectedRisk = riskStudentsQuery.data?.find((risk) => risk.studentId === selectedStudent?.id);
  const academyPrefix = window.location.pathname.match(/^\/academy\/(\d+)(?:\/|$)/)?.[0].replace(/\/$/, '') ?? '';
  const selectedStudentAppPath = selectedStudent ? `${academyPrefix}/student/${selectedStudent.id}` : '';
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    memo: '',
    tags: '',
  });
  const [productForm, setProductForm] = useState({
    name: '',
    totalCount: 4,
    validDays: 30,
    price: 0,
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [usageReason, setUsageReason] = useState('');
  const [careForm, setCareForm] = useState({
    memo: '',
    status: 'PENDING' as CareRecordStatus,
  });

  const handleRegisterStudent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerStudent.mutate(
      {
        name: studentForm.name,
        phone: studentForm.phone,
        memo: studentForm.memo || null,
        tags: studentForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setStudentForm({ name: '', phone: '', memo: '', tags: '' });
          setIsRegisterOpen(false);
        },
      },
    );
  };

  const handleCreatePassProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPassProduct.mutate(productForm, {
      onSuccess: () => {
        setProductForm({ name: '', totalCount: 4, validDays: 30, price: 0 });
        setIsProductOpen(false);
      },
    });
  };

  const handleIssueStudentPass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedStudent || !selectedProductId) {
      return;
    }

    issueStudentPass.mutate({
      studentId: selectedStudent.id,
      productId: selectedProductId,
      issuedOn: null,
    });
  };

  const handleRecordUsage = (type: PassUsageType) => {
    if (!activeStudentPass) {
      return;
    }

    recordPassUsage.mutate({
      type,
      request: {
        passId: activeStudentPass.id,
        count: 1,
        reason: usageReason || (type === 'CONSUME' ? '수동 차감' : '수동 복구'),
      },
    });
  };

  const handleCreateCareRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedStudent) {
      return;
    }

    createCareRecord.mutate(
      {
        studentId: selectedStudent.id,
        memo: careForm.memo,
        status: careForm.status,
      },
      {
        onSuccess: () => setCareForm({ memo: '', status: 'PENDING' }),
      },
    );
  };

  return (
    <section className="page-stack students-page">
      <header className="page-hero">
        <div>
          <h2>수강생 관리</h2>
          <p>등록, 수강권 발급, 차감/복구 이력을 한 화면에서 확인합니다.</p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" type="button" onClick={() => setIsProductOpen((value) => !value)}>
            수강권 상품
          </button>
          <button className="primary-button" type="button" onClick={() => setIsRegisterOpen((value) => !value)}>
            ＋ 수강생 등록
          </button>
        </div>
      </header>

      {isRegisterOpen && (
        <form className="panel inline-form-panel" onSubmit={handleRegisterStudent}>
          <div className="panel-heading">
            <div>
              <h2>수강생 등록</h2>
              <p>이름, 연락처, 메모, 태그를 입력합니다.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              이름 <b>*</b>
              <input
                required
                value={studentForm.name}
                onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
              />
            </label>
            <label>
              연락처 <b>*</b>
              <input
                required
                value={studentForm.phone}
                onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })}
              />
            </label>
            <label className="full">
              메모
              <input value={studentForm.memo} onChange={(event) => setStudentForm({ ...studentForm, memo: event.target.value })} />
            </label>
            <label className="full">
              태그
              <input
                placeholder="쉼표로 구분"
                value={studentForm.tags}
                onChange={(event) => setStudentForm({ ...studentForm, tags: event.target.value })}
              />
            </label>
          </div>
          {registerStudent.isError && <ErrorState message="수강생 등록에 실패했습니다." />}
          <div className="form-actions">
            <button type="button" onClick={() => setIsRegisterOpen(false)}>취소</button>
            <button className="primary-button compact" type="submit" disabled={registerStudent.isPending}>
              {registerStudent.isPending ? '등록 중' : '등록'}
            </button>
          </div>
        </form>
      )}

      {isProductOpen && (
        <form className="panel inline-form-panel" onSubmit={handleCreatePassProduct}>
          <div className="panel-heading">
            <div>
              <h2>수강권 상품 등록</h2>
              <p>회차, 유효기간, 가격을 입력합니다.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              상품명 <b>*</b>
              <input
                required
                value={productForm.name}
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              />
            </label>
            <label>
              회차 <b>*</b>
              <input
                min="1"
                required
                type="number"
                value={productForm.totalCount}
                onChange={(event) => setProductForm({ ...productForm, totalCount: Number(event.target.value) })}
              />
            </label>
            <label>
              유효기간 <b>*</b>
              <input
                min="1"
                required
                type="number"
                value={productForm.validDays}
                onChange={(event) => setProductForm({ ...productForm, validDays: Number(event.target.value) })}
              />
            </label>
            <label>
              가격
              <input
                min="0"
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })}
              />
            </label>
          </div>
          {createPassProduct.isError && <ErrorState message="수강권 상품 등록에 실패했습니다." />}
          <div className="form-actions">
            <button type="button" onClick={() => setIsProductOpen(false)}>취소</button>
            <button className="primary-button compact" type="submit" disabled={createPassProduct.isPending}>
              {createPassProduct.isPending ? '등록 중' : '등록'}
            </button>
          </div>
        </form>
      )}

      <div className="student-summary-grid">
        <article className="metric-card">
          <span>등록 수강생</span>
          <strong>{studentOperationSummaryQuery.data?.totalStudents ?? students.length}</strong>
          <em className="trend-pill success">실시간</em>
        </article>
        <article className="metric-card">
          <span>만료 임박</span>
          <strong>{studentOperationSummaryQuery.data?.passExpiringSoonCount ?? 0}명</strong>
          <em className="trend-pill warning">7일 이내</em>
        </article>
        <article className="metric-card">
          <span>회차 소진 임박</span>
          <strong>{studentOperationSummaryQuery.data?.passLowRemainingCount ?? 0}명</strong>
          <em className="trend-pill danger">1-2회 잔여</em>
        </article>
      </div>

      <div className="students-layout">
        <section className="panel student-list-panel">
          <div className="panel-heading">
            <div>
              <h2>수강생 목록</h2>
              <p>검색과 태그 필터</p>
            </div>
            <button type="button" onClick={() => {
              setSearchTerm('');
              setSelectedTag('all');
            }}>전체 보기</button>
          </div>
          <div className="pass-usage-actions">
            <input
              aria-label="수강생 검색"
              placeholder="이름, 연락처, 태그 검색"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select aria-label="태그 필터" value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
              <option value="all">전체 태그</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="student-table">
            {studentsQuery.isPending && <LoadingState message="수강생을 불러오는 중입니다." />}
            {studentsQuery.isError && <ErrorState message="수강생을 불러오지 못했습니다." />}
            {studentsQuery.isSuccess && students.length === 0 && <EmptyState message="등록된 수강생이 없습니다." />}
            {studentsQuery.isSuccess && students.length > 0 && filteredStudents.length === 0 && <EmptyState message="조건에 맞는 수강생이 없습니다." />}
            {filteredStudents.map((student) => {
              const passSummary = studentPassSummaryById.get(student.id);
              const passDisplay = getPassLifecycleDisplay(passSummary?.lifecycleStatus, passSummary?.expirationReason);

              return (
              <article
                className={selectedStudent?.id === student.id ? 'student-row-card active' : 'student-row-card'}
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
              >
                <div>
                  <strong>{student.name}</strong>
                  <span>{student.phone}</span>
                </div>
                <div className="student-tags">
                  {student.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </div>
                <div>
                  <strong>{passSummary?.remainingCount != null ? `잔여 ${passSummary.remainingCount}/${passSummary.totalCount}회` : '수강권 미발급'}</strong>
                  <span>{passSummary?.expiresOn ? `${formatDate(passSummary.expiresOn)} 만료` : `${formatDate(student.createdAt)} 등록`}</span>
                </div>
                <span className={`status-pill ${passDisplay.tone}`}>{passDisplay.label}</span>
              </article>
              );
            })}
          </div>
        </section>

        <aside className="student-detail-panel">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{selectedStudent ? `${selectedStudent.name} 상세` : '수강생 상세'}</h2>
                <p>수강권, 최근 수업, 메모</p>
              </div>
              {selectedStudent && <a className="student-app-link" href={selectedStudentAppPath}>앱 보기</a>}
            </div>
            <div className="student-detail-stack">
              <div className="pass-progress">
                <div>
                  <span>수강권 잔여</span>
                  <strong>{activeStudentPass ? `${activeStudentPass.remainingCount}회` : '미발급'}</strong>
                </div>
                <progress value={activeStudentPass?.usedCount ?? 0} max={activeStudentPass?.totalCount ?? 1} />
                <small>
                  {activeStudentPass ? `${activePassDisplay.label} · ${activePassDisplay.reasonLabel} · ${formatDate(activeStudentPass.expiresOn)} 만료` : '수강권을 발급하세요'}
                </small>
              </div>
              <dl className="detail-list">
                {crmEnabled && (
                <div>
                  <dt>위험 신호</dt>
                  <dd>{selectedRisk ? selectedRisk.signals.map((signal) => signal.label).join(', ') : '없음'}</dd>
                </div>
                )}
                <div>
                  <dt>최근 수업</dt>
                  <dd>{selectedPassSummary?.activePassId ? '수강권 기준 운영 상태 확인 중' : '수강권 미발급'}</dd>
                </div>
                <div>
                  <dt>메모</dt>
                  <dd>{selectedStudent?.memo ?? '메모 없음'}</dd>
                </div>
              </dl>
              {crmEnabled && (
                <>
                  <form className="care-record-form" onSubmit={handleCreateCareRecord}>
                    <select value={careForm.status} onChange={(event) => setCareForm({ ...careForm, status: event.target.value as CareRecordStatus })}>
                      <option value="PENDING">대기</option>
                      <option value="CONTACTED">연락함</option>
                      <option value="RENEWED">재등록</option>
                      <option value="DROPPED">포기</option>
                    </select>
                    <input
                      required
                      placeholder="케어 기록"
                      value={careForm.memo}
                      onChange={(event) => setCareForm({ ...careForm, memo: event.target.value })}
                      disabled={!selectedStudent}
                    />
                    <button type="submit" disabled={!selectedStudent || createCareRecord.isPending}>저장</button>
                  </form>
                  <div className="care-record-list">
                    {careRecordsQuery.data?.map((record) => (
                      <article key={record.id}>
                        <strong>{formatCareStatus(record.status)}</strong>
                        <span>{record.memo}</span>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>수강권 상품</h2>
                <p>회차 + 유효기간 + 가격</p>
              </div>
            </div>
            <div className="pass-product-list">
              {passProductsQuery.isPending && <LoadingState message="수강권 상품을 불러오는 중입니다." />}
              {passProductsQuery.isError && <ErrorState message="수강권 상품을 불러오지 못했습니다." />}
              {passProductsQuery.isSuccess && passProductsQuery.data.length === 0 && <EmptyState message="등록된 수강권 상품이 없습니다." />}
              {passProductsQuery.data?.map((product) => (
                <article key={product.id}>
                  <strong>{product.name}</strong>
                  <span>{product.totalCount}회 · {product.validDays}일</span>
                  <b>{formatCurrency(product.price)}</b>
                </article>
              ))}
            </div>
            <form className="pass-issue-form" onSubmit={handleIssueStudentPass}>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                disabled={!selectedStudent || !passProductsQuery.data?.length}
              >
                <option value="">발급할 상품 선택</option>
                {passProductsQuery.data?.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <button className="primary-button compact" type="submit" disabled={!selectedStudent || !selectedProductId || issueStudentPass.isPending}>
                {issueStudentPass.isPending ? '발급 중' : '발급'}
              </button>
            </form>
            {issueStudentPass.isError && <ErrorState message="수강권 발급에 실패했습니다." />}
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>수강권 사용 이력</h2>
            <p>출석 차감과 결석/보강 복구 로그</p>
          </div>
        </div>
        <div className="pass-usage-actions">
          <input
            placeholder="사유"
            value={usageReason}
            onChange={(event) => setUsageReason(event.target.value)}
            disabled={!activeStudentPass}
          />
          <button type="button" disabled={!activeStudentPass || recordPassUsage.isPending} onClick={() => handleRecordUsage('CONSUME')}>차감</button>
          <button type="button" disabled={!activeStudentPass || recordPassUsage.isPending} onClick={() => handleRecordUsage('RESTORE')}>복구</button>
        </div>
        <div className="usage-log-list">
          {usageLogsQuery.isPending && activeStudentPass && <LoadingState message="사용 이력을 불러오는 중입니다." />}
          {usageLogsQuery.isSuccess && usageLogsQuery.data.length === 0 && <EmptyState message="사용 이력이 없습니다." />}
          {usageLogsQuery.data?.map((log) => (
            <article key={log.id}>
              <span className={log.type === 'CONSUME' ? 'log-badge consume' : 'log-badge restore'}>{log.type === 'CONSUME' ? '차감' : '복구'}</span>
              <strong>{selectedStudent?.name ?? '수강생'}</strong>
              <span>{log.count}회 · {log.reason}</span>
              <time>{formatDate(log.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function formatCareStatus(status: CareRecordStatus) {
  if (status === 'CONTACTED') return '연락함';
  if (status === 'RENEWED') return '재등록';
  if (status === 'DROPPED') return '포기';
  return '대기';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}
