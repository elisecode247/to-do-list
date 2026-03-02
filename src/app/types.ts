import type { Ref } from "react";
import { type Tab } from "src/app-toolbar/tabs/types";
import { ALL_MODES } from "src/checklist/constants";

export type Mode = 'one-time' | 'daily' | 'occasional' | 'calendar';

export const EndingConditionType = {
    None: 'none',
    EndDate: 'end_date',
    OccurrencesNumber: 'occurrences_number'
} as const;

export type EndingConditionType = typeof EndingConditionType[keyof typeof EndingConditionType];

export const FrequencyType = {
    None: 'none',
    Daily: 'daily',
    Weekly: 'weekly',
    Monthly: 'monthly',
    Annually: 'annually'
} as const;

export const IntervalOptions: Option[] = [
    { key: FrequencyType.Daily, title: 'Day' },
    { key: FrequencyType.Weekly, title: 'Week' },
    { key: FrequencyType.Monthly, title: 'Month' },
    { key: FrequencyType.Annually, title: 'Year' },
];

export type FrequencyType = typeof FrequencyType[keyof typeof FrequencyType];

export interface RecurrenceDay {
    key: number
    title: string
    symbol: string
}

export interface Option {
    key: string
    title: string
}

export type OneTimeRecurrence = {
    type: "one-time";
    dueAt: string;
    startDate: string;
}
export type IntervalRecurrence = {
    type: "interval";
    count: number;
    frequency: FrequencyType;
    startDate: string;
}

export type CalendarRecurrence = {
    type: "calendar";
    startDate: Date
    frequency: FrequencyType
    numberOfRepetitions?: number
    weekDaysRepetition: Array<number>
    endingCondition: EndingConditionType
    endingOccurrencesNumber?: number
    endDate?: Date
    isAllDay: boolean
    startTime?: Date
    endTime?: Date
}

export interface ChecklistItem {
    itemType: string;
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
    recurrence: IntervalRecurrence | CalendarRecurrence | OneTimeRecurrence | null;
    nextDue: string | null;
    /** google properties */
    due?: string;
    listId?: string;
}

export type FilterParams = {
    items: ChecklistItem[];
    modeFilter: Mode | typeof ALL_MODES;
    activeTab: Tab;
    hideCompleted: boolean;
    filterCategory: string;
};
export interface TaskContextType {
    items: ChecklistItem[];
    isLoading: boolean;
    taskError: string | null;
    loadTasks: (cancelled?: boolean) => void;
    addItem: (newItem: ChecklistItem) => Promise<void>;
    updateItem: (item: ChecklistItem) => Promise<void>;
    bulkUpdate: (items: ChecklistItem[]) => Promise<void>;
    deleteItem: (id: string) => void;
    toggleItem: (id: string, checked: boolean) => void;
    prioritizeItem: (id: string) => void;
    archiveItem: (id: string) => void;
    sortItems: (filteredItems: ChecklistItem[], activeTab: Tab, activeId: string, overId: string) => void;
    reset: () => void;
    getSubtasks: (parentId: string) => ChecklistItem[];
    hideForToday: (id: string) => void;
    unhideForToday: (id: string) => void;
    loadDate: Ref<Date | null>;
}

export type ApiRecurrence =
    | OneTimeRecurrence
    | IntervalRecurrence
    | CalendarRecurrence;
