import { useContext, type Dispatch, type SetStateAction } from 'react';
import { GoogleCalendarContext, type GoogleCalendarContextValue } from 'src/google-authorization/google-calendar-context';

const noopSetIsError: Dispatch<SetStateAction<boolean>> = () => undefined;

const fallbackGoogleCalendarContext: GoogleCalendarContextValue = {
    connected: false,
    loading: false,
    refreshStatus: async () => false,
    disconnectCalendar: async () => undefined,
    initializeCalendar: async () => undefined,
    loadCalendarEvents: async () => [],
    hideEventForToday: async () => undefined,
    unhideEventForToday: async () => undefined,
    updateEvent: async () => undefined,
    events: [],
    isError: false,
    setIsError: noopSetIsError,
    clientId: null,
};

export const useGoogleCalendar = (): GoogleCalendarContextValue => {
    const context = useContext(GoogleCalendarContext);
    return context ?? fallbackGoogleCalendarContext;
};
