import { AcademySettingsForm } from '../../features/academy-settings/ui/AcademySettingsForm';

export function OwnerSettingsPage() {
  return (
    <section className="page-stack settings-page">
      <header className="settings-hero">
        <h2>설정</h2>
        <p>학원 정보 · 알림 · 결제 · 브랜드 등을 관리합니다</p>
      </header>
      <AcademySettingsForm />
    </section>
  );
}
