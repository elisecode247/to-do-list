import { describe, expect, it } from "vitest";
import {
    CLEAN_BATHROOMS_TEMPLATE,
    CLEAN_LIVING_ROOM_TEMPLATE,
    DAILY_CLEANING_TEMPLATE,
} from "./templates-housework";

const HOUSEWORK_TEMPLATES = [
    ["daily cleaning", DAILY_CLEANING_TEMPLATE],
    ["clean bathrooms", CLEAN_BATHROOMS_TEMPLATE],
    ["clean living room", CLEAN_LIVING_ROOM_TEMPLATE],
] as const;

describe("housework templates", () => {
    it("uses a unique ID for every template item", () => {
        const items = HOUSEWORK_TEMPLATES.flatMap(([, template]) => template);
        const ids = items.map(item => item.id);

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(HOUSEWORK_TEMPLATES)("keeps every %s subtask attached to an item in its template", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it("gives every daily cleaning subtask its own note", () => {
        const parent = DAILY_CLEANING_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = DAILY_CLEANING_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("gives every clean bathrooms subtask its own note", () => {
        const parent = CLEAN_BATHROOMS_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = CLEAN_BATHROOMS_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("gives every clean living room subtask its own note", () => {
        const parent = CLEAN_LIVING_ROOM_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = CLEAN_LIVING_ROOM_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("keeps scheduling properties on daily-cleaning subtasks", () => {
        const subtasks = DAILY_CLEANING_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(subtasks.every(item => item.mode === "daily")).toBe(true);
        expect(subtasks.every(item => item.recurrence === null)).toBe(true);
        expect(subtasks.every(item => item.tabSortOrder.today === 0)).toBe(true);
    });
});
