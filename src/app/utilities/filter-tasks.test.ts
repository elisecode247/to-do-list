import { describe, it, expect } from 'vitest';
import { filterTasks } from './filter-tasks';
import { TABS } from "src/checklist/tabs/types";
import { type ChecklistItem } from "app/types";

/**
[<- Go Back](./README.md)

# Task Filtering

Tasks can be filtered based on **Tabs**, **Modes**, **Completion Status**, **Category**, and **Hidden Today**, allowing you to focus on exactly what matters.

## Filter Precedence

Filters are applied in the following order: Archived and Hidden Today tasks are removed first, then the selected Tab is applied, and finally results are narrowed by Category, Mode, and Completion State.

1. Exclude archived and hidden tasks (except Hidden Today Tab and Archived Tab)
2. Apply Tab selection
3. Apply Category, Mode, and Completion filters

## Priority Highlighting

Tasks marked **Priority** are visually highlighted in all Tabs.

## Tab Filters

- **Today**: Tasks due today or earlier, including unscheduled tasks, that are not archived or hidden.
- **Scheduled**: All tasks and events marked `scheduled` that are due after today.
- **Hidden Today**: Tasks marked as hidden today, subtasks included.
- **Archived**: Tasks and subtasks that are archived.
- **Priority**: Tasks and subtasks marked `priority`.

## Mode Filters

Each task has one mode, determining how it behaves:

- **One-Time**: Unscheduled task that occurs once. Users can delete it once completed or archive it to defer it or keep a record.
- **Daily**: Unscheduled recurring daily task.
- **Occasional**: Unscheduled recurring task.
- **Scheduled**: Scheduled task that occurs once or recurs.

Rules:

- When filtering, selecting multiple modes uses OR logic (match any).
- Modes combine with other filters using AND logic.
- Example: Selecting "Daily" mode and Category "Work" returns all daily tasks in the Work Category.

## Completion Filter

Completion indicates a task is done for the current day:

- If **Hide Completed** is enabled, tasks completed today are excluded from all Tabs except "Hidden Today".
- Recurring tasks may reappear as incomplete on subsequent days (e.g., tasks marked daily or occasional).
- Tasks completed on previous days remain visible and show a badge indicating when they were last completed.

## Category Filter

Only tasks belonging to the selected Category are included.

## Subtask Exclusion

- Subtasks (`task.parentUuid`) are excluded from Mode and Category filters.
- Subtasks always display when the parent task is expanded, but can be hidden and removed with the **"Hide Completed" Filter**.
- Subtasks can have their own Mode, be hidden today, prioritized, archived, categorized, and marked complete.
- Subtasks cannot have the **Scheduled** mode, as scheduling applies only to parent tasks.

 */
const baseTask = (overrides: Partial<ChecklistItem>): ChecklistItem => ({
    id: crypto.randomUUID(),
    text: 'Task',
    done: false,
    lastCompleted: '',
    note: '',
    sortOrder: 0,
    category: '',
    mode: 'one-time',
    isPriority: false,
    isArchived: false,
    hasSubChores: false,
    parentUuid: null,
    isHidden: false,
    ...overrides,
});

const isHiddenToday = (hiddenIds: string[]) => (id: string) =>
    hiddenIds.includes(id);

describe('filterTasks', () => {
    it('returns empty array when items is empty', () => {
        const result = filterTasks({
            items: [],
            activeTab: TABS.today,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result).toEqual([]);
    });

    /** -------------------------
     *  Precedence: Archived & Hidden
     *  ------------------------- */
    it('excludes archived and hidden tasks in Today tab', () => {
        const archived = baseTask({ id: '1', isArchived: true });
        const hidden = baseTask({ id: '2' });
        const visible = baseTask({ id: '3' });

        const result = filterTasks({
            items: [archived, hidden, visible],
            activeTab: TABS.today,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: isHiddenToday(['2']),
        });

        expect(result.map(t => t.id)).toEqual(['3']);
    });

    /** -------------------------
     *  Tab Filters
     *  ------------------------- */
    it('shows only scheduled tasks in Scheduled tab', () => {
        const tasks = [
            baseTask({ id: '1', mode: 'scheduled' }),
            baseTask({ id: '2', mode: 'daily' }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.scheduled,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });

    it('shows only hidden tasks in Hidden Today tab', () => {
        const tasks = [
            baseTask({ id: '1' }),
            baseTask({ id: '2' }),
            baseTask({ id: '3', parentUuid: '2' }), // subtask of 2, should be hidden with parent
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.hidden,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: isHiddenToday(['2', '3']),
        });

        expect(result.map(t => t.id)).toEqual(['2']);
    });

    it('shows only archived tasks in Archived tab', () => {
        const tasks = [
            baseTask({ id: '1', isArchived: true }),
            baseTask({ id: '2' }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.archived,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });

    it('shows only priority tasks in Priority tab', () => {
        const tasks = [
            baseTask({ id: '1', isPriority: true }),
            baseTask({ id: '2', isPriority: false }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.priority,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });

    /** -------------------------
     *  Mode Filters
     *  ------------------------- */
    it('filters by mode using OR logic', () => {
        const tasks = [
            baseTask({ id: '1', mode: 'daily' }),
            baseTask({ id: '2', mode: 'one-time' }),
            baseTask({ id: '3', mode: 'scheduled' }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.today,
            activeFilters: ['daily', 'scheduled'],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1', '3']);
    });

    /** -------------------------
     *  Completion Filter
     *  ------------------------- */
    it('excludes completed tasks when hideCompleted is true', () => {
        const tasks = [
            baseTask({ id: '1', done: true }),
            baseTask({ id: '2', done: false }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.today,
            activeFilters: [],
            hideCompleted: true,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['2']);
    });

    /** -------------------------
     *  Category Filter
     *  ------------------------- */
    it('filters tasks by category', () => {
        const tasks = [
            baseTask({ id: '1', category: 'Work' }),
            baseTask({ id: '2', category: 'Home' }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.today,
            activeFilters: [],
            hideCompleted: false,
            filterCategory: 'Work',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });

    /** -------------------------
     *  Subtask Rules
     *  ------------------------- */
    it('excludes subtasks from mode and category filters', () => {
        const tasks = [
            baseTask({ id: '1', mode: 'daily' }),
            baseTask({ id: '2', mode: 'daily', parentUuid: '1' }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.today,
            activeFilters: ['daily'],
            hideCompleted: false,
            filterCategory: '',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });

    /** -------------------------
     *  Combined Filters
     *  ------------------------- */
    it('applies tab, mode, category, and completion filters together', () => {
        const tasks = [
            baseTask({ id: '1', mode: 'daily', category: 'Work', done: false }),
            baseTask({ id: '2', mode: 'daily', category: 'Work', done: true }),
            baseTask({ id: '3', mode: 'daily', category: 'Home', done: false }),
        ];

        const result = filterTasks({
            items: tasks,
            activeTab: TABS.today,
            activeFilters: ['daily'],
            hideCompleted: true,
            filterCategory: 'Work',
            isHiddenToday: () => false,
        });

        expect(result.map(t => t.id)).toEqual(['1']);
    });
});

