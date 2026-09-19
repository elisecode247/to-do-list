// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import type { ChecklistItem } from 'src/app/types';
import { renderUi, type RenderedUi } from 'src/test/render-ui';
import { TaskDragOverlay } from './TaskDragOverlay';

const item: ChecklistItem = {
    itemType: 'checklist-item',
    isOwner: true,
    accessRole: 'owner',
    isHidden: false,
    id: 'moving-task',
    text: 'New subtask',
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
};

let rendered: RenderedUi | undefined;

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});

describe('TaskDragOverlay', () => {
    it('renders the active task independently from its sortable context', async () => {
        rendered = await renderUi(<TaskDragOverlay item={item} />);

        const overlay = rendered.container.querySelector('.task-drag-overlay');
        expect(overlay?.getAttribute('aria-label')).toBe('Moving task: New subtask');
        expect(overlay?.textContent).toContain('New subtask');
        expect(overlay?.textContent).toContain('Moving');
    });
});
