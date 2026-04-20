import { useContext } from 'react';
import { GoogleCalendarContext, type GoogleCalendarContextValue } from 'src/google-authorization/google-calendar-context';

export const useGoogleCalendar = (): GoogleCalendarContextValue => {
    const context = useContext(GoogleCalendarContext);
    if (!context) {
        throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
    }
    return context;
};
