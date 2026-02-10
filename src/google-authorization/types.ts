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
