import { describe, expect, test } from "vitest";

import {
    GOOGLE_CALENDAR_SCOPES,
    GOOGLE_CALENDAR_SCOPE_REQUEST,
} from "./google-calendar-scopes";

describe("Google Calendar scopes", () => {
    test("requests only event access and read-only calendar metadata", () => {
        expect(GOOGLE_CALENDAR_SCOPES).toEqual([
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.calendars.readonly",
        ]);
        expect(GOOGLE_CALENDAR_SCOPE_REQUEST).toBe(GOOGLE_CALENDAR_SCOPES.join(" "));
    });
});
