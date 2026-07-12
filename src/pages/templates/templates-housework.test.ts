import { describe, expect, it } from "vitest";
import { CLEAN_BATHROOMS_TEMPLATE, DAILY_CLEANING_TEMPLATE } from "./templates-housework";

describe("housework templates", () => {
    it("uses a unique ID for every template item", () => {
        const items = [...DAILY_CLEANING_TEMPLATE, ...CLEAN_BATHROOMS_TEMPLATE];
        const ids = items.map(item => item.id);

        expect(new Set(ids).size).toBe(ids.length);
    });

    it.each([
        ["daily cleaning", DAILY_CLEANING_TEMPLATE],
        ["clean bathrooms", CLEAN_BATHROOMS_TEMPLATE],
    ])("keeps every %s subtask attached to an item in its template", (_name, items) => {
        const ids = new Set(items.map(item => item.id));

        for (const item of items) {
            if (item.parentUuid) expect(ids.has(item.parentUuid)).toBe(true);
        }
    });
});
