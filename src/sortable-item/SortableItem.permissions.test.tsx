// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ComponentProps, type ReactNode } from 'react';
import { SortableItem } from './SortableItem';
import { TAB_TODAY } from 'src/app-toolbar/tabs/types';
import type { ChoreAccessRole } from 'app/types';
import { click, renderUi, type RenderedUi } from 'src/test/render-ui';

const { useOnClickOutsideMock } = vi.hoisted(() => ({
    useOnClickOutsideMock: vi.fn(),
}));

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
    useOnClickOutside: useOnClickOutsideMock,
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
        activeTab: TAB_TODAY,
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
    return Array.from(
        container.ownerDocument.body.querySelectorAll<HTMLElement>('[aria-label]'),
    )
        .find(element => element.getAttribute('aria-label') === label) ?? null;
}

afterEach(async () => {
    vi.useRealTimers();
    toggleChecked.mockReset();
    useOnClickOutsideMock.mockReset();
    await rendered?.unmount();
    rendered = undefined;
});

describe('SortableItem role permissions', () => {
    it('shows a priority badge in the metadata for priority tasks', async () => {
        rendered = await renderUi(
            <SortableItem {...propsFor('owner')} isPriority={true} />,
        );

        const badge = rendered.container.querySelector('.sortable-item_priority-status');

        expect(badge?.textContent).toContain('Priority');
        expect(badge?.getAttribute('title')).toBe('Priority task');
    });

    it('only applies subchore styling below the top render level', async () => {
        rendered = await renderUi(
            <SortableItem {...propsFor('owner')} isSubChore={true} />,
        );

        expect(rendered.container.querySelector('.sortable-item_container--subchore'))
            .toBeNull();

        await rendered.unmount();
        rendered = await renderUi(
            <SortableItem
                {...propsFor('owner')}
                isSubChore={true}
                isTopLevel={false}
            />,
        );

        expect(rendered.container.querySelector('.sortable-item_container--subchore'))
            .not.toBeNull();
    });

    it('prevents viewers from completing tasks or opening an action menu', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('viewer')} />);

        const completion = byLabel(
            rendered.container,
            'Mark task "viewer task" as done',
        ) as HTMLElement;

        expect(completion.getAttribute('aria-disabled')).toBe('true');
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
        ) as HTMLElement;

        expect(completion.getAttribute('aria-disabled')).toBeNull();
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

        expect(document.querySelector('.sortable-item_menu-dropdown')?.parentElement)
            .toBe(document.body);
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

    it('closes the action menu when its task scrolls out of view', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('owner')} />);

        const menu = byLabel(
            rendered.container,
            'More task actions',
        ) as HTMLButtonElement;
        menu.getBoundingClientRect = () => ({
            x: 100,
            y: 100,
            top: 100,
            right: 140,
            bottom: 140,
            left: 100,
            width: 40,
            height: 40,
            toJSON: () => ({}),
        });
        await click(menu);
        expect(document.querySelector('.sortable-item_menu-dropdown--open'))
            .not.toBeNull();

        menu.getBoundingClientRect = () => ({
            x: 100,
            y: -50,
            top: -50,
            right: 140,
            bottom: -10,
            left: 100,
            width: 40,
            height: 40,
            toJSON: () => ({}),
        });
        await act(async () => {
            window.dispatchEvent(new Event('scroll'));
        });

        expect(document.querySelector('.sortable-item_menu-dropdown--open'))
            .toBeNull();
    });

    it('keeps the action menu open for clicks inside the same task container', async () => {
        rendered = await renderUi(<SortableItem {...propsFor('owner')} />);

        const menu = byLabel(
            rendered.container,
            'More task actions',
        ) as HTMLButtonElement;
        await click(menu);

        const taskHeading = rendered.container.querySelector('.sortable-item_text-heading');
        const handleClickOutsideMenu = useOnClickOutsideMock.mock.calls.at(-1)?.[1] as
            | ((event: MouseEvent | TouchEvent | FocusEvent) => void)
            | undefined;

        expect(taskHeading).not.toBeNull();
        expect(handleClickOutsideMenu).toBeTypeOf('function');
        expect(document.querySelector('.sortable-item_menu-dropdown--open'))
            .not.toBeNull();

        await act(async () => {
            handleClickOutsideMenu?.({ target: taskHeading } as unknown as MouseEvent);
        });

        expect(document.querySelector('.sortable-item_menu-dropdown--open'))
            .not.toBeNull();
    });
});
