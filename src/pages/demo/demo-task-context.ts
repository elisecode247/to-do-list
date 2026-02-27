import { createContext } from 'react';
import type { ChecklistItem } from 'app/types';

export interface TaskContextType {
    items: ChecklistItem[];
    isLoading: boolean;
    error: string | null;
    loadTasks: () => void;
    addItem: (newItem: ChecklistItem) => Promise<void>;
    updateItem: (item: ChecklistItem) => Promise<void>;
    deleteItem: (id: string) => void;
    toggleItem: (id: string, checked: boolean) => void;
    prioritizeItem: (id: string) => void;
    archiveItem: (id: string) => void;
    sortItems: (activeId: string, overId: string) => void;
    reset: () => void;
    getSubtasks: (parentId: string) => ChecklistItem[];
    hideForToday: (id: string) => void;
    unhideForToday: (id: string) => void;
}

export const DemoTaskContext = createContext<TaskContextType | undefined>(undefined);


