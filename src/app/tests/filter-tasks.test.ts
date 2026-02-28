import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { filterTasks } from 'app/utilities/filter-tasks';
import {
    TAB_TODAY,
    TAB_UPCOMING,
    TAB_HIDDEN,
    TAB_ARCHIVED,
    TAB_PRIORITY,
} from 'src/app-toolbar/tabs/types';
import type { ChecklistItem, FilterParams } from 'app/types';
import { ALL_MODES, ONE_TIME_MODE, SCHEDULED_MODE } from 'src/checklist/constants';

// --------------------
// Mock category helper
// --------------------
vi.mock('src/category-select/category-constants', () => ({
    isCategoryIncluded: vi.fn(),
}));

import { isCategoryIncluded } from 'src/category-select/category-constants';

// --------------------
// Test helpers
// --------------------
/**
 * Get today's date at midnight in the user's local timezone
 */
const getTodayAtMidnight = (): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

/**
 * Create an ISO date string relative to today (in user's local timezone)
 * @param offset - number of days relative to today (0 = today, 1 = tomorrow, -1 = yesterday)
 */
const getDateRelativeToToday = (offset: number): string => {
    const date = getTodayAtMidnight();
    date.setDate(date.getDate() + offset);
    return date.toISOString();
};

const makeTask = (overrides: Partial<ChecklistItem> = {}): ChecklistItem => ({
    id: crypto.randomUUID(),
    text: 'Task',
    done: false,
    lastCompleted: '',
    note: '',
    sortOrder: 0,
    tabSortOrder: {},
    category: 'home',
    categoryUuid: null,
    mode: ONE_TIME_MODE,
    isPriority: false,
    isArchived: false,
    hasSubChores: false,
    parentUuid: null,
    isHidden: false,
    recurrence: null,
    nextDue: null,
    ...overrides,
});

const makeParams = (
    overrides: Partial<FilterParams> = {}
): FilterParams => ({
    items: [],
    activeTab: TAB_TODAY,
    modeFilter: ALL_MODES,
    hideCompleted: false,
    filterCategory: 'all',
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    (isCategoryIncluded as Mock).mockReturnValue(true);
});

// --------------------
// Empty state
// --------------------
describe('filterTasks – empty state', () => {
    it('returns an empty array when no items are provided', () => {
        const result = filterTasks(makeParams());
        expect(result).toEqual([]);
    });
});

