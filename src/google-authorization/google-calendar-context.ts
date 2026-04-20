import { createContext } from "react";
import { type GoogleEvent, type GoogleTask } from "src/google-authorization/types";

export type GoogleCalendarContextValue = {
    connected: boolean;
    loading: boolean;
    refreshStatus: () => Promise<boolean>;
    disconnectCalendar: () => Promise<void>;
    initializeCalendar: () => Promise<void>;
    loadCalendarEvents: (opts?: { skipConnectionCheck?: boolean }) => Promise<GoogleEvent[] | []>;
    markCalendarTaskCompletion: (taskId: string, listId: string, isCompleted: boolean) => Promise<void>;
    events: GoogleEvent[];
    tasks: GoogleTask[];
    isError: boolean;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    clientId: string | null;
};

export const GoogleCalendarContext = createContext<GoogleCalendarContextValue | null>(null);
