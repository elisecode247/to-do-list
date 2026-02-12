import { describe, it, expect } from "vitest";
import { getReorderedItems } from "app/utilities/get-reorder-items";
import { TABS } from "src/checklist/tabs/types";
import { type ChecklistItem } from "app/types";

const makeTask = (overrides: Partial<ChecklistItem> = {}): ChecklistItem => ({
    id: crypto.randomUUID(),
    text: 'Task',
    done: false,
    lastCompleted: '',
    note: '',
    sortOrder: 0,
    tabSortOrder: {},
    category: 'home',
    categoryUuid: null,
    mode: 'one-time',
    isPriority: false,
    isArchived: false,
    hasSubChores: false,
    parentUuid: null,
    isHidden: false,
    ...overrides,
});
const makeBaseItems = (): ChecklistItem[] => [
    makeTask({ id: "A", parentUuid: null, sortOrder: 0, hasSubChores: true }),
    makeTask({ id: "B", parentUuid: null, sortOrder: 1 }),
    makeTask({ id: "C", parentUuid: "A", sortOrder: 0 }),
    makeTask({ id: "D", parentUuid: "A", sortOrder: 1 }),
];

describe("Guard conditions", () => {
    it("returns original array if active item not found", () => {
        const filteredItems = makeBaseItems();

        const result = getReorderedItems({
            filteredItems,
            activeTab: TABS.today,
            activeId: "Z",
            overId: "A",
        });

        expect(result).toBe(filteredItems);
    });

    it("returns original array if over item not found", () => {
        const filteredItems = makeBaseItems();

        const result = getReorderedItems({
            filteredItems,
            activeTab: TABS.today,
            activeId: "A",
            overId: "Z",
        });

        expect(result).toBe(filteredItems);
    });

    it("returns original array if dropped on itself", () => {
        const filteredItems = makeBaseItems();

        const result = getReorderedItems({
            filteredItems,
            activeTab: TABS.today,
            activeId: "B",
            overId: "B",
        });

        expect(result).toEqual(filteredItems);
    });

    describe("Tab-based reordering (priority/hidden/archived)", () => {
        const makeItems = (): ChecklistItem[] => [
            makeTask({ id: "A", parentUuid: null, sortOrder: 0, tabSortOrder: { priority: 0 } }),
            makeTask({ id: "B", parentUuid: null, sortOrder: 1, tabSortOrder: { priority: 1 } }),
            makeTask({ id: "C", parentUuid: null, sortOrder: 2, tabSortOrder: { priority: 2 } }),
        ];

        it("reorders in priority tab", () => {
            const filteredItems = makeItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: "priority",
                activeId: "C",
                overId: "A",
            });

            expect(result.map(i => i.id)).toEqual(["C", "A", "B"]);
            expect(result[0].parentUuid).toBeNull();
            expect(result[0].sortOrder).toBe(2); // unchanged canonical
        });

        it("reorders in hidden tab", () => {
            const filteredItems = [
                makeTask({ id: "A", parentUuid: null, sortOrder: 0, tabSortOrder: { hidden: 0 } }),
                makeTask({ id: "B", parentUuid: null, sortOrder: 1, tabSortOrder: { hidden: 1 } }),
            ];

            const result = getReorderedItems({
                filteredItems,
                activeTab: "hidden",
                activeId: "B",
                overId: "A",
            });

            expect(result.map(i => i.id)).toEqual(["B", "A"]);
        });

    });
    describe("Same parent reorder", () => {
        it("reorders root level siblings", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "B",
                overId: "A",
            });

            const roots = result.filter(i => i.parentUuid === null);
            expect(roots.map(r => r.id)).toEqual(["B", "A"]);
            expect(roots[0].sortOrder).toBe(0);
            expect(roots[1].sortOrder).toBe(1);
        });

        it("reorders subtasks within same parent", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "D",
                overId: "C",
            });

            const children = result
                .filter(i => i.parentUuid === "A")
                .sort((a, b) => a.sortOrder - b.sortOrder);

            expect(children.map(c => c.id)).toEqual(["D", "C"]);
        });
    });
    describe("Cross parent move", () => {
        it("moves subtask to root", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "C",
                overId: "B",
            });

            const moved = result.find(i => i.id === "C");
            expect(moved?.parentUuid).toBeNull();
        });

        it("moves root task into another parent", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "B",
                overId: "C",
            });

            const moved = result.find(i => i.id === "B");
            expect(moved?.parentUuid).toBe("A");
        });
    });
    describe("Placeholder dropzone", () => {
        it("inserts as first subtask when using placeholder", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "B",
                overId: "placeholder-A",
            });

            const children = result
                .filter(i => i.parentUuid === "A")
                .sort((a, b) => a.sortOrder - b.sortOrder);

            expect(children[0].id).toBe("B");
        });
    });
    describe("hasSubChores recalculation", () => {
        it("removes hasSubChores when last child removed", () => {
            const filteredItems: ChecklistItem[] = [
                makeTask({ id: "A", parentUuid: null, sortOrder: 0, hasSubChores: true }),
                makeTask({ id: "C", parentUuid: "A", sortOrder: 0 }),
            ];

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "C",
                overId: "placeholder-C", // move under itself (simulate root)
            });

            const parent = result.find(i => i.id === "A");
            expect(parent?.hasSubChores).toBe(false);
        });

        it("adds hasSubChores when child added", () => {
            const filteredItems: ChecklistItem[] = [
                makeTask({ id: "A", parentUuid: null, sortOrder: 0, hasSubChores: false }),
                makeTask({ id: "B", parentUuid: null, sortOrder: 1 }),
            ];

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "B",
                overId: "placeholder-A",
            });

            const parent = result.find(i => i.id === "A");
            expect(parent?.hasSubChores).toBe(true);
        });
    });
    describe("Integrity checks", () => {
        it("never loses tasks", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "C",
                overId: "B",
            });

            expect(result).toHaveLength(filteredItems.length);
        });

        it("never duplicates tasks", () => {
            const filteredItems = makeBaseItems();

            const result = getReorderedItems({
                filteredItems,
                activeTab: TABS.today,
                activeId: "C",
                overId: "B",
            });

            const ids = result.map(i => i.id);
            const unique = new Set(ids);

            expect(unique.size).toBe(ids.length);
        });
    });

});