// --------------------
// Hidden logic
// --------------------
describe('filterTasks – hidden behavior', () => {
    it('includes only hidden tasks in Hidden tab', () => {
        const task = makeTask({ isHidden: true });

        const result = filterTasks(
            makeParams({
                items: [task],
                activeTab: TAB_HIDDEN,
            })
        );

        expect(result).toHaveLength(1);
        expect(result[0].isHidden).toBe(true);
    });

    it('excludes hidden tasks from Today tab', () => {
        const task = makeTask({ isHidden: true });

        const result = filterTasks(
            makeParams({
                items: [task],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(0);
    });
});

// --------------------
// Tab filtering
// --------------------
describe('filterTasks – tab filtering', () => {
    it('Today tab excludes archived tasks', () => {
        const archived = makeTask({ isArchived: true });

        const result = filterTasks(
            makeParams({
                items: [archived],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Today tab excludes tasks with future due dates', () => {
        const futureTask = makeTask({
            nextDue: getDateRelativeToToday(1),
        });

        const result = filterTasks(
            makeParams({
                items: [futureTask],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Today tab includes tasks without due dates', () => {
        const noDueDate = makeTask({ nextDue: null });

        const result = filterTasks(
            makeParams({
                items: [noDueDate],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(1);
    });

    it('Today tab includes tasks with past due dates', () => {
        const pastDue = makeTask({
            nextDue: getDateRelativeToToday(-1),
        });

        const result = filterTasks(
            makeParams({
                items: [pastDue],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(1);
    });

    it('Today tab includes tasks completed today', () => {
        const completedToday = makeTask({
            done: true,
            lastCompleted: getDateRelativeToToday(0),
            nextDue: getDateRelativeToToday(1), // nextDue in future to test the fix
        });

        const result = filterTasks(
            makeParams({
                items: [completedToday],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(1);
    });

    it('Upcoming tab includes upcoming scheduled tasks', () => {
        const scheduled = makeTask({ mode: 'scheduled' });
        const daily = makeTask({ mode: 'daily' });

        const result = filterTasks(
            makeParams({
                items: [scheduled, daily],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toEqual([scheduled]);
    });

    it('Upcoming tab includes upcoming tasks', () => {
        const occasional = makeTask({
            mode: 'occasional',
            nextDue: getDateRelativeToToday(1)
        });
        const daily = makeTask({ mode: 'daily' });

        const result = filterTasks(
            makeParams({
                items: [occasional, daily],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toEqual([occasional]);
    });

    it('Upcoming tab excludes non-upcoming tasks', () => {
        const pastDue = makeTask({
            mode: 'occasional',
            nextDue: getDateRelativeToToday(-1)
        });
        const daily = makeTask({ mode: 'daily' });

        const result = filterTasks(
            makeParams({
                items: [pastDue, daily],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Upcoming tab includes tasks completed today and next due in the future', () => {
        const completedToday = makeTask({
            done: true,
            lastCompleted: getDateRelativeToToday(0),
            nextDue: getDateRelativeToToday(1), // nextDue in future
        });

        const result = filterTasks(
            makeParams({
                items: [completedToday],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toHaveLength(1);
    });

    it('Upcoming tab excludes hidden tasks', () => {
        const hidden = makeTask({
            mode: 'scheduled',
            isHidden: true,
        });

        const result = filterTasks(
            makeParams({
                items: [hidden],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Upcoming tab excludes archived tasks', () => {
        const archived = makeTask({
            mode: 'scheduled',
            isArchived: true,
        });

        const result = filterTasks(
            makeParams({
                items: [archived],
                activeTab: TAB_UPCOMING,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Priority tab only includes priority tasks', () => {
        const priority = makeTask({ isPriority: true });
        const normal = makeTask();

        const result = filterTasks(
            makeParams({
                items: [priority, normal],
                activeTab: TAB_PRIORITY,
            })
        );

        expect(result).toEqual([priority]);
    });

    it('Priority tab excludes hidden tasks', () => {
        const priorityHidden = makeTask({
            isPriority: true,
            isHidden: true,
        });

        const result = filterTasks(
            makeParams({
                items: [priorityHidden],
                activeTab: TAB_PRIORITY,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Priority tab excludes archived tasks', () => {
        const priorityArchived = makeTask({
            isPriority: true,
            isArchived: true,
        });

        const result = filterTasks(
            makeParams({
                items: [priorityArchived],
                activeTab: TAB_PRIORITY,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('Archived tab only includes archived tasks', () => {
        const archived = makeTask({ isArchived: true });
        const active = makeTask();

        const result = filterTasks(
            makeParams({
                items: [archived, active],
                activeTab: TAB_ARCHIVED,
            })
        );

        expect(result).toEqual([archived]);
    });
});

// --------------------
// Subtask rules
// --------------------
describe('filterTasks – subtask rules', () => {
    it('excludes subtasks from Today tab', () => {
        const subtask = makeTask({ parentUuid: 'parent-1' });

        const result = filterTasks(
            makeParams({
                items: [subtask],
                activeTab: TAB_TODAY,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('allows subtasks in Priority tab', () => {
        const subtask = makeTask({
            parentUuid: 'parent-1',
            isPriority: true,
        });

        const result = filterTasks(
            makeParams({
                items: [subtask],
                activeTab: TAB_PRIORITY,
            })
        );

        expect(result).toHaveLength(1);
    });
});

// --------------------
// Common filters
// --------------------
describe('filterTasks – common filters', () => {
    it('filters out completed tasks when hideCompleted is true', () => {
        const completed = makeTask({ done: true });

        const result = filterTasks(
            makeParams({
                items: [completed],
                hideCompleted: true,
            })
        );

        expect(result).toHaveLength(0);
    });

    it('filters by category', () => {
        (isCategoryIncluded as Mock).mockReturnValue(false);

        const task = makeTask({ category: 'work' });

        const result = filterTasks(
            makeParams({
                items: [task],
                filterCategory: 'home',
            })
        );

        expect(result).toHaveLength(0);
    });

    it('filters by active mode filters (OR logic)', () => {
        const daily = makeTask({ mode: 'daily' });
        const scheduled = makeTask({ mode: 'scheduled' });

        const result = filterTasks(
            makeParams({
                items: [daily, scheduled],
                modeFilter: SCHEDULED_MODE,
            })
        );

        expect(result).toEqual([scheduled]);
    });
});

// --------------------
// Timezone testing
// --------------------
describe('filterTasks - timezone handling', () => {
    it('should handle tasks completed at UTC midnight correctly for non-UTC timezones', () => {
        const utcMidnightYesterday = new Date();
        utcMidnightYesterday.setUTCDate(utcMidnightYesterday.getUTCDate() - 1);
        utcMidnightYesterday.setUTCHours(0, 0, 0, 0);

        const task = makeTask({
            done: true,
            lastCompleted: utcMidnightYesterday.toISOString(), // Yesterday's UTC midnight
            nextDue: getDateRelativeToToday(1),
        });

        const result = filterTasks(
            makeParams({
                items: [task],
                activeTab: TAB_TODAY,
            })
        );

        // Should NOT be included in Today tab (it was completed yesterday, not today)
        expect(result).toHaveLength(0);
    });

    it('should correctly identify tasks completed today in local timezone', () => {
        // Task completed at local midnight today
        const completedToday = makeTask({
            done: true,
            lastCompleted: getDateRelativeToToday(0), // Today at local midnight
            nextDue: getDateRelativeToToday(1),
        });

        const result = filterTasks(
            makeParams({
                items: [completedToday],
                activeTab: TAB_TODAY,
            })
        );

        // Should be included in Today tab
        expect(result).toHaveLength(1);
    });
});
