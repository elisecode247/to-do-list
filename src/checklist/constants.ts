export const PRIORITY_TAG = 'priority';
export const TAGS = ['daily', 'one-time', 'occasional', PRIORITY_TAG];
export const EXCLUSIVE_TAGS = ['daily', 'one-time', 'occasional'] as const;
export type Tag = typeof TAGS[number];
export type ExclusiveTag = typeof EXCLUSIVE_TAGS[number];

