import { describe, expect, it } from "vitest";
import {
    CLEAN_BATHROOMS_TEMPLATE,
    CLEAN_BEDROOM_TEMPLATE,
    CLEAN_HALLS_AND_STAIRS_TEMPLATE,
    CLEAN_KITCHEN_TEMPLATE,
    CLEAN_LIVING_ROOM_TEMPLATE,
    DAILY_CLEANING_TEMPLATE,
} from "./templates-housework";

const HOUSEWORK_TEMPLATES = [
    ["daily cleaning", DAILY_CLEANING_TEMPLATE],
    ["clean bathrooms", CLEAN_BATHROOMS_TEMPLATE],
    ["clean living room", CLEAN_LIVING_ROOM_TEMPLATE],
    ["clean kitchen", CLEAN_KITCHEN_TEMPLATE],
    ["clean bedroom", CLEAN_BEDROOM_TEMPLATE],
    ["clean halls and stairs", CLEAN_HALLS_AND_STAIRS_TEMPLATE],
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

    it.each(HOUSEWORK_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
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

    it("gives every clean kitchen subtask its own note", () => {
        const parent = CLEAN_KITCHEN_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = CLEAN_KITCHEN_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("gives every clean bedroom subtask its own note", () => {
        const parent = CLEAN_BEDROOM_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = CLEAN_BEDROOM_TEMPLATE.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("gives every clean halls and stairs subtask its own note", () => {
        const parent = CLEAN_HALLS_AND_STAIRS_TEMPLATE.find(item => item.parentUuid === null);
        const subtasks = CLEAN_HALLS_AND_STAIRS_TEMPLATE.filter(item => item.parentUuid !== null);

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
