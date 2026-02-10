export interface ChecklistItem {
    isHidden: boolean;
    id: string;
    text: string;
    done: boolean;
    lastCompleted: string;
    note: string;
    sortOrder: number;
    category: string;
    tags: string[];
    isArchived: boolean;
    hasSubChores: boolean;
    parentUuid: string | null;
    /** google properties */
    due?: string;
    listId?: string;
}
