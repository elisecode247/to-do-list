import {
    INTERVAL_RECURRENCE,
    type IntervalRecurrence,
    type OneTimeRecurrence
} from 'src/app/types';

export function getRecurrenceCount(recurrence: IntervalRecurrence | OneTimeRecurrence | null, defaultCount = 1): number {
    if (recurrence?.type === INTERVAL_RECURRENCE) {
        return recurrence.numberOfRepetitions ?? defaultCount;
    }
    return defaultCount;
}
