import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState, EmptyState, LoadingState } from '../../shared/ui/AsyncState';
import { useRegisterStudent, useStudents } from '../../features/student/api/studentApi';
import { useCreatePassProduct, useIssueStudentPass, usePassProducts, useStudentPasses } from '../../features/pass/api/passApi';

const usageLogs = [
  { student: '정서윤', type: '차감', count: 1, reason: '5월 26일 출석', time: '2026.05.26 20:12' },
  { student: '이하린', type: '복구', count: 1, reason: '강사 승인 보강 처리', time: '2026.05.25 15:30' },
  { student: '박민재', type: '차감', count: 1, reason: '5월 25일 출석', time: '2026.05.25 21:02' },
] as const;

export function OwnerStudentsPage() {
  const studentsQuery = useStudents();
  const registerStudent = useRegisterStudent();
  const passProductsQuery = usePassProducts();
  const createPassProduct = useCreatePassProduct();
  const issueStudentPass = useIssueStudentPass();
  const students = studentsQuery.data ?? [];
  const selectedStudent = students[0];
  const studentPassesQuery = useStudentPasses(selectedStudent?.id);
  const activeStudentPass = studentPassesQuery.data?.[0];
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
          <strong>{students.length}</strong>
          <em className="trend-pill success">실시간</em>
        </article>
        <article className="metric-card">
          <span>만료 임박</span>
          <strong>준비중</strong>
          <em className="trend-pill warning">수강권 연동 예정</em>
        </article>
        <article className="metric-card">
          <span>회차 소진 임박</span>
          <strong>준비중</strong>
          <em className="trend-pill danger">수강권 연동 예정</em>
        </article>
      </div>

      <div className="students-layout">
        <section className="panel student-list-panel">
          <div className="panel-heading">
            <div>
              <h2>수강생 목록</h2>
              <p>검색과 태그 필터 대상</p>
            </div>
            <button type="button">전체 보기</button>
          </div>
          <div className="student-table">
            {studentsQuery.isPending && <LoadingState message="수강생을 불러오는 중입니다." />}
            {studentsQuery.isError && <ErrorState message="수강생을 불러오지 못했습니다." />}
            {studentsQuery.isSuccess && students.length === 0 && <EmptyState message="등록된 수강생이 없습니다." />}
            {students.map((student) => (
              <article className="student-row-card" key={student.id}>
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
                  <strong>수강권 미발급</strong>
                  <span>{formatDate(student.createdAt)} 등록</span>
                </div>
                <span className="status-pill">정상</span>
              </article>
            ))}
          </div>
        </section>

        <aside className="student-detail-panel">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>{selectedStudent ? `${selectedStudent.name} 상세` : '수강생 상세'}</h2>
                <p>수강권, 최근 수업, 메모</p>
              </div>
            </div>
            <div className="student-detail-stack">
              <div className="pass-progress">
                <div>
                  <span>수강권 잔여</span>
                  <strong>{activeStudentPass ? `${activeStudentPass.remainingCount}회` : '미발급'}</strong>
                </div>
                <progress value={activeStudentPass?.usedCount ?? 0} max={activeStudentPass?.totalCount ?? 1} />
                <small>{activeStudentPass ? `${formatDate(activeStudentPass.expiresOn)} 만료` : '수강권을 발급하세요'}</small>
              </div>
              <dl className="detail-list">
                <div>
                  <dt>최근 수업</dt>
                  <dd>일정 배정 API 연동 예정</dd>
                </div>
                <div>
                  <dt>메모</dt>
                  <dd>{selectedStudent?.memo ?? '메모 없음'}</dd>
                </div>
              </dl>
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
        <div className="usage-log-list">
          {usageLogs.map((log) => (
            <article key={`${log.student}-${log.time}`}>
              <span className={log.type === '차감' ? 'log-badge consume' : 'log-badge restore'}>{log.type}</span>
              <strong>{log.student}</strong>
              <span>{log.count}회 · {log.reason}</span>
              <time>{log.time}</time>
            </article>
          ))}
        </div>
      </section>
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}
