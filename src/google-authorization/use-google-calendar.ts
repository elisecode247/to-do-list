import { useEffect, useState, useCallback } from "react";
import { API_AUTH_URL } from "src/app/constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import {
    readCalendarCache,
    writeCalendarCache,
    clearCalendarCache,
} from "./google-calendar-cache";
import { type Task, type Event } from "src/google-authorization/types";
import { useToast } from "src/toast/use-toast";

export function useCalendarIntegration() {
    const { isAuthenticated } = useAuthentication();
    const { showToast } = useToast();
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

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

                const isConnected = res.ok && Boolean((await res.json())?.connected);
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
                setTasks([]);
                clearCalendarCache();
            }
        };
        initializeCalendar();
    }, [isAuthenticated, fetchStatus, connected]);

    const loadCalendarEvents = useCallback(async () => {
        if (!isAuthenticated) return [];
        if (!connected) {
            setEvents([]);
            setTasks([]);
            return [];
        }

        try {
            const res = await fetch(
                `${API_AUTH_URL}/google/calendar/events-and-tasks`,
                { headers: await authHeaders() }
            );
            if (!res.ok) throw new Error("Failed to load calendar events");
            const jsonObject = await res.json();
            setEvents(jsonObject.events);
            setTasks(jsonObject.tasks);
        } catch (err) {
            console.error("Loading calendar events failed:", err);
            setEvents([]);
            setTasks([]);
        }
    }, [isAuthenticated, connected]);

    const markScheduledTaskCompletion = useCallback(
        async (taskId: string, listId: string, isCompleted: boolean) => {
            if (!isAuthenticated) return;

            try {
                await fetch(`${API_AUTH_URL}/google/calendar/${listId}/${taskId}`, {
                    method: "PATCH",
                    headers: await authHeaders(),
                    body: JSON.stringify({ completed: isCompleted })
                });
            } catch (err) {
                console.error("Marking scheduled task as completed failed:", err);
                showToast("Failed to update task completion status", "error");
            }
        },
        [isAuthenticated]
    );



    return {
        connected,
        loading,
        refreshStatus: () => fetchStatus({ force: true }),
        disconnectCalendar,
        loadCalendarEvents,
        markScheduledTaskCompletion,
        events,
        tasks
    };
}
