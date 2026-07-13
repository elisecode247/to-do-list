import type { Mode, IntervalRecurrence, OneTimeRecurrence } from 'src/app/types';
import { formatLongDate } from 'src/app/utilities/format-date';

export function getRecurrenceText(mode: Mode, recurrence: IntervalRecurrence | OneTimeRecurrence | null) {
    if (recurrence?.type === 'one-time') {
        return `Start ${formatLongDate(recurrence.startDate)}`;
    }
    if (mode === 'one-time') return 'Once';
    if (mode === 'daily') return 'Daily';
    if (!recurrence) return 'Daily';

    if (recurrence.type === 'interval') {
        if (recurrence.numberOfRepetitions === 1) {
            return `${recurrence.frequency}`;
        }
        if (recurrence.frequency === 'daily' && recurrence.numberOfRepetitions > 1) {
            return `Every ${recurrence.numberOfRepetitions} days`;
        } else if (recurrence.frequency === 'daily' && recurrence.numberOfRepetitions === 1) {
            return `Daily`;
        } else if (recurrence.frequency === 'weekly' && recurrence.numberOfRepetitions > 1) {
            return `Every ${recurrence.numberOfRepetitions} weeks`;
        } else if (recurrence.frequency === 'weekly' && recurrence.numberOfRepetitions === 1) {
            return `Weekly`;
        } else if (recurrence.frequency === 'monthly' && recurrence.numberOfRepetitions > 1) {
            return `Every ${recurrence.numberOfRepetitions} months`;
        } else if (recurrence.frequency === 'monthly' && recurrence.numberOfRepetitions === 1) {
            return `Monthly`;
        } else if (recurrence.frequency === 'annually' && recurrence.numberOfRepetitions > 1) {
            return `Every ${recurrence.numberOfRepetitions} years`;
        } else if (recurrence.frequency === 'annually' && recurrence.numberOfRepetitions === 1) {
            return `Yearly`;
        }
        return `Every ${recurrence.numberOfRepetitions} ${recurrence.frequency}`;
    }
    return 'Unknown recurrence';
}
