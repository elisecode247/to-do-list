import { describe, expect, it } from "vitest";
import { CAT_CARE_TEMPLATE, DOG_CARE_TEMPLATE } from "./templates-pets";

const PET_TEMPLATES = [
    ["dog care", DOG_CARE_TEMPLATE],
    ["cat care", CAT_CARE_TEMPLATE],
] as const;

describe("pet templates", () => {
    it("uses a unique ID for every pet template item", () => {
        const ids = PET_TEMPLATES.flatMap(([, template]) => template.map(item => item.id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(PET_TEMPLATES)("keeps every %s subtask attached to its parent", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it.each(PET_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
    });

    it.each(PET_TEMPLATES)("gives every %s subtask its own note", (_name, items) => {
        const parent = items.find(item => item.parentUuid === null);
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it.each(PET_TEMPLATES)("keeps daily %s tasks in daily mode", (_name, items) => {
        const dailyTasks = items.filter(item =>
            item.parentUuid !== null
            && item.recurrence === null
        );

        expect(dailyTasks.every(item => item.mode === "daily")).toBe(true);
        expect(dailyTasks.every(item => item.tabSortOrder.today === 0)).toBe(true);
    });

    it.each(PET_TEMPLATES)("keeps periodic %s tasks in occasional mode with recurrence", (_name, items) => {
        const periodicTasks = items.filter(item =>
            item.parentUuid !== null
            && item.recurrence !== null
        );

        expect(periodicTasks.every(item => item.mode === "occasional")).toBe(true);
        expect(periodicTasks.every(item => item.recurrence?.type === "interval")).toBe(true);
    });
});
