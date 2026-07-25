export const GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.calendars.readonly",
] as const;

export const GOOGLE_CALENDAR_SCOPE_REQUEST = GOOGLE_CALENDAR_SCOPES.join(" ");
