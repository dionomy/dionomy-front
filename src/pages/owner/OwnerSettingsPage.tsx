import { AcademySettingsForm } from '../../features/academy-settings/ui/AcademySettingsForm';

export function OwnerSettingsPage() {
  return (
    <section className="page-stack">
      <header>
        <p className="eyebrow">학원 설정</p>
        <h1>화이트라벨과 운영 정책</h1>
      </header>
      <AcademySettingsForm />
    </section>
  );
}
