import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEventDateString } from "src/google-authorization/utilities/get-event-date-string";
import type { Event } from "src/google-authorization/types";

vi.mock("src/google-authorization/utilities/is-google-date-today", () => ({
    isGoogleDateToday: vi.fn(),
}));

vi.mock("src/google-authorization/utilities/is-google-date-tomorrow", () => ({
    isGoogleDateTomorrow: vi.fn(),
}));

import { isGoogleDateToday } from "src/google-authorization/utilities/is-google-date-today";
import { isGoogleDateTomorrow } from "src/google-authorization/utilities/is-google-date-tomorrow";


const mockIsDateToday = vi.mocked(isGoogleDateToday);
const mockIsDateTomorrow = vi.mocked(isGoogleDateTomorrow);

// Use May 1, 2026 as the reference "today" date for all tests
// Google Events use next date for all-day events
const TODAY = new Date(2026, 4, 1); // May 1, 2026
const END_OF_TODAY = new Date(2026, 4, 2);
const TODAY_DATE_STRING = formatDateOnly(TODAY);
const END_OF_TODAY_DATE_STRING = formatDateOnly(END_OF_TODAY);

// For testing the real isDateTomorrow function, we need to use an actual tomorrow date
const ACTUAL_TOMORROW = new Date();
const END_OF_ACTUAL_TOMORROW = new Date(ACTUAL_TOMORROW);
ACTUAL_TOMORROW.setDate(ACTUAL_TOMORROW.getDate() + 1);
END_OF_ACTUAL_TOMORROW.setDate(END_OF_ACTUAL_TOMORROW.getDate() + 2);
const ACTUAL_TOMORROW_DATE_STRING = formatDateOnly(ACTUAL_TOMORROW);
const END_OF_ACTUAL_TOMORROW_DATE_STRING = formatDateOnly(END_OF_ACTUAL_TOMORROW);

/**
 * Helper: Format date as YYYY-MM-DD for all-day events
 */
function formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Helper: Format date as ISO with time for timed events
 */
function formatDateTime(date: Date): string {
    return date.toISOString().replace('Z', '-08:00'); // Simulate timezone offset
}

const createEvent = (overrides: Partial<Event> = {}): Event => ({
    id: 'event-1',
    title: 'Test Event',
    status: 'confirmed',
    start: formatDateTime(new Date(2026, 4, 1, 14, 0)), // May 1, 2:00 PM
    end: formatDateTime(new Date(2026, 4, 1, 16, 0)), // May 1, 4:00 PM
    allDay: false,
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getEventDateString', () => {

    describe('Multi-day events', () => {
        it('should format multi-day all-day event with start and end dates', () => {
            const event = createEvent({
                start: "2026-05-10",
                end: "2026-05-20",
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe("5/10/2026 until 5/19/2026");
        });

        it('should format multi-day all-day event starting today', () => {
            const event = createEvent({
                start: "2026-05-01",
                end: "2026-05-04",
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe("Today, 5/1/2026 until 5/3/2026");
        });

        it('should format multi-day all-day event starting tomorrow', () => {
            const event = createEvent({
                start: "2026-05-02",
                end: "2026-05-04",
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe("Tomorrow, 5/2/2026 until 5/3/2026");
        });

        it('should format multi-day event with timed start and end', () => {
            const event = createEvent({
                start: "2026-05-04T16:00:00-08:00",
                end: "2026-05-06T16:00:00-08:00",
                allDay: false,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`5/4/2026, 05:00 PM until 5/6/2026, 05:00 PM`);
        });

        it('should format multi-day event with timed start and end, starting today', () => {

            const event = createEvent({
                start: "2026-05-01T16:00:00-08:00",
                end: "2026-05-03T16:00:00-08:00",
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
                start: "2026-05-02T16:00:00-08:00",
                end: "2026-05-04T16:00:00-08:00",
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
                start: TODAY_DATE_STRING,
                end: END_OF_TODAY_DATE_STRING,
                allDay: true,
            });

            mockIsDateToday.mockReturnValueOnce(true);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe('Today, All Day');
        });

        it('should format single all-day event for tomorrow', () => {
            const event = createEvent({
                start: ACTUAL_TOMORROW_DATE_STRING,
                end: END_OF_ACTUAL_TOMORROW_DATE_STRING,
                allDay: true,
            });
            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);

            expect(result).toBe('Tomorrow, All Day');
        });

        it('should format single all-day event for future date', () => {
            const event = createEvent({
                start: '2026-05-10',
                end: '2026-05-11',
                allDay: true,
            });

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe('5/10/2026, All Day');
        });

        it('should format single timed event for today with time range', () => {
            const event = {
                "id": "698g6e1l9d_20260301T040000Z",
                "title": "Saturday",
                "start": "2026-05-01T20:00:00-08:00",
                "end": "2026-05-01T21:00:00-08:00",
                "allDay": false,
                "location": "",
                "status": "confirmed"
            }

            mockIsDateToday.mockReturnValue(true);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`Today, 09:00 PM - 10:00 PM`);
        });

        it('should format single timed event for tomorrow with time range', () => {
            const event = {
                "id": "abc",
                "title": "Tomorrow Timed Event",
                "start": "2026-05-10T14:00:00-08:00",
                "end": "2026-05-10T16:00:00-08:00",
                "allDay": false,
                "location": "",
                "status": "confirmed"
            };

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(true);

            const result = getEventDateString(event);
            expect(result).toBe(`Tomorrow, 03:00 PM - 05:00 PM`);
        });

        it('should format single timed event for future date with time range', () => {

            const event = {
                "id": "abc",
                "title": "Future Timed Event May 10 2026 2 to 4 PM",
                "start": "2026-05-10T14:00:00-08:00",
                "end": "2026-05-10T16:00:00-08:00",
                "allDay": false,
                "location": "",
                "status": "confirmed"
            };

            mockIsDateToday.mockReturnValue(false);
            mockIsDateTomorrow.mockReturnValue(false);

            const result = getEventDateString(event);
            expect(result).toBe(`5/10/2026, 03:00 PM - 05:00 PM`);
        });

    });

});
