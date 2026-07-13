import { describe, expect, it } from 'vitest';
import { getRecurrenceText } from './get-recurrence-text';

describe('getRecurrenceText', () => {
    it('formats a one-time recurrence as a readable start date', () => {
        expect(getRecurrenceText('one-time', {
            type: 'one-time',
            startDate: '2026-07-11',
        })).toBe('Start July 11, 2026');
    });
});
