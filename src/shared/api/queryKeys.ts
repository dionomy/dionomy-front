export const queryKeys = {
  academySettings: ['academy-settings'] as const,
  students: ['students'] as const,
  passProducts: ['pass-products'] as const,
  studentPasses: (studentId: string | undefined) => ['student-passes', studentId] as const,
  passUsageLogs: (passId: string | undefined) => ['pass-usage-logs', passId] as const,
  schedules: (from: string, to: string) => ['schedules', from, to] as const,
  attendance: (sessionId: string | undefined) => ['attendance', sessionId] as const,
  absenceRequests: (studentId?: string) => ['absence-requests', studentId ?? 'all'] as const,
  notices: ['notices'] as const,
};
