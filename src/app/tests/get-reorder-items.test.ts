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
    const items = makeBaseItems();

    const result = getReorderedItems({
      items,
      activeTab: TABS.today,
      activeId: "Z",
      overId: "A",
    });

    expect(result).toBe(items);
  });

  it("returns original array if over item not found", () => {
    const items = makeBaseItems();

    const result = getReorderedItems({
      items,
      activeTab: TABS.today,
      activeId: "A",
      overId: "Z",
    });

    expect(result).toBe(items);
  });

  it("returns original array if dropped on itself", () => {
    const items = makeBaseItems();

    const result = getReorderedItems({
      items,
      activeTab: TABS.today,
      activeId: "B",
      overId: "B",
    });

    expect(result).toEqual(items);
  });
});
