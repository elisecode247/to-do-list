interface CompletionSortableItem {
    done: boolean;
    sortOrder?: number;
}

function isCompletionSortableItem(item: unknown): item is CompletionSortableItem {
    return typeof item === 'object' && item !== null && 'done' in item;
}

export function compareCompletedTasksLast(
    a: unknown,
    b: unknown,
    enabled: boolean,
): number {
    if (!enabled) return 0;

    const aTask = isCompletionSortableItem(a) ? a : null;
    const bTask = isCompletionSortableItem(b) ? b : null;
    const aCompleted = aTask?.done === true;
    const bCompleted = bTask?.done === true;

    if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
    }

    if (aCompleted && bCompleted) {
        return (aTask.sortOrder ?? 0) - (bTask.sortOrder ?? 0);
    }

    return 0;
}
