import type {
    CalendarRecurrence,
    IntervalRecurrence,
    OneTimeRecurrence
} from 'src/app/types';

export function getRecurrenceCount(recurrence: IntervalRecurrence | CalendarRecurrence | OneTimeRecurrence | null, defaultCount = 1): number {
    if (recurrence?.type === 'interval') {
        return recurrence.count ?? defaultCount;
    }
    return defaultCount;
}
