import type { ChecklistItem } from "../types";
import { type Tab, TABS } from "src/checklist/tabs/types";
import { arrayMove } from "@dnd-kit/sortable";

interface ReorderParams {
    items: ChecklistItem[];
    activeTab: Tab;
    activeId: string;
    overId: string;
}

export function getReorderedItems({ items, activeTab, activeId, overId }: ReorderParams): ChecklistItem[] {
    const activeItem = items.find(i => i.id === activeId);

    if (!activeItem) return items;

    // Detect placeholder dropzone
    let isFirstSubTask = false;
    let placeholderParentId: string | null = null;

    if (typeof overId === "string" && overId.startsWith("placeholder-")) {
        isFirstSubTask = true;
        placeholderParentId = overId.replace("placeholder-", "");
        overId = placeholderParentId;
    }

    const overItem = items.find(i => i.id === overId);

    if (!overItem) return items;

    if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
        // Reorder only within tabSortOrder
        const sorted = [...items].sort(
            (a, b) => (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0)
        );

        const oldIndex = sorted.findIndex(i => i.id === activeId);
        const newIndex = sorted.findIndex(i => i.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return items;

        const reordered = arrayMove(sorted, oldIndex, newIndex).map((item, index) => ({
            ...item,
            tabSortOrder: { ...item.tabSortOrder, [activeTab]: index },
        }));

        return reordered;
    }

    const oldParent = (activeItem.parentUuid ?? null) as string | null;

    // If placeholder is used, newParent becomes the *parent task itself*
    const newParent: string | null = isFirstSubTask ? (overItem.id as string) : (overItem.parentUuid ?? null);

    const getSiblings = (parentUuid: string | null) =>
        items
            .filter(i => (i.parentUuid ?? null) === parentUuid)
            .sort((a, b) => a.sortOrder - b.sortOrder);

    // SAME PARENT REORDER
    if (oldParent === newParent && !isFirstSubTask) {
        const siblings = getSiblings(oldParent);

        const oldIndex = siblings.findIndex(i => i.id === activeId);
        const newIndex = siblings.findIndex(i => i.id === overId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            return items;
        }

        const reordered = arrayMove(siblings, oldIndex, newIndex).map((item, index) => ({
            ...item,
            sortOrder: index,
        }));

        const otherItems = items.filter(item => (item.parentUuid ?? null) !== oldParent);

        return [...otherItems, ...reordered];
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

    const untouched = items.filter(i => {
        const p = i.parentUuid ?? null;
        return p !== oldParent && p !== newParent && i.id !== activeId;
    });

    let updatedItems = [...untouched, ...updatedOldSiblings, ...updatedNewSiblings];

    // --- Update hasSubChores dynamically ---
    const parentIds = [oldParent, newParent].filter(Boolean) as string[];
    updatedItems = updatedItems.map(item => {
        if (parentIds.includes(item.id)) {
            const childCount = updatedItems.filter(i => i.parentUuid === item.id).length;
            return { ...item, hasSubChores: childCount > 0 };
        }
        return item;
    });

    return updatedItems;
}
