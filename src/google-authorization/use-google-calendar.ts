import { useEffect, useState, useCallback } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import {
    readCalendarCache,
    writeCalendarCache,
    clearCalendarCache,
} from "./google-calendar-cache";

type Event = {
    id: string;
    start: string;
    end: string;
    title: string;
    status: string;
    allDay: boolean;
    description?: string;
    location?: string;
};
export function useCalendarIntegration() {
    const { isAuthenticated } = useAuthentication();
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);

    const fetchStatus = useCallback(
        async (opts?: { force?: boolean }) => {
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

                const isConnected =
                    res.ok && Boolean((await res.json())?.connected);

                setConnected(isConnected);
                writeCalendarCache(isConnected);
                return isConnected;
            } catch (err) {
                console.error("Calendar status check failed:", err);
                setConnected(false);
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

    useEffect(() => {
        const initializeCalendar = async () => {
            if (isAuthenticated) {
                await fetchStatus();
                await loadCalendarEvents();
            } else {
                setConnected(false);
                setLoading(false);
                setEvents([]);
                clearCalendarCache();
            }
        };
        initializeCalendar();
    }, [isAuthenticated, fetchStatus]);

    const loadCalendarEvents = useCallback(async () => {
        if (!isAuthenticated) return [];
        if (!connected) {
            setEvents([]);
            return [];
        }

        try {
            const res = await fetch(
                `${API_AUTH_URL}/google/calendar/events-and-tasks`,
                { headers: await authHeaders() }
            );
            if (!res.ok) throw new Error("Failed to load calendar events");
            const jsonObject = await res.json();
            console.log("%c Line:115 🥒 jsonObject", "color:#6ec1c2", jsonObject);
            setEvents(jsonObject.events);
        } catch (err) {
            console.error("Loading calendar events failed:", err);
            setEvents([]);
        }
    }, [isAuthenticated]);

    return {
        connected,
        loading,
        refreshStatus: () => fetchStatus({ force: true }),
        disconnectCalendar,
        loadCalendarEvents,
        events
    };
}
