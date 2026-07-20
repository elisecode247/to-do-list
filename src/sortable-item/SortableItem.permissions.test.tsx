// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps, ReactNode } from 'react';
import { SortableItem } from './SortableItem';
import { TABS } from 'src/app-toolbar/tabs/types';
import type { ChoreAccessRole } from 'app/types';
import { click, renderUi, type RenderedUi } from 'src/test/render-ui';

vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setActivatorNodeRef: vi.fn(),
        setNodeRef: vi.fn(),
        transform: null,
        transition: undefined,
        isDragging: false,
        isOver: false,
    }),
    SortableContext: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
        div: ({ children, ...props }: { children: ReactNode }) => (
            <div {...props}>{children}</div>
        ),
    },
}));

vi.mock('usehooks-ts', () => ({
    useOnClickOutside: vi.fn(),
    useDebounceCallback: (callback: (...args: unknown[]) => unknown) => callback,
}));

vi.mock('src/editor/LazyNoteEditor', () => ({
    default: () => <div data-testid="note-editor" />,
}));

vi.mock('src/toast/use-toast', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('src/user-settings/use-user-settings', () => ({
    useUserSettings: () => ({ categories: [] }),
}));

const toggleChecked = vi.fn();
let rendered: RenderedUi | undefined;

function propsFor(accessRole: ChoreAccessRole): ComponentProps<typeof SortableItem> {
    return {
        id: `task-${accessRole}`,
        activeTab: TABS.today,
        isHidden: false,
        isHideCompleted: false,
        checked: false,
        deleteItem: vi.fn(),
        prioritizeItem: vi.fn(),
        text: `${accessRole} task`,
        note: '',
        mode: 'one-time',
        category: '',
        lastCompleted: '',
        toggleChecked,
        handleEdit: vi.fn(),
        handleHideItem: vi.fn(),
        onMoveItem: vi.fn(),
        onSuccess: vi.fn(),
        isPriority: false,
        subtasks: [],
        nextDue: null,
        recurrence: null,
        accessRole,
        ownerName: accessRole === 'owner' ? 'You' : 'Alex',
        hasMembers: accessRole === 'owner',
    };
}

function byLabel(container: HTMLElement, label: string): HTMLElement | null {
    return Array.from(container.querySelectorAll<HTMLElement>('[aria-label]'))
        .find(element => element.getAttribute('aria-label') === label) ?? null;
}

afterEach(async () => {
    vi.useRealTimers();
    toggleChecked.mockReset();
    await rendered?.unmount();
    rendered = undefined;
});

describe('SortableItem role permissions', () => {
    it('prevents viewers from completing tasks or opening an action menu', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('viewer')} />);

        const completion = byLabel(
            rendered.container,
            'Mark task "viewer task" as done',
        ) as HTMLInputElement;

        expect(completion.disabled).toBe(true);
        expect(completion.getAttribute('title')).toBe(
            'Viewer access cannot change completion',
        );
        expect(rendered.container.textContent).toContain('Shared by Alex');
        expect(byLabel(rendered.container, 'More task actions')).toBeNull();
    });

    it('allows doers to complete tasks but does not expose editing', async () => {
        vi.useFakeTimers();
        rendered = await renderUi(<SortableItem {...propsFor('doer')} />);

        const completion = byLabel(
            rendered.container,
            'Mark task "doer task" as done',
        ) as HTMLInputElement;

        expect(completion.disabled).toBe(false);
        expect(byLabel(rendered.container, 'More task actions')).toBeNull();

        await click(completion);
        await vi.advanceTimersByTimeAsync(400);
        expect(toggleChecked).toHaveBeenCalledWith('task-doer', true);
    });

    it('allows editors to edit without delete or add-subtask access', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('editor')} />);

        const menu = byLabel(rendered.container, 'More task actions');
        expect(menu).not.toBeNull();
        await click(menu!);

        expect(byLabel(rendered.container, 'Edit task')).not.toBeNull();
        expect(byLabel(rendered.container, 'Archive task')).not.toBeNull();
        expect(byLabel(rendered.container, 'Delete task')).toBeNull();
        expect(byLabel(rendered.container, 'Add subtask')).toBeNull();
    });

    it('gives owners the complete action menu', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('owner')} />);

        const menu = byLabel(rendered.container, 'More task actions');
        expect(menu).not.toBeNull();
        await click(menu!);

        expect(byLabel(rendered.container, 'Edit task')).not.toBeNull();
        expect(byLabel(rendered.container, 'Archive task')).not.toBeNull();
        expect(byLabel(rendered.container, 'Delete task')).not.toBeNull();
        expect(byLabel(rendered.container, 'Add subtask')).not.toBeNull();
    });
});
