import { describe, expect, it } from 'vitest';
import type { ChecklistItem } from 'app/types';
import { TAB_TODAY } from 'src/app-toolbar/tabs/types';
import { getDropParentId, getTaskDragPreview } from './get-task-drag-preview';

const makeTask = (overrides: Partial<ChecklistItem>): ChecklistItem => ({
    itemType: 'checklist-item',
    isOwner: true,
    accessRole: 'owner',
    isHidden: false,
    id: crypto.randomUUID(),
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
    hasMembers: false,
    ...overrides,
});

const items = () => [
    makeTask({ id: 'parent', hasSubChores: false, sortOrder: 0 }),
    makeTask({ id: 'moving', sortOrder: 1 }),
    makeTask({ id: 'other-parent', hasSubChores: true, sortOrder: 2 }),
    makeTask({ id: 'child', parentUuid: 'other-parent', sortOrder: 0 }),
];

describe('getTaskDragPreview', () => {
    it('renders a root task in an empty subtask container during drag over', () => {
        const result = getTaskDragPreview({
            items: items(),
            activeTab: TAB_TODAY,
            activeId: 'moving',
            overId: 'placeholder-parent',
        });

        expect(result.find(item => item.id === 'moving')?.parentUuid).toBe('parent');
        expect(result.find(item => item.id === 'parent')?.hasSubChores).toBe(true);
    });

    it('renders a task in an existing subtask container during drag over', () => {
        const result = getTaskDragPreview({
            items: items(),
            activeTab: TAB_TODAY,
            activeId: 'moving',
            overId: 'child',
        });

        expect(result.find(item => item.id === 'moving')?.parentUuid).toBe('other-parent');
    });

    it('does not rewrite state while sorting within the same container', () => {
        const original = items();

        const result = getTaskDragPreview({
            items: original,
            activeTab: TAB_TODAY,
            activeId: 'moving',
            overId: 'parent',
        });

        expect(result).toBe(original);
    });
});

describe('getDropParentId', () => {
    it('resolves both empty and populated subtask containers', () => {
        const taskItems = items();

        expect(getDropParentId(taskItems, 'placeholder-parent')).toBe('parent');
        expect(getDropParentId(taskItems, 'child')).toBe('other-parent');
        expect(getDropParentId(taskItems, 'parent')).toBeNull();
    });
});
