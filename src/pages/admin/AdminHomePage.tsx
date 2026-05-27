import { TenantOnboardingPanel } from '../../features/tenant-onboarding/ui/TenantOnboardingPanel';

export function AdminHomePage() {
  return (
    <section className="page-stack">
      <header>
        <p className="eyebrow">Dionomy 관리자</p>
        <h1>학원 세팅 대기열</h1>
      </header>
      <TenantOnboardingPanel />
    </section>
  );
}
