import { type Tab } from "src/checklist/tabs/types";
export type Mode = 'one-time' | 'daily' | 'occasional' | 'scheduled';
export interface ChecklistItem {
    isHidden: boolean;
    id: string;
    text: string;
    done: boolean;
    lastCompleted: string;
    note: string;
    sortOrder: number;
    tabSortOrder: { [tabName: string]: number };
    category: string;
    categoryUuid: number | null;
    mode: Mode;
    isPriority: boolean;
    isArchived: boolean;
    hasSubChores: boolean;
    parentUuid: string | null;
    /** google properties */
    due?: string;
    listId?: string;
}

export type FilterParams = {
    items: ChecklistItem[];
    activeFilters: Mode[];
    activeTab: Tab;
    hideCompleted: boolean;
    filterCategory: string;
};
export interface TaskContextType {
    items: ChecklistItem[];
    isLoading: boolean;
    error: string | null;
    loadTasks: (cancelled?: boolean) => void;
    addItem: (newItem: ChecklistItem) => Promise<void>;
    updateItem: (item: ChecklistItem) => Promise<void>;
    deleteItem: (id: string) => void;
    toggleItem: (id: string, checked: boolean) => void;
    prioritizeItem: (id: string) => void;
    archiveItem: (id: string) => void;
    sortItems: (filteredItems: ChecklistItem[], activeTab: Tab, activeId: string, overId: string) => void;
    reset: () => void;
    getSubtasks: (parentId: string) => ChecklistItem[];
    hideForToday: (id: string) => void;
    unhideForToday: (id: string) => void;
}
