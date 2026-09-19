import type { ChecklistItem } from 'app/types';
import type { Tab } from 'src/app-toolbar/tabs/types';
import { getReorderedItems } from 'src/app/utilities/get-reorder-items';

const PLACEHOLDER_PREFIX = 'placeholder-';

interface TaskDragPreviewParams {
    items: ChecklistItem[];
    activeTab: Tab;
    activeId: string;
    overId: string;
}

export function getDropParentId(
    items: ChecklistItem[],
    overId: string,
): string | null | undefined {
    if (overId.startsWith(PLACEHOLDER_PREFIX)) {
        const parentId = overId.slice(PLACEHOLDER_PREFIX.length);
        return items.some(item => item.id === parentId) ? parentId : undefined;
    }

    const overItem = items.find(item => item.id === overId);
    return overItem ? overItem.parentUuid ?? null : undefined;
}

/**
 * Builds the temporary list state needed while an item crosses containers.
 * Same-container sorting remains handled by dnd-kit's transforms until drop.
 */
export function getTaskDragPreview({
    items,
    activeTab,
    activeId,
    overId,
}: TaskDragPreviewParams): ChecklistItem[] {
    const activeItem = items.find(item => item.id === activeId);
    const dropParentId = getDropParentId(items, overId);

    if (
        !activeItem
        || dropParentId === undefined
        || (activeItem.parentUuid ?? null) === dropParentId
    ) {
        return items;
    }

    return getReorderedItems({
        allItems: items,
        filteredItems: items.filter(item => !item.parentUuid),
        activeTab,
        activeId,
        overId,
    });
}
