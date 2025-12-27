import type { UniqueIdentifier } from '@dnd-kit/core';

export interface ChecklistItem {
    id: UniqueIdentifier;
    text: string;
    done: boolean;
    lastCompleted: string;
    note: string;
    sortOrder: number;
    tags: string[];
}
