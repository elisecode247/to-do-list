import { describe, expect, it } from "vitest";
import { FrequencyType, INTERVAL_RECURRENCE } from "src/app/types";
import {
    COORDINATE_HOUSEHOLD_TEMPLATE,
    PREPARE_APPOINTMENT_TEMPLATE,
    RSVP_AND_PREPARE_EVENT_TEMPLATE,
    RETURN_BORROWED_ITEM_TEMPLATE,
    SCHEDULE_APPOINTMENT_TEMPLATE,
} from "./templates-people";

const PEOPLE_TEMPLATES = [
    ["coordinate household or family logistics", COORDINATE_HOUSEHOLD_TEMPLATE],
    ["schedule an appointment", SCHEDULE_APPOINTMENT_TEMPLATE],
    ["prepare for an appointment", PREPARE_APPOINTMENT_TEMPLATE],
    ["RSVP and prepare for an event", RSVP_AND_PREPARE_EVENT_TEMPLATE],
    ["return a borrowed item", RETURN_BORROWED_ITEM_TEMPLATE],
] as const;

describe("people templates", () => {
    it("uses a unique ID for every people template item", () => {
        const ids = PEOPLE_TEMPLATES.flatMap(([, template]) => template.map(item => item.id));

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each(PEOPLE_TEMPLATES)("keeps every %s subtask attached to its parent", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });

    it.each(PEOPLE_TEMPLATES)("keeps %s subtask order numbers sequential", (_name, items) => {
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(subtasks.map(item => item.sortOrder)).toEqual(subtasks.map((_, index) => index));
    });

    it.each(PEOPLE_TEMPLATES)("gives every %s subtask its own note", (_name, items) => {
        const parent = items.find(item => item.parentUuid === null);
        const subtasks = items.filter(item => item.parentUuid !== null);

        expect(parent?.note).not.toBe("");
        expect(subtasks.every(item => item.note !== "" && item.note !== parent?.note)).toBe(true);
    });

    it("keeps household coordination tasks on a weekly interval", () => {
        expect(COORDINATE_HOUSEHOLD_TEMPLATE.every(item => item.mode === "occasional")).toBe(true);
        expect(COORDINATE_HOUSEHOLD_TEMPLATE.every(item =>
            item.recurrence?.type === INTERVAL_RECURRENCE
            && item.recurrence.frequency === FrequencyType.Weekly
            && item.recurrence.numberOfRepetitions === 1
        )).toBe(true);
    });

    it.each([
        ["schedule an appointment", SCHEDULE_APPOINTMENT_TEMPLATE],
        ["prepare for an appointment", PREPARE_APPOINTMENT_TEMPLATE],
        ["RSVP and prepare for an event", RSVP_AND_PREPARE_EVENT_TEMPLATE],
        ["return a borrowed item", RETURN_BORROWED_ITEM_TEMPLATE],
    ] as const)("keeps %s tasks one-time", (_name, items) => {
        expect(items.every(item => item.mode === "one-time")).toBe(true);
        expect(items.every(item => item.recurrence === null)).toBe(true);
    });
});
