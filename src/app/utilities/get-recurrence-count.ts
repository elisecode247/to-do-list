import {
    INTERVAL_RECURRENCE_TYPE,
    type CalendarRecurrence,
    type IntervalRecurrence,
    type OneTimeRecurrence
} from 'src/app/types';

export function getRecurrenceCount(recurrence: IntervalRecurrence | CalendarRecurrence | OneTimeRecurrence | null, defaultCount = 1): number {
    if (recurrence?.type === INTERVAL_RECURRENCE_TYPE) {
        return recurrence.count ?? defaultCount;
    }
    return defaultCount;
}
