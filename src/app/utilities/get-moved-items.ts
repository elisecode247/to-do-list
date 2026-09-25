import type { ChecklistItem } from 'src/app/types';

/**
 * Moves a task to the end of another sibling group while keeping both groups'
 * sort orders contiguous. Descendants remain attached to the moved task.
 */
export function getMovedItems(
    items: ChecklistItem[],
    taskId: string,
    parentUuid: string | null,
): ChecklistItem[] {
    const activeItem = items.find(item => item.id === taskId);
    if (!activeItem || (activeItem.parentUuid ?? null) === parentUuid) return items;

    if (parentUuid !== null && !items.some(item => item.id === parentUuid)) {
        return items;
    }

    let currentId = parentUuid;
    const visited = new Set<string>();
    while (currentId) {
        if (currentId === taskId || visited.has(currentId)) return items;
        visited.add(currentId);
        currentId = items.find(item => item.id === currentId)?.parentUuid ?? null;
    }

    const oldParentUuid = activeItem.parentUuid ?? null;
    const oldSiblings = items
        .filter(item => (item.parentUuid ?? null) === oldParentUuid && item.id !== taskId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item, index) => ({ ...item, sortOrder: index }));
    const newSiblings = items
        .filter(item => (item.parentUuid ?? null) === parentUuid && item.id !== taskId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    const movedItem: ChecklistItem = {
        ...activeItem,
        parentUuid,
        sortOrder: newSiblings.length,
    };

    const changedItems = new Map<string, ChecklistItem>([
        ...oldSiblings.map(item => [item.id, item] as const),
        ...newSiblings.map((item, index) => [
            item.id,
            { ...item, sortOrder: index },
        ] as const),
        [movedItem.id, movedItem],
    ]);

    const movedItems = items.map(item => changedItems.get(item.id) ?? item);
    const affectedParentIds = new Set(
        [oldParentUuid, parentUuid].filter((id): id is string => id !== null),
    );

    return movedItems.map(item => {
        if (!affectedParentIds.has(item.id)) return item;

        return {
            ...item,
            hasSubChores: movedItems.some(candidate => candidate.parentUuid === item.id),
        };
    });
}
