export const ITEMS_KEY = 'checklist-items';
export const ARCHIVED_KEY = 'archived-checklist-items';
export type PersistedChecklistKey =
  | typeof ITEMS_KEY
  | typeof ARCHIVED_KEY;
export const API_URL = 'https://demo-server-production-9fc2.up.railway.app/chore';
