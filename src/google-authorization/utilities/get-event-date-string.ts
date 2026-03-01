import { type CalendarEvent } from "src/google-authorization/calendar-event-item";
import { isGoogleDateToday } from "src/google-authorization/utilities/is-google-date-today";
import { isGoogleDateTomorrow } from "src/google-authorization/utilities/is-google-date-tomorrow";

/*
    Multi-day all day event (no times, just dates)
    Multi-day event with starting time
    Multi-day event with ending time
    Multi-day event with starting and ending time
    Single all-day event
    Single timed event
*/

/**
 * Helper to parse date strings correctly, handling date-only formats (YYYY-MM-DD)
 */
function parseDate(dateString: string): Date {
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(datePattern);

    if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[3], 10);
        return new Date(year, month, day);
    }

    return new Date(dateString);
}

function endIsNextDay(start: Date, end: Date): boolean {
    const nextDay = new Date(start);
    nextDay.setDate(nextDay.getDate() + 1);
    return end.getFullYear() === nextDay.getFullYear() &&
        end.getMonth() === nextDay.getMonth() &&
        end.getDate() === nextDay.getDate();
}

export function getEventDateString(event: CalendarEvent): string {
    const isAllDayEvent = event.allDay;

    if (isAllDayEvent) {
        // Handle all-day events: show date range or "Today" or "Tomorrow"
        if (isGoogleDateToday(event.start)) {
            if (isGoogleDateTomorrow(event.end)) {
                return "Today, All Day";
            }
            // For multi-day events starting today, check if they span through tomorrow
            // All-day events have exclusive end dates (end date is the day after the last display day)
            const startDate = parseDate(event.start);
            const endDate = parseDate(event.end);
            const lastDisplayDay = new Date(endDate);
            lastDisplayDay.setDate(lastDisplayDay.getDate() - 1);

            return `Today, ${startDate.toLocaleDateString('en-US')} until ${lastDisplayDay.toLocaleDateString('en-US')}`;
        }
        if (isGoogleDateTomorrow(event.start)) {
            const startDate = parseDate(event.start);
            const endDate = parseDate(event.end);
            if (endIsNextDay(startDate, endDate)) {
                return `Tomorrow, All Day`;
            } else {
                const lastDisplayDay = new Date(endDate);
                lastDisplayDay.setDate(lastDisplayDay.getDate() - 1);
                return `Tomorrow, ${startDate.toLocaleDateString('en-US')} until ${lastDisplayDay.toLocaleDateString('en-US')}`;
            }

        }
        // Single Day all-day event
        if (endIsNextDay(parseDate(event.start), parseDate(event.end))) {
            return `${parseDate(event.start).toLocaleDateString()}, All Day`;
        }
        // Multi-day event show full date range. set end date -1 day since Google end dates are exclusive for all-day events
        const endDate = parseDate(event.end);
        endDate.setDate(endDate.getDate() - 1);
        return `${parseDate(event.start).toLocaleDateString()} until ${endDate.toLocaleDateString()}`;
    }

    // Handle timed events: show time range
    const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startDate = new Date(event.start).toLocaleDateString();
    const endDate = new Date(event.end).toLocaleDateString();

    // Check if same day
    const isSameDay = startDate === endDate;

    if (isSameDay) {
        // Single day - use dash separator
        const timeRange = `${startTime} - ${endTime}`;
        
        if (isGoogleDateToday(event.start)) {
            return `Today, ${timeRange}`;
        }
        if (isGoogleDateTomorrow(event.start)) {
            return `Tomorrow, ${timeRange}`;
        }
        return `${startDate}, ${timeRange}`;
    }

    // Multi-day event - use "until" separator
    const isTodayStart = isGoogleDateToday(event.start);
    const isTomorrowStart = isGoogleDateTomorrow(event.start);

    if (isTodayStart) {
        return `Today, ${startTime} until ${endDate}, ${endTime}`;
    }
    if (isTomorrowStart) {
        return `Tomorrow, ${startTime} until ${endDate}, ${endTime}`;
    }
    return `${startDate}, ${startTime} until ${endDate}, ${endTime}`;
}

