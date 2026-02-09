export const PRIORITY_TAG = 'priority' as const;
export const DAILY_TAG = 'daily' as const;
export const ONE_TIME_TAG = 'one-time' as const;
export const OCCASIONAL_TAG = 'occasional' as const;
export const SCHEDULED_TAG = 'scheduled' as const;

export const EXCLUSIVE_TAGS = [
  DAILY_TAG,
  ONE_TIME_TAG,
  OCCASIONAL_TAG,
  SCHEDULED_TAG
] as const;

export const TAGS = [...EXCLUSIVE_TAGS, PRIORITY_TAG] as const;

export type Tag = typeof TAGS[number];
export type ExclusiveTag = typeof EXCLUSIVE_TAGS[number];

export function isExclusiveTag(tag: Tag): tag is ExclusiveTag {
  return (EXCLUSIVE_TAGS as readonly Tag[]).includes(tag);
}
