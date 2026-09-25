import { describe, expect, it } from 'vitest';
import type { ChecklistItem } from 'src/app/types';
import { getMovedItems } from 'src/app/utilities/get-moved-items';

function task(overrides: Partial<ChecklistItem>): ChecklistItem {
    return {
        itemType: 'checklist-item',
        isOwner: true,
        accessRole: 'owner',
        hasMembers: false,
        isHidden: false,
        id: 'task',
        text: 'Task',
        done: false,
        lastCompleted: '',
        note: '',
        sortOrder: 0,
        tabSortOrder: {},
        category: '',
        mode: 'one-time',
        isPriority: false,
        isArchived: false,
        hasSubChores: false,
        parentUuid: null,
        recurrence: null,
        nextDue: null,
        ...overrides,
    };
}

describe('getMovedItems', () => {
    it('moves a task to the end of its new group and normalizes both groups', () => {
        const items = [
            task({ id: 'parent-a', hasSubChores: true }),
            task({ id: 'parent-b', sortOrder: 1, hasSubChores: true }),
            task({ id: 'moving', parentUuid: 'parent-a', sortOrder: 0 }),
            task({ id: 'old-sibling', parentUuid: 'parent-a', sortOrder: 4 }),
            task({ id: 'new-sibling', parentUuid: 'parent-b', sortOrder: 7 }),
        ];

        const result = getMovedItems(items, 'moving', 'parent-b');

        expect(result.find(item => item.id === 'moving')).toMatchObject({
            parentUuid: 'parent-b',
            sortOrder: 1,
        });
        expect(result.find(item => item.id === 'old-sibling')?.sortOrder).toBe(0);
        expect(result.find(item => item.id === 'new-sibling')?.sortOrder).toBe(0);
        expect(result.find(item => item.id === 'parent-a')?.hasSubChores).toBe(true);
        expect(result.find(item => item.id === 'parent-b')?.hasSubChores).toBe(true);
    });

    it('moves a last subtask to the top level and clears the former parent flag', () => {
        const items = [
            task({ id: 'root', sortOrder: 0, hasSubChores: true }),
            task({ id: 'other-root', sortOrder: 1 }),
            task({ id: 'moving', parentUuid: 'root', sortOrder: 0 }),
        ];

        const result = getMovedItems(items, 'moving', null);

        expect(result.find(item => item.id === 'moving')).toMatchObject({
            parentUuid: null,
            sortOrder: 2,
        });
        expect(result.find(item => item.id === 'root')?.hasSubChores).toBe(false);
    });

    it('does not allow a task to move under one of its descendants', () => {
        const items = [
            task({ id: 'root', hasSubChores: true }),
            task({ id: 'child', parentUuid: 'root', hasSubChores: true }),
            task({ id: 'grandchild', parentUuid: 'child' }),
        ];

        expect(getMovedItems(items, 'root', 'grandchild')).toBe(items);
    });
});
