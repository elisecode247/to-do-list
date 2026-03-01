import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEventDateString } from "src/google-authorization/utilities/get-event-date-string";
import type { GoogleEvent } from '../types';
import { parseGoogleDate } from "src/google-authorization/utilities/parse-google-date";

vi.mock("src/utilities/is-date-today", () => ({
    isDateToday: vi.fn(),
}));

vi.mock("src/utilities/is-date-tomorrow", () => ({
    isDateTomorrow: vi.fn(),
}));

import { isDateToday } from "src/utilities/is-date-today";
import { isDateTomorrow } from "src/utilities/is-date-tomorrow";


const mockIsDateToday = vi.mocked(isDateToday);
const mockIsDateTomorrow = vi.mocked(isDateTomorrow);

// Use May 1, 2026 as the reference "today" date for all tests

/**
 * Helper: Format date as ISO with time for timed events
 */
function formatDateTime(date: Date): string {
    return date.toISOString();
}

const createEvent = (overrides: Partial<GoogleEvent> = {}): GoogleEvent => {
    const baseEvent = {
        id: 'event-1',
        title: 'Test Event',
        status: 'confirmed',
        start: formatDateTime(new Date(2026, 4, 1, 14, 0)), // May 1, 2:00 PM
        end: formatDateTime(new Date(2026, 4, 1, 16, 0)), // May 1, 4:00 PM
        allDay: false,
    };

    const event = { ...baseEvent, ...overrides };
    const overrideStartDate = overrides.startDate;
    const overrideEndDate = overrides.endDate;

    return {
        ...event,
        startDate: overrideStartDate ?? parseGoogleDate(event.start),
        endDate: overrideEndDate ?? parseGoogleDate(event.end),
    } as GoogleEvent;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getEventDateString', () => {

    describe('Multi-day events', () => {
        it('should format multi-day all-day event with start and end dates', () => {
            const event = createEvent({
                startDate: new Date(2026, 4, 10, 0, 0, 0),
                endDate: new Date(2026, 4, 19, 23, 59, 59),
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe("5/10/2026 until 5/19/2026");
        });

        it('should format multi-day all-day event starting today', () => {
            const event = createEvent({
                startDate: new Date(2026, 4, 1, 0, 0, 0),
                endDate: new Date(2026, 4, 3, 23, 59, 59),
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe("Today, 5/1/2026 until 5/3/2026");
        });

        it('should format multi-day all-day event starting tomorrow', () => {
            const event = createEvent({
                startDate: new Date(2026, 4, 2, 0, 0, 0),
                endDate: new Date(2026, 4, 3, 23, 59, 59),
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe("Tomorrow, 5/2/2026 until 5/3/2026");
        });

        it('should format multi-day event with timed start and end', () => {
            const event = createEvent({
                startDate: new Date("2026-05-04T16:00:00-08:00"),
                endDate: new Date("2026-05-06T16:00:00-08:00"),
                allDay: false,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`5/4/2026, 05:00 PM until 5/6/2026, 05:00 PM`);
        });

        it('should format multi-day event with timed start and end, starting today', () => {

            const event = createEvent({
                startDate: new Date("2026-05-01T16:00:00-08:00"),
                endDate: new Date("2026-05-03T16:00:00-08:00"),
                allDay: false,
            });

            mockIsDateToday.mockReturnValue(true);
            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);
            mockIsDateToday.mockReturnValue(true);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`Today, 05:00 PM until 5/3/2026, 05:00 PM`);
        });

        it('should format multi-day event with timed start and end, starting tomorrow', () => {
            const event = createEvent({
                startDate: new Date("2026-05-02T16:00:00-08:00"),
                endDate: new Date("2026-05-04T16:00:00-08:00"),
                allDay: false,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe(`Tomorrow, 05:00 PM until 5/4/2026, 05:00 PM`);
        });
    });

    describe('Single day events', () => {
        it('should format single all-day event for today', () => {
            const event = createEvent({
                // 5/1/2026 12 am to 5/1/2026 11:59:59 pm
                startDate: new Date(2026, 4, 1, 0, 0, 0),
                endDate: new Date(2026, 4, 1, 23, 59, 59),
                allDay: true,
            });

            mockIsDateToday.mockReturnValueOnce(true);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe('Today, All Day');
        });

        it('should format single all-day event for tomorrow', () => {
            const event = createEvent({
                startDate: new Date(2026, 4, 2, 0, 0, 0),
                endDate: new Date(2026, 4, 2, 23, 59, 59),
                allDay: true,
            });
            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);

            expect(result).toBe('Tomorrow, All Day');
        });

        it('should format single all-day event for future date', () => {
            const event = createEvent({
                startDate: new Date(2026, 4, 10, 0, 0, 0),
                endDate: new Date(2026, 4, 10, 23, 59, 59),
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe('5/10/2026, All Day');
        });

        it('should format single timed event for today with time range', () => {
            const event = createEvent({
                "id": "698g6e1l9d_20260301T040000Z",
                "title": "Saturday",
                "startDate": new Date("2026-05-01T20:00:00-08:00"),
                "endDate": new Date("2026-05-01T21:00:00-08:00"),
                "allDay": false,
                "location": "",
                "status": "confirmed"
            });

            mockIsDateToday.mockReturnValue(true);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`Today, 09:00 PM - 10:00 PM`);
        });

        it('should format single timed event for tomorrow with time range', () => {
            const event = createEvent({
                "id": "abc",
                "title": "Tomorrow Timed Event",
                "startDate": new Date("2026-05-10T14:00:00-08:00"),
                "endDate": new Date("2026-05-10T16:00:00-08:00"),
                "allDay": false,
                "location": "",
                "status": "confirmed"
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe(`Tomorrow, 03:00 PM - 05:00 PM`);
        });

        it('should format single timed event for future date with time range', () => {

            const event = createEvent({
                "id": "abc",
                "title": "Future Timed Event May 10 2026 2 to 4 PM",
                "startDate": new Date("2026-05-10T14:00:00-08:00"),
                "endDate": new Date("2026-05-10T16:00:00-08:00"),
                "allDay": false,
                "location": "",
                "status": "confirmed"
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`5/10/2026, 03:00 PM - 05:00 PM`);
        });

    });

});
