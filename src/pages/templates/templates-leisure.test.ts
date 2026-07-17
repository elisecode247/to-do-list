import { describe, expect, it } from "vitest";
import {
    HOBBY_SESSION_TEMPLATE,
    PLAN_DAY_TRIP_TEMPLATE,
    PLAN_LEISURE_OUTING_TEMPLATE,
} from "./templates-leisure";

const LEISURE_TEMPLATES = [
    ["hobby session", HOBBY_SESSION_TEMPLATE],
    ["plan a day trip", PLAN_DAY_TRIP_TEMPLATE],
    ["plan a leisure outing", PLAN_LEISURE_OUTING_TEMPLATE],
] as const;

describe("leisure templates", () => {
    it("uses a unique ID for every leisure template item", () => {
        const ids = LEISURE_TEMPLATES.flatMap(([, template]) => template.map(item => item.id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(LEISURE_TEMPLATES)("keeps every %s subtask attached to its parent", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it.each(LEISURE_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
    });

    it.each(LEISURE_TEMPLATES)("gives every %s subtask its own note", (_name, items) => {
        const parent = items.find(item => item.parentUuid === null);
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it.each(LEISURE_TEMPLATES)("keeps %s tasks one-time", (_name, items) => {
        expect(items.every(item => item.mode === "one-time")).toBe(true);
        expect(items.every(item => item.recurrence === null)).toBe(true);
    });
});
