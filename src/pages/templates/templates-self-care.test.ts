import { describe, expect, it } from "vitest";
import {
    BEDTIME_ROUTINE_TEMPLATE,
    GO_FOR_A_WALK_TEMPLATE,
    MORNING_RESET_TEMPLATE,
} from "./templates-self-care";

const SELF_CARE_TEMPLATES = [
    ["morning reset", MORNING_RESET_TEMPLATE],
    ["bedtime routine", BEDTIME_ROUTINE_TEMPLATE],
    ["go for a walk", GO_FOR_A_WALK_TEMPLATE],
] as const;

describe("self-care templates", () => {
    it("uses a unique ID for every self-care template item", () => {
        const ids = SELF_CARE_TEMPLATES.flatMap(([, template]) => template.map(item => item.id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(SELF_CARE_TEMPLATES)("keeps every %s subtask attached to its parent", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it.each(SELF_CARE_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
    });

    it.each(SELF_CARE_TEMPLATES)("gives every %s subtask its own note", (_name, items) => {
        const parent = items.find(item => item.parentUuid === null);
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it.each(SELF_CARE_TEMPLATES)("keeps daily scheduling properties on %s subtasks", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.every(item => item.mode === "daily")).toBe(true);
        expect(subtasks.every(item => item.recurrence === null)).toBe(true);
        expect(subtasks.every(item => item.tabSortOrder.today === 0)).toBe(true);
    });
});
