export type Task = {
    isHidden: boolean;
    id: string;
    text: string;
    done: boolean;
    lastCompleted: string | null;
    note: string;
    sortOrder: 0;
    category: string;
    tags: string[];
    isArchived: boolean;
    hasSubChores: boolean;
    parentUuid: null;
    listId: string;
    due: string;
};

export type Event = {
    id: string;
    start: string;
    end: string;
    title: string;
    status: string;
    allDay: boolean;
    note?: string;
    location?: string;
};
