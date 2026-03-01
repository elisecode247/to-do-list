import { type CalendarEvent } from "src/google-authorization/calendar-event-item";
import { isDateToday } from "src/utilities/is-date-today";
import { isDateTomorrow } from "src/utilities/is-date-tomorrow";

/*
    Multi-day all day event (no times, just dates)
    Multi-day event with starting time
    Multi-day event with ending time
    Multi-day event with starting and ending time
    Single all-day event
    Single timed event
*/

function isSameDay(date1: Date, date2: Date): boolean {

    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&

        date1.getDate() === date2.getDate();

}


export function getEventDateString(event: CalendarEvent): string {
    const startDate = event.startDate;
    const endDate = event.endDate;
    const isStartToday = isDateToday(startDate);
    const isStartTomorrow = isDateTomorrow(startDate);
    const singleDay = isSameDay(startDate, endDate);

    if (event.allDay) {
        if (singleDay) {
            if (isStartToday) {
                return "Today, All Day";
            }
            if (isStartTomorrow) {
                return "Tomorrow, All Day";
            }
            return `${startDate.toLocaleDateString('en-US')}, All Day`;
        }

        if (isStartToday) {
            return `Today, ${startDate.toLocaleDateString('en-US')} until ${endDate.toLocaleDateString('en-US')}`;
        }
        if (isStartTomorrow) {
            return `Tomorrow, ${startDate.toLocaleDateString('en-US')} until ${endDate.toLocaleDateString('en-US')}`;
        }
        return `${startDate.toLocaleDateString('en-US')} until ${endDate.toLocaleDateString('en-US')}`;
    }

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTime = endDate.toLocaleTimeString('en-US', timeOptions);

    if (singleDay) {
        const timeRange = `${startTime} - ${endTime}`;
        if (isStartToday) {
            return `Today, ${timeRange}`;
        }
        if (isStartTomorrow) {
            return `Tomorrow, ${timeRange}`;
        }
        return `${startDate.toLocaleDateString('en-US')}, ${timeRange}`;
    }

    if (isStartToday) {
        return `Today, ${startTime} until ${endDate.toLocaleDateString('en-US')}, ${endTime}`;
    }
    if (isStartTomorrow) {
        return `Tomorrow, ${startTime} until ${endDate.toLocaleDateString('en-US')}, ${endTime}`;
    }
    return `${startDate.toLocaleDateString('en-US')}, ${startTime} until ${endDate.toLocaleDateString('en-US')}, ${endTime}`;
}

