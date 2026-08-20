import { describe, expect, it } from 'vitest';
import { compareCompletedTasksLast } from './compare-completed-tasks';

describe('compareCompletedTasksLast', () => {
    const tasks = [
        { id: 'completed-later', done: true, sortOrder: 20 },
        { id: 'incomplete-first', done: false, sortOrder: 30 },
        { id: 'completed-earlier', done: true, sortOrder: 10 },
        { id: 'incomplete-second', done: false, sortOrder: 0 },
    ];

    it('moves completed tasks to the end and sorts that group by sortOrder', () => {
        const sorted = [...tasks].sort((a, b) => compareCompletedTasksLast(a, b, true));

        expect(sorted.map(task => task.id)).toEqual([
            'incomplete-first',
            'incomplete-second',
            'completed-earlier',
            'completed-later',
        ]);
    });

    it('preserves the existing order when disabled', () => {
        const sorted = [...tasks].sort((a, b) => compareCompletedTasksLast(a, b, false));

        expect(sorted).toEqual(tasks);
    });
});
