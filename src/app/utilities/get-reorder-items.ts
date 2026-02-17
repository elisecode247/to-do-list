import type { ChecklistItem } from "../types";
import { type Tab, TABS } from "src/checklist/tabs/types";
import { arrayMove } from "@dnd-kit/sortable";

interface ReorderParams {
    allItems: ChecklistItem[];
    filteredItems: ChecklistItem[];
    activeTab: Tab;
    activeId: string;
    overId: string;
}

export function getReorderedItems({
    allItems,
    filteredItems,
    activeTab,
    activeId,
    overId,
}: ReorderParams): ChecklistItem[] {
    const activeItem = allItems.find(i => i.id === activeId);
    const overItem   = allItems.find(i => i.id === overId);
    const isSubtask = !filteredItems.find(i => i.id === activeId);
    if (!activeItem) return allItems;

    // Detect placeholder dropzone
    let isFirstSubTask = false;
    let placeholderParentId: string | null = null;

    if (typeof overId === "string" && overId.startsWith("placeholder-")) {
        isFirstSubTask = true;
        placeholderParentId = overId.replace("placeholder-", "");
        overId = placeholderParentId;
    }


    if (!overItem) return allItems;

    if (
        !isSubtask && (
        activeTab === TABS.priority ||
        activeTab === TABS.hidden ||
        activeTab === TABS.archived)
    ) {
        const sorted = [...filteredItems].sort(
            (a, b) =>
                (a.tabSortOrder?.[activeTab] ?? 0) -
                (b.tabSortOrder?.[activeTab] ?? 0)
        );

        const oldIndex = sorted.findIndex(i => i.id === activeId);
        const newIndex = sorted.findIndex(i => i.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            return allItems;
        }

        const reordered = arrayMove(sorted, oldIndex, newIndex).map(
            (item, index) => ({
                ...item,
                tabSortOrder: {
                    ...item.tabSortOrder,
                    [activeTab]: index,
                },
            })
        );

        return reordered;
    }

    // STRUCTURAL REORDER
    const oldParent = activeItem.parentUuid ?? null;

    // If placeholder is used, newParent becomes the *parent task itself*
    const newParent = isFirstSubTask
        ? overItem.id
        : overItem.parentUuid ?? null;

    const getSiblings = (parentUuid: string | null) =>
        allItems
            .filter(i => (i.parentUuid ?? null) === parentUuid)
            .sort((a, b) => a.sortOrder - b.sortOrder);

    // SAME PARENT REORDER (including first subtask placeholder)
    if (oldParent === newParent && !isFirstSubTask) {
        const siblings = getSiblings(oldParent);

        const oldIndex = siblings.findIndex(i => i.id === activeId);
        const newIndex = siblings.findIndex(i => i.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            return filteredItems;
        }

        const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex).map(
            (item, index) => ({
                ...item,
                sortOrder: index,
            })
        );

        const siblingIds = new Set(reorderedSiblings.map(i => i.id));

        // Remove old siblings from array
        const withoutSiblings = allItems.filter(
            item => !siblingIds.has(item.id)
        );

        // Insert reordered siblings back in correct place
        // Find first index where siblings originally appeared
        const firstSiblingIndex = allItems.findIndex(
            item => (item.parentUuid ?? null) === oldParent
        );

        const result = [...withoutSiblings];
        result.splice(firstSiblingIndex, 0, ...reorderedSiblings);

        return result;
    }

    // CROSS PARENT MOVE
    const oldSiblings = getSiblings(oldParent).filter(i => i.id !== activeId);
    const newSiblings = getSiblings(newParent);

    // If placeholder dropzone, insert at index 0 always
    let targetIndex = 0;

    if (!isFirstSubTask) {
        const insertIndex = newSiblings.findIndex(i => i.id === overId);
        targetIndex = insertIndex === -1 ? newSiblings.length : insertIndex;
    }

    const movedItem = {
        ...activeItem,
        parentUuid: newParent,
    };

    const updatedNewSiblings = [
        ...newSiblings.slice(0, targetIndex),
        movedItem,
        ...newSiblings.slice(targetIndex),
    ].map((item, index) => ({
        ...item,
        sortOrder: index,
    }));

    const updatedOldSiblings = oldSiblings.map((item, index) => ({
        ...item,
        sortOrder: index,
    }));

    const affectedIds = new Set([
        ...updatedNewSiblings.map(i => i.id),
        ...updatedOldSiblings.map(i => i.id),
    ]);

    let updatedItems = allItems.map(item => {
        if (affectedIds.has(item.id)) {
            return (
                updatedNewSiblings.find(i => i.id === item.id) ||
                updatedOldSiblings.find(i => i.id === item.id) ||
                item
            );
        }
        return item;
    });

    // Update hasSubChores safely
    const parentIds = [oldParent, newParent].filter(Boolean) as string[];
    updatedItems = updatedItems.map(item => {
        if (parentIds.includes(item.id)) {
            const childCount = updatedItems.filter(
                i => i.parentUuid === item.id
            ).length;

            return {
                ...item,
                hasSubChores: childCount > 0,
            };
        }
        return item;
    });

    return updatedItems;
}
