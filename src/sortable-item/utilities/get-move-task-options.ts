import type { ChecklistItem } from 'src/app/types';

export type MoveTaskOption = {
    id: string;
    label: string;
};

export function getMoveTaskOptions(
    itemLookup: ReadonlyMap<string, ChecklistItem>,
    taskId: string,
): MoveTaskOption[] {
    const items = Array.from(itemLookup.values());
    const childrenByParent = new Map<string | null, ChecklistItem[]>();

    for (const item of items) {
        const parentId = item.parentUuid ?? null;
        const children = childrenByParent.get(parentId) ?? [];
        children.push(item);
        childrenByParent.set(parentId, children);
    }

    for (const children of childrenByParent.values()) {
        children.sort((a, b) => a.sortOrder - b.sortOrder || a.text.localeCompare(b.text));
    }

    const excludedIds = new Set<string>();
    const descendantsToVisit = [taskId];
    while (descendantsToVisit.length > 0) {
        const currentId = descendantsToVisit.pop()!;
        if (excludedIds.has(currentId)) continue;
        excludedIds.add(currentId);
        for (const child of childrenByParent.get(currentId) ?? []) {
            descendantsToVisit.push(child.id);
        }
    }

    const options: MoveTaskOption[] = [];
    const visitedIds = new Set<string>();
    const visit = (item: ChecklistItem, ancestorNames: string[]) => {
        if (visitedIds.has(item.id) || excludedIds.has(item.id)) return;
        visitedIds.add(item.id);

        const path = [...ancestorNames, item.text];
        options.push({
            id: item.id,
            label: `${path.join(' › ')}${item.isArchived ? ' (Archived)' : ''}`,
        });

        for (const child of childrenByParent.get(item.id) ?? []) {
            visit(child, path);
        }
    };

    const roots = items
        .filter(item => !item.parentUuid || !itemLookup.has(item.parentUuid))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.text.localeCompare(b.text));
    for (const root of roots) visit(root, []);

    // Preserve access to malformed/orphaned data without risking recursive loops.
    for (const item of items) visit(item, []);

    return options;
}
