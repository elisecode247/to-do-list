import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { filterTasks } from './filter-tasks';
import {
    TAB_TODAY,
    TAB_SCHEDULED,
    TAB_HIDDEN,
    TAB_ARCHIVED,
    TAB_PRIORITY,
} from 'src/checklist/tabs/types';
import type { ChecklistItem, FilterParams } from 'app/types';

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
const makeTask = (overrides: Partial<ChecklistItem> = {}): ChecklistItem => ({
    id: crypto.randomUUID(),
    text: 'Task',
    done: false,
    lastCompleted: '',
    note: '',
    sortOrder: 0,
    category: 'home',
    mode: 'one-time',
    isPriority: false,
    isArchived: false,
    hasSubChores: false,
    parentUuid: null,
    isHidden: false,
    ...overrides,
});

const makeParams = (
    overrides: Partial<FilterParams> = {}
): FilterParams => ({
    items: [],
    activeTab: TAB_TODAY,
    activeFilters: [],
    hideCompleted: false,
    filterCategory: 'all',
    isHiddenToday: () => false,
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
        const task = makeTask();

        const result = filterTasks(
            makeParams({
                items: [task],
                activeTab: TAB_HIDDEN,
                isHiddenToday: () => true,
            })
        );

        expect(result).toHaveLength(1);
        expect(result[0].isHidden).toBe(true);
    });

    it('excludes hidden tasks from Today tab', () => {
        const task = makeTask();

        const result = filterTasks(
            makeParams({
                items: [task],
                activeTab: TAB_TODAY,
                isHiddenToday: () => true,
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

    it('Scheduled tab only includes scheduled tasks', () => {
        const scheduled = makeTask({ mode: 'scheduled' });
        const daily = makeTask({ mode: 'daily' });

        const result = filterTasks(
            makeParams({
                items: [scheduled, daily],
                activeTab: TAB_SCHEDULED,
            })
        );

        expect(result).toEqual([scheduled]);
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
                activeFilters: ['scheduled'],
            })
        );

        expect(result).toEqual([scheduled]);
    });
});
