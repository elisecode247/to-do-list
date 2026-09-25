import { describe, expect, it } from 'vitest';
import type { ChecklistItem } from 'src/app/types';
import { getMoveTaskOptions } from './get-move-task-options';

function task(
    id: string,
    text: string,
    parentUuid: string | null = null,
    sortOrder = 0,
): ChecklistItem {
    return {
        itemType: 'checklist-item',
        isOwner: true,
        accessRole: 'owner',
        hasMembers: false,
        isHidden: false,
        id,
        text,
        done: false,
        lastCompleted: '',
        note: '',
        sortOrder,
        tabSortOrder: {},
        category: '',
        mode: 'one-time',
        isPriority: false,
        isArchived: false,
        hasSubChores: false,
        parentUuid,
        recurrence: null,
        nextDue: null,
    };
}

describe('getMoveTaskOptions', () => {
    it('excludes the moving task and its descendants and labels nested destinations', () => {
        const items = [
            task('moving', 'Moving task'),
            task('descendant', 'Its child', 'moving'),
            task('destination', 'Destination', null, 1),
            task('nested-destination', 'Nested destination', 'destination'),
        ];
        const lookup = new Map(items.map(item => [item.id, item]));

        expect(getMoveTaskOptions(lookup, 'moving')).toEqual([
            { id: 'destination', label: 'Destination' },
            {
                id: 'nested-destination',
                label: 'Destination › Nested destination',
            },
        ]);
    });
});
