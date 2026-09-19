// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderUi, type RenderedUi } from 'src/test/render-ui';
import SortableItemPlaceholder from './SortableItemPlaceholder';

const dndState = vi.hoisted(() => ({
    activeId: 'moving-task',
    activeTaskText: 'Wash the dishes',
    isOver: true,
}));

vi.mock('@dnd-kit/core', () => ({
    useDndContext: () => ({
        active: {
            id: dndState.activeId,
            data: { current: { taskText: dndState.activeTaskText } },
        },
    }),
    useDroppable: () => ({
        setNodeRef: vi.fn(),
        isOver: dndState.isOver,
    }),
}));

let rendered: RenderedUi | undefined;

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
    dndState.activeId = 'moving-task';
    dndState.activeTaskText = 'Wash the dishes';
    dndState.isOver = true;
});

describe('SortableItemPlaceholder', () => {
    it('shows the active task inside the drop zone when it is ready to drop', async () => {
        rendered = await renderUi(<SortableItemPlaceholder id="parent-task" />);

        const preview = rendered.container.querySelector(
            '.sortable-item_subtask-dropzone-inner--task-preview',
        );

        expect(preview).not.toBeNull();
        expect(preview?.textContent).toContain('Wash the dishes');
        expect(preview?.textContent).toContain('Release to place it here.');
    });

    it('does not show a task preview when the parent itself is being dragged', async () => {
        dndState.activeId = 'parent-task';
        rendered = await renderUi(<SortableItemPlaceholder id="parent-task" />);

        expect(rendered.container.querySelector(
            '.sortable-item_subtask-dropzone-inner--task-preview',
        )).toBeNull();
        expect(rendered.container.textContent).toContain('Choose another task');
    });
});
