import { useMemo } from 'react';
import { createAcademyBrand } from '../model/academyBrand';
import { useAcademySettings } from './settingsApi';

export function useAcademyBrand() {
  const settingsQuery = useAcademySettings();
  const brand = useMemo(() => createAcademyBrand(settingsQuery.data), [settingsQuery.data]);

  return {
    brand,
    settingsQuery,
  };
}
