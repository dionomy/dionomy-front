const steps = [
  '학원 정보 입력',
  '화이트라벨 설정',
  '원장 계정 발급',
  '빌드 트리거',
];

export function TenantOnboardingPanel() {
  return (
    <article className="panel">
      <h2>신규 학원 온보딩</h2>
      <ol className="step-list">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
