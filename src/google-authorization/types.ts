export type Task = {
    id: string;
    title: string;
    notes: string;
    status: string;
    due: string | null;
    completed: string | null;
    listName: string;
};

export type Event = {
    id: string;
    start: string;
    end: string;
    title: string;
    status: string;
    allDay: boolean;
    description?: string;
    location?: string;
};
