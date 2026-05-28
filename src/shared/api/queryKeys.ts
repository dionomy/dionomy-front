export const queryKeys = {
  academySettings: ['academy-settings'] as const,
  students: ['students'] as const,
  schedules: (from: string, to: string) => ['schedules', from, to] as const,
  notices: ['notices'] as const,
};
