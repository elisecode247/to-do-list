// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChoreAccessRole, ChecklistItem, ChoreMember } from 'app/types';
import EditTaskForm from './EditTaskForm';
import { flushEffects, renderUi, type RenderedUi } from 'src/test/render-ui';

const apiMocks = vi.hoisted(() => ({
    getChoreMembers: vi.fn(),
    addChoreMember: vi.fn(),
    deleteChoreMember: vi.fn(),
    updateChoreMemberRole: vi.fn(),
}));

vi.mock('src/app/api', () => apiMocks);

vi.mock('src/sharing/use-share-tasks', () => ({
    useShareTasks: () => ({
        sharedUsers: [{
            uuid: 'accepted-user',
            displayName: 'Alex Example',
            email: 'alex@example.com',
            avatarUrl: null,
            status: 'accepted',
        }],
    }),
}));

vi.mock('category-select/CategorySelect', () => ({
    default: ({ disabled }: { disabled?: boolean }) => (
        <select aria-label="Task category" disabled={disabled}>
            <option value="">None</option>
        </select>
    ),
}));

vi.mock('src/editor/LazyNoteEditor', async () => {
    const { forwardRef, useImperativeHandle } = await import('react');
    return {
        default: forwardRef(function MockNoteEditor(
            { readOnly }: { readOnly?: boolean },
            ref,
        ) {
            useImperativeHandle(ref, () => ({ getMarkdown: () => '' }));
            return <textarea aria-label="Task notes" readOnly={readOnly} />;
        }),
    };
});

const member: ChoreMember = {
    choreUuid: 'task-id',
    userUuid: 'existing-user',
    role: 'viewer',
    displayName: 'Jamie Member',
    avatarUrl: null,
    email: 'jamie@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
};

let rendered: RenderedUi | undefined;

function taskFor(accessRole: ChoreAccessRole): ChecklistItem {
    return {
        itemType: 'checklist-item',
        isOwner: accessRole === 'owner',
        accessRole,
        isHidden: false,
        id: 'task-id',
        text: `${accessRole} task`,
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
        hasMembers: true,
    };
}

async function renderForm(accessRole: ChoreAccessRole): Promise<RenderedUi> {
    const result = await renderUi(
        <EditTaskForm
            categories={[]}
            enableSharing
            formData={taskFor(accessRole)}
            onSave={vi.fn()}
            onClose={vi.fn()}
        />,
    );
    await flushEffects();
    return result;
}

beforeEach(() => {
    apiMocks.getChoreMembers.mockResolvedValue([member]);
});

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
    vi.clearAllMocks();
});

describe('EditTaskForm role permissions', () => {
    it('keeps editor fields enabled but member management unavailable', async () => {
        rendered = await renderForm('editor');

        const taskName = rendered.container.querySelector(
            '#edit-task-form-name',
        ) as HTMLInputElement;

        expect(taskName.disabled).toBe(false);
        expect(rendered.container.querySelector('[aria-label="Save changes"]'))
            .not.toBeNull();
        expect(rendered.container.querySelector(
            '[aria-label="Role for Jamie Member"]',
        )).toBeNull();
        expect(rendered.container.querySelector(
            '[aria-label="Remove Jamie Member from task"]',
        )).toBeNull();
        expect(rendered.container.textContent).not.toContain('Add a shared user');
        expect(rendered.container.textContent).toContain('viewer');
    });

    it('gives owners editing and member-management controls', async () => {
        rendered = await renderForm('owner');

        const taskName = rendered.container.querySelector(
            '#edit-task-form-name',
        ) as HTMLInputElement;
        const roleSelect = rendered.container.querySelector(
            '[aria-label="Role for Jamie Member"]',
        ) as HTMLSelectElement;

        expect(taskName.disabled).toBe(false);
        expect(roleSelect).not.toBeNull();
        expect(roleSelect.disabled).toBe(false);
        expect(rendered.container.querySelector(
            '[aria-label="Remove Jamie Member from task"]',
        )).not.toBeNull();
        expect(rendered.container.textContent).toContain('Add a shared user');
    });
});
