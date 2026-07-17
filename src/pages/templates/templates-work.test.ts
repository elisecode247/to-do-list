import { describe, expect, it } from "vitest";
import { FrequencyType, INTERVAL_RECURRENCE } from "src/app/types";
import {
    END_WORKDAY_TEMPLATE,
    FOCUS_SESSION_TEMPLATE,
    START_WORKDAY_TEMPLATE,
    WEEKLY_WORK_RESET_TEMPLATE,
} from "./templates-work";

const WORK_TEMPLATES = [
    ["start the workday", START_WORKDAY_TEMPLATE],
    ["end the workday", END_WORKDAY_TEMPLATE],
    ["weekly work reset", WEEKLY_WORK_RESET_TEMPLATE],
    ["focus session", FOCUS_SESSION_TEMPLATE],
] as const;

describe("work templates", () => {
    it("uses a unique ID for every work template item", () => {
        const ids = WORK_TEMPLATES.flatMap(([, template]) => template.map(item => item.id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(WORK_TEMPLATES)("keeps every %s subtask attached to its parent", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it.each(WORK_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
    });

    it.each(WORK_TEMPLATES)("gives every %s subtask its own note", (_name, items) => {
        const parent = items.find(item => item.parentUuid === null);
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it.each([
        ["start the workday", START_WORKDAY_TEMPLATE],
        ["end the workday", END_WORKDAY_TEMPLATE],
    ] as const)("keeps %s tasks in daily mode", (_name, items) => {
        expect(items.every(item => item.mode === "daily")).toBe(true);
        expect(items.every(item => item.recurrence === null)).toBe(true);
    });

    it("keeps weekly work reset tasks on a weekly interval", () => {
        expect(WEEKLY_WORK_RESET_TEMPLATE.every(item => item.mode === "occasional")).toBe(true);
        expect(WEEKLY_WORK_RESET_TEMPLATE.every(item =>
            item.recurrence?.type === INTERVAL_RECURRENCE
            && item.recurrence.frequency === FrequencyType.Weekly
            && item.recurrence.numberOfRepetitions === 1
        )).toBe(true);
    });

    it("keeps focus session tasks one-time", () => {
        expect(FOCUS_SESSION_TEMPLATE.every(item => item.mode === "one-time")).toBe(true);
        expect(FOCUS_SESSION_TEMPLATE.every(item => item.recurrence === null)).toBe(true);
    });
});
