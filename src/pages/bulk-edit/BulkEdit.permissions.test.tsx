// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChoreAccessRole, ChecklistItem } from 'app/types';
import BulkEdit from './BulkEdit';
import { act } from 'react';
import { click, renderUi, type RenderedUi } from 'src/test/render-ui';

const taskMocks = vi.hoisted(() => ({
    items: [] as ChecklistItem[],
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    bulkUpdate: vi.fn(),
    loadTasks: vi.fn(),
}));

vi.mock('src/app/use-task', () => ({
    useTask: () => taskMocks,
}));

vi.mock('src/toast/use-toast', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('src/user-settings/use-user-settings', () => ({
    useUserSettings: () => ({ categories: [] }),
}));

vi.mock('src/pages/Page', () => ({
    default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('src/edit-task-form/EditTaskForm', () => ({
    default: () => <div data-testid="edit-task-form" />,
}));

function task(accessRole: ChoreAccessRole, index: number): ChecklistItem {
    return {
        itemType: 'checklist-item',
        isOwner: accessRole === 'owner',
        accessRole,
        isHidden: false,
        id: `${accessRole}-task`,
        text: `${accessRole} task`,
        done: false,
        lastCompleted: '',
        note: '',
        sortOrder: index,
        tabSortOrder: {},
        category: '',
        mode: 'one-time',
        isPriority: accessRole === 'editor',
        isArchived: false,
        hasSubChores: false,
        parentUuid: null,
        recurrence: null,
        nextDue: null,
        hasMembers: false,
    };
}

let rendered: RenderedUi | undefined;

beforeEach(() => {
    taskMocks.items = [
        task('viewer', 0),
        task('doer', 1),
        task('editor', 2),
        task('owner', 3),
    ];
    taskMocks.bulkUpdate.mockResolvedValue(undefined);
});

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
    vi.clearAllMocks();
});

describe('BulkEdit permissions', () => {
    it('never includes unauthorized tasks in Bulk Save', async () => {
        rendered = await renderUi(<BulkEdit />);

        const viewerArchive = rendered.container.querySelector(
            '[aria-label="Archive viewer task"]',
        ) as HTMLInputElement;
        const doerArchive = rendered.container.querySelector(
            '[aria-label="Archive doer task"]',
        ) as HTMLInputElement;
        const editorArchive = rendered.container.querySelector(
            '[aria-label="Archive editor task"]',
        ) as HTMLInputElement;
        const ownerArchive = rendered.container.querySelector(
            '[aria-label="Archive owner task"]',
        ) as HTMLInputElement;

        expect(viewerArchive.disabled).toBe(true);
        expect(doerArchive.disabled).toBe(true);
        expect(editorArchive.disabled).toBe(false);
        expect(ownerArchive.disabled).toBe(false);

        await act(async () => {
            editorArchive.click();
            ownerArchive.click();
        });

        const save = Array.from(rendered.container.querySelectorAll('button'))
            .find(button => button.textContent === 'Save All Changes');
        expect(save).toBeDefined();
        expect(save!.disabled).toBe(false);
        await click(save!);

        expect(taskMocks.bulkUpdate).toHaveBeenCalledTimes(1);
        const submitted = taskMocks.bulkUpdate.mock.calls[0][0] as ChecklistItem[];
        expect(submitted.map(item => item.id)).toEqual([
            'editor-task',
            'owner-task',
        ]);
        expect(submitted.every(item => item.isPriority !== undefined)).toBe(true);
    });
});
