import {
    createElement,
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
    type ReactNode,
} from "react";
import { API_AUTH_URL, CLIENT_ID } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import {
    readCalendarCache,
    writeCalendarCache,
    clearCalendarCache,
} from "./google-calendar-cache";
import { type GoogleEvent, type GoogleTask } from "src/google-authorization/types";
import { useToast } from "src/toast/use-toast";
import { parseGoogleDate } from "./utilities/parse-google-date";
import { GoogleCalendarContext, type GoogleCalendarContextValue } from "./google-calendar-context";

function setDateEndOfDay(endOfDay: Date): Date {
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
};

export function GoogleCalendarProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthentication();
    const { showToast } = useToast();
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<GoogleEvent[]>([]);
    const [tasks, setTasks] = useState<GoogleTask[]>([]);
    const [isError, setIsError] = useState(false);
    const hasShownEventsErrorRef = useRef(false);
    const clientId = CLIENT_ID;

    const fetchStatus = useCallback(async (opts?: { force?: boolean }) => {

        if (!isAuthenticated) {
            setConnected(false);
            setLoading(false);
            return false;
        }

        if (!opts?.force) {
            const cached = readCalendarCache();
            if (cached !== null) {
                setConnected(cached);
                return cached;
            }
        }

        setLoading(true);

        try {
            const res = await fetch(
                `${API_AUTH_URL}/google/calendar/status`,
                { headers: await authHeaders() }
            );

            const isConnected = res.ok && Boolean((await res.json())?.connected);
            setConnected(isConnected);
            writeCalendarCache(isConnected);
            setIsError(false);
            return isConnected;
        } catch (err) {
            console.error("Calendar status check failed:", err);
            setConnected(false);
            setIsError(true);
            return false;
        } finally {
            setLoading(false);
        }
    },
        [isAuthenticated]
    );

    const disconnectCalendar = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);

        try {
            await fetch(
                `${API_AUTH_URL}/google/calendar/disconnect`,
                {
                    method: "POST",
                    headers: await authHeaders(),
                }
            );
            setConnected(false);
            clearCalendarCache();
        } catch (err) {
            console.error("Calendar disconnect failed:", err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadCalendarEvents = useCallback(async (opts?: { skipConnectionCheck?: boolean }) => {
        if (!isAuthenticated) return [];
        if (!opts?.skipConnectionCheck && !connected) {
            setEvents([]);
            setTasks([]);
            hasShownEventsErrorRef.current = false;
            return [];
        }

        try {
            const res = await fetch(
                `${API_AUTH_URL}/google/calendar/events-and-tasks`,
                { headers: await authHeaders() }
            );
            if (!res.ok) throw new Error("Failed to load calendar events");

            const jsonObject = await res.json();
            const eventsIdSet = new Set<string>();
            const eventsData = jsonObject.events.map((event: GoogleEvent) => ({
                ...event,
                itemType: "google-event",
                startDate: parseGoogleDate(event.start),
                // google end dates are exclusive for all-day events,
                // Example start: 2026-05-01 (all-day event on May 1st), end: 2026-05-02, we want to show the end date as May 1st since that's the last day the event is active
                // endDate for 2026-05-02 should be parsed as 2026-05-01T22:59:59.999-08:00
                // For timed events, end date is inclusive so we can parse normally
                endDate: event.allDay ?
                    setDateEndOfDay(new Date(parseGoogleDate(event.end).getTime() - 1)) :
                    parseGoogleDate(event.end),
            })).filter((event: GoogleEvent) => {
                if (!event.recurrenceId) {
                    return true;
                }
                if (eventsIdSet.has(event.recurrenceId)) {
                    return false;
                } else {
                    eventsIdSet.add(event.recurrenceId);
                    return true;
                }
            });

            const tasksData = jsonObject.tasks.map((task: GoogleTask) => ({
                ...task,
                itemType: "google-task",
            }));
            setEvents(eventsData);
            setTasks(tasksData);
            hasShownEventsErrorRef.current = false;
            return eventsData;
        } catch (err) {
            console.error("Loading calendar events failed:", err);
            if (!hasShownEventsErrorRef.current) {
                showToast("Failed to load calendar events and tasks", "error");
                hasShownEventsErrorRef.current = true;
            }
            setEvents([]);
            setTasks([]);
            return [];
        }
    }, [isAuthenticated, connected, showToast]);

    const initializeCalendar = useCallback(async () => {
        if (isAuthenticated) {
            const isConnected = await fetchStatus();
            if (isConnected) {
                await loadCalendarEvents({ skipConnectionCheck: true });
            } else {
                setEvents([]);
                setTasks([]);
            }
        } else {
            setConnected(false);
            setLoading(false);
            setEvents([]);
            setTasks([]);
            clearCalendarCache();
        }
    }, [isAuthenticated, fetchStatus, loadCalendarEvents]);

    const markCalendarTaskCompletion = useCallback(
        async (taskId: string, listId: string, isCompleted: boolean) => {
            if (!isAuthenticated) return;

            try {
                await fetch(`${API_AUTH_URL}/google/calendar/tasks/${listId}/${taskId}`, {
                    method: "PATCH",
                    headers: await authHeaders(),
                    body: JSON.stringify({ completed: isCompleted })
                });
            } catch (err) {
                console.error("Marking calendar task as completed failed:", err);
                showToast("Failed to update task completion status", "error");
            }
        },
        [isAuthenticated, showToast]
    );

    const hideEventForToday = useCallback(
        async (eventId: string) => {
            if (!isAuthenticated) return;

            try {
                const response = await fetch(`${API_AUTH_URL}/google/calendar/hide-event-today/${eventId}`, {
                    method: "POST",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to hide event: ${response.status}`);
                }

                setEvents(prev =>
                    prev.map(event =>
                        event.id === eventId ? { ...event, isHidden: true } : event
                    )
                );
            } catch (err) {
                console.error("Hiding calendar event failed:", err);
                showToast("Failed to hide event for today", "error");
            }
        },
        [isAuthenticated, showToast]
    );

    const unhideEventForToday = useCallback(
        async (eventId: string) => {
            if (!isAuthenticated) return;

            try {
                const response = await fetch(`${API_AUTH_URL}/google/calendar/unhide-event-today/${eventId}`, {
                    method: "POST",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to unhide event: ${response.status}`);
                }

                setEvents(prev =>
                    prev.map(event =>
                        event.id === eventId ? { ...event, isHidden: false } : event
                    )
                );
            } catch (err) {
                console.error("Unhiding calendar event failed:", err);
                showToast("Failed to unhide event for today", "error");
            }
        },
        [isAuthenticated, showToast]
    );

    const updateEvent = useCallback(
        async (updatedEvent: GoogleEvent) => {
            if (!isAuthenticated) return;

            try {
                const response = await fetch(`${API_AUTH_URL}/google/calendar/events/${updatedEvent.id}`, {
                    method: "PATCH",
                    headers: await authHeaders(),
                    body: JSON.stringify(updatedEvent),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update event: ${response.status}`);
                }

                const updatedEventFromServer = await response.json();

                setEvents(prev =>
                    prev.map(event =>
                        event.id === updatedEvent.id ? {
                            ...event,
                            ...updatedEventFromServer.event
                        } : event
                    )
                );
            } catch (err) {
                console.error("Caught error. Updating calendar event failed:", err);
                throw err;
            }
        },
        [isAuthenticated]
    );

    useEffect(() => {
        void initializeCalendar();
    }, [initializeCalendar]);

    const refreshStatus = useCallback(() => fetchStatus({ force: true }), [fetchStatus]);

    const value = useMemo<GoogleCalendarContextValue>(() => ({
        connected,
        loading,
        refreshStatus,
        disconnectCalendar,
        initializeCalendar,
        loadCalendarEvents,
        markCalendarTaskCompletion,
        hideEventForToday,
        unhideEventForToday,
        updateEvent,
        events,
        tasks,
        isError,
        setIsError,
        clientId,
    }), [
        connected,
        loading,
        refreshStatus,
        disconnectCalendar,
        initializeCalendar,
        loadCalendarEvents,
        markCalendarTaskCompletion,
        hideEventForToday,
        unhideEventForToday,
        updateEvent,
        events,
        tasks,
        isError,
        clientId,
    ]);

    return createElement(GoogleCalendarContext.Provider, { value }, children);
}
