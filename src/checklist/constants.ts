export const DAILY_MODE = 'daily' as const;
export const ONE_TIME_MODE = 'one-time' as const;
export const OCCASIONAL_MODE = 'occasional' as const;
export const SCHEDULED_MODE = 'scheduled' as const;
export const ALL_MODES = 'all' as const;

export const MODES = [
  DAILY_MODE,
  ONE_TIME_MODE,
  OCCASIONAL_MODE,
  SCHEDULED_MODE
] as const;
