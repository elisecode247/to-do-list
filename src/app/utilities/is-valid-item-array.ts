import type { ChecklistItem } from '../types.ts';

export function isChecklistItemArray(data: unknown): data is ChecklistItem[] {
  return Array.isArray(data) &&
    data.every(
      item =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'text' in item &&
        'done' in item
    );
}
