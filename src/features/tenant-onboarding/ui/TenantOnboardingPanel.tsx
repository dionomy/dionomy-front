import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorState } from '../../../shared/ui/AsyncState';
import { useCreateTenantSetup } from '../api/tenantSetupApi';

const steps = [
  '학원 정보 입력',
  '화이트라벨 설정',
  '원장 계정 발급',
  '빌드 트리거',
];

export function TenantOnboardingPanel() {
  const createTenantSetup = useCreateTenantSetup();
  const [form, setForm] = useState({
    academyName: '',
    ownerContact: '',
    mainColor: '#635bff',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTenantSetup.mutate(form, {
      onSuccess: () => setForm({ academyName: '', ownerContact: '', mainColor: '#635bff' }),
    });
  };

  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <h2>신규 학원 온보딩</h2>
          <p>화이트라벨 설정과 빌드 트리거</p>
        </div>
      </div>
      <ol className="step-list">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <form className="tenant-setup-form" onSubmit={handleSubmit}>
        <input
          required
          placeholder="학원명"
          value={form.academyName}
          onChange={(event) => setForm({ ...form, academyName: event.target.value })}
        />
        <input
          required
          placeholder="원장 연락처"
          value={form.ownerContact}
          onChange={(event) => setForm({ ...form, ownerContact: event.target.value })}
        />
        <input
          required
          type="color"
          value={form.mainColor}
          onChange={(event) => setForm({ ...form, mainColor: event.target.value })}
        />
        {createTenantSetup.isError && <ErrorState message="온보딩 등록에 실패했습니다." />}
        <button className="primary-button compact" type="submit" disabled={createTenantSetup.isPending}>
          {createTenantSetup.isPending ? '등록 중' : '온보딩 등록'}
        </button>
      </form>
    </article>
  );
}
