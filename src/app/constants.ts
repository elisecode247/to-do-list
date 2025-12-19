export const ITEMS_KEY = 'checklist-items';
export const ARCHIVED_KEY = 'archived-checklist-items';
export type PersistedChecklistKey =
  | typeof ITEMS_KEY
  | typeof ARCHIVED_KEY;
