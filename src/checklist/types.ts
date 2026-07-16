import type { ChecklistItem } from 'src/app/types';
import type { GoogleEvent } from 'src/google-authorization/types';
import { type Tab } from 'src/app-toolbar/tabs/types';
import { type Mode } from 'src/app/types';
import type { ALL_MODES } from './constants';
import type { ReactElement } from 'react';

export interface ChecklistProps {
    checklistType?: 'task' | 'template' | 'search-results';
    controller: ChecklistController;
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    clearFilters: () => void;
    onEditItem: (item: ChecklistItem) => void;
    onEditEvent?: (item: GoogleEvent) => void;
    expandedNoteItemIds?: ReadonlySet<string>;
    sparkles?: ReactElement;
    enablePullToRefresh?: boolean;
}

export interface ChecklistController {
    isLoading: boolean;
    items: ChecklistItem[];
    addItem?: (item: ChecklistItem) => Promise<void> | void;
    events?: GoogleEvent[];
    partialUpdateItem: (item: Partial<ChecklistItem>) => Promise<void> | void;
    deleteItem: (id: string) => Promise<void> | void;
    toggleItem: (id: string, checked: boolean) => Promise<void> | void;
    prioritizeItem: (id: string) => Promise<void> | void;
    archiveItem: (id: string) => Promise<void> | void;
    sortItems: (
        filteredItems: ChecklistItem[],
        activeTab: Tab,
        activeId: string,
        overId: string
    ) => Promise<void> | void;
    getSubtasks: (parentId: string) => ChecklistItem[];
    hideForToday: (id: string) => Promise<void> | void;
    unhideForToday: (id: string) => Promise<void> | void;
    loadTasks: (cancelled?: boolean) => void;
    hideEventForToday: (id: string) => Promise<void> | void;
    unhideEventForToday: (id: string) => Promise<void> | void;
    expandedNoteItemIds?: ReadonlySet<string>;
}
