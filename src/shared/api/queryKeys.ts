export const queryKeys = {
  academySettings: ['academy-settings'] as const,
  students: ['students'] as const,
  passProducts: ['pass-products'] as const,
  studentPasses: (studentId: string | undefined) => ['student-passes', studentId] as const,
  schedules: (from: string, to: string) => ['schedules', from, to] as const,
  notices: ['notices'] as const,
};
