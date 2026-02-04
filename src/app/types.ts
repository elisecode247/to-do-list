import type { UniqueIdentifier } from '@dnd-kit/core';

export interface ChecklistItem {
    isHidden?: boolean;
    id: UniqueIdentifier;
    text: string;
    done: boolean;
    lastCompleted: string;
    note: string;
    sortOrder: number;
    category: string;
    tags: string[];
    isArchived: boolean;
    hasSubChores: boolean;
    parentUuid: UniqueIdentifier | null;
}
