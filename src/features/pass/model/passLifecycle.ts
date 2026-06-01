import type { PassExpirationReason, PassLifecycleStatus, StudentPass } from '../api/passApi';

type PassLifecycleDisplay = {
  label: string;
  reasonLabel: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
};

export function getPassLifecycleDisplay(status?: PassLifecycleStatus | null, reason?: PassExpirationReason | null): PassLifecycleDisplay {
  if (status === 'USED_UP') {
    return { label: '회차 소진', reasonLabel: '남은 회차 없음', tone: 'danger' };
  }

  if (status === 'EXPIRED') {
    return { label: '기간 만료', reasonLabel: '유효기간 종료', tone: 'danger' };
  }

  if (status === 'EXPIRING_SOON') {
    return {
      label: reason === 'COUNT_LOW' ? '소진 임박' : '만료 임박',
      reasonLabel: reason === 'COUNT_LOW' ? '잔여 1-2회' : '7일 이내 만료',
      tone: 'warning',
    };
  }

  if (status === 'ACTIVE') {
    return { label: '정상', reasonLabel: '사용 가능', tone: 'success' };
  }

  return { label: '미발급', reasonLabel: '수강권 없음', tone: 'neutral' };
}

export function selectPrimaryPass(passes: StudentPass[] | undefined) {
  return passes?.[0];
}
