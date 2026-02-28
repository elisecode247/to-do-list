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

export type GoogleEvent = Event & {
    itemType: string;
}

export type GoogleTask = {
    itemType: string;
    id: string;
    title: string;
    status: string;
    due: string | null;
    lastCompleted: string | null;
    listId: string;
    note: string;
    isHidden: boolean;
    text: string;
    done: boolean;
}
